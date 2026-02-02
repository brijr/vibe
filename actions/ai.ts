"use server";

import { after } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { projects, activityLogs } from "@/lib/db/schema";
import { requireOrg } from "@/lib/auth-helpers";
import { eq, and } from "drizzle-orm";
import { analyzeContent } from "@/lib/ai/client";
import { getPromptForType } from "@/lib/ai/prompts";

export async function startProjectAnalysis(
  projectId: string,
  analysisType: "general" | "summary" | "extract" = "general"
) {
  const { user, organizationId } = await requireOrg();

  const project = await db.query.projects.findFirst({
    where: and(
      eq(projects.id, projectId),
      eq(projects.organizationId, organizationId)
    ),
  });

  if (!project) {
    throw new Error("Project not found");
  }

  await db
    .update(projects)
    .set({ status: "processing", updatedAt: new Date() })
    .where(eq(projects.id, projectId));

  after(async () => {
    try {
      const content = project.content || project.description || project.title;
      const prompt = getPromptForType(analysisType, content);
      const result = await analyzeContent(content, prompt);

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

      await db.insert(activityLogs).values({
        organizationId,
        userId: user.id,
        action: "project.analyzed",
        resourceType: "project",
        resourceId: projectId,
        metadata: { analysisType, model: result.model },
      });
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
  });

  revalidatePath(`/projects/${projectId}`);
  return { status: "processing" };
}
