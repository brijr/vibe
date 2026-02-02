import { waitUntil } from "@vercel/functions";
import { db } from "@/lib/db";
import { documents } from "@/lib/db/schema";
import { analyzeDocument } from "@/lib/ai/client";
import { eq } from "drizzle-orm";
import { getServerSession } from "@/lib/auth-helpers";

export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { documentId, content } = await req.json();

  if (!documentId) {
    return Response.json({ error: "Document ID required" }, { status: 400 });
  }

  await db
    .update(documents)
    .set({ status: "processing", updatedAt: new Date() })
    .where(eq(documents.id, documentId));

  waitUntil(
    (async () => {
      try {
        const result = await analyzeDocument(
          content || "No content provided for analysis"
        );

        await db
          .update(documents)
          .set({
            status: "completed",
            aiOutput: {
              summary: result.output,
              model: result.model,
              tokensUsed: result.tokensUsed,
              processedAt: new Date().toISOString(),
            },
            updatedAt: new Date(),
          })
          .where(eq(documents.id, documentId));
      } catch (error) {
        console.error("AI analysis failed:", error);
        await db
          .update(documents)
          .set({
            status: "failed",
            updatedAt: new Date(),
          })
          .where(eq(documents.id, documentId));
      }
    })()
  );

  return Response.json({ status: "processing", documentId });
}
