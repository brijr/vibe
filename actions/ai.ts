"use server";

import { after } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { documents, activityLogs } from "@/lib/db/schema";
import { requireOrg } from "@/lib/auth-helpers";
import { eq, and } from "drizzle-orm";
import { analyzeDocument } from "@/lib/ai/client";
import { getPromptForType } from "@/lib/ai/prompts";

export async function startDocumentAnalysis(
  documentId: string,
  analysisType: "general" | "legal" | "summary" = "general"
) {
  const { user, organizationId } = await requireOrg();

  const document = await db.query.documents.findFirst({
    where: and(
      eq(documents.id, documentId),
      eq(documents.organizationId, organizationId)
    ),
  });

  if (!document) {
    throw new Error("Document not found");
  }

  await db
    .update(documents)
    .set({ status: "processing", updatedAt: new Date() })
    .where(eq(documents.id, documentId));

  after(async () => {
    try {
      const content = document.description || document.title;
      const prompt = getPromptForType(analysisType, content);
      const result = await analyzeDocument(content, prompt);

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

      await db.insert(activityLogs).values({
        organizationId,
        userId: user.id,
        action: "document.analyzed",
        resourceType: "document",
        resourceId: documentId,
        metadata: { analysisType, model: result.model },
      });
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
  });

  revalidatePath(`/documents/${documentId}`);
  return { status: "processing" };
}
