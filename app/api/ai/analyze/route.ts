import { waitUntil } from "@vercel/functions";
import { db } from "@/lib/db";
import { projects } from "@/lib/db/schema";
import { analyzeContent } from "@/lib/ai/client";
import { eq } from "drizzle-orm";
import { getServerSession } from "@/lib/auth-helpers";

export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId, content } = await req.json();

  if (!projectId) {
    return Response.json({ error: "Project ID required" }, { status: 400 });
  }

  await db
    .update(projects)
    .set({ status: "processing", updatedAt: new Date() })
    .where(eq(projects.id, projectId));

  waitUntil(
    (async () => {
      try {
        const result = await analyzeContent(
          content || "No content provided for analysis"
        );

        await db
          .update(projects)
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
          .where(eq(projects.id, projectId));
      } catch (error) {
        console.error("AI analysis failed:", error);
        await db
          .update(projects)
          .set({
            status: "failed",
            updatedAt: new Date(),
          })
          .where(eq(projects.id, projectId));
      }
    })()
  );

  return Response.json({ status: "processing", projectId });
}
