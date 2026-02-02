"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { db } from "@/lib/db";
import { projects, activityLogs } from "@/lib/db/schema";
import { requireOrg } from "@/lib/auth-helpers";
import { eq, and } from "drizzle-orm";
import { createProjectSchema } from "@/lib/validators";
import { createId } from "@paralleldrive/cuid2";
import type { CreateProjectInput } from "@/lib/validators";

export async function createProject(input: CreateProjectInput) {
  const { user, organizationId } = await requireOrg();
  const validated = createProjectSchema.parse(input);

  const id = createId();

  await db.insert(projects).values({
    id,
    organizationId,
    createdById: user.id,
    ...validated,
  });

  after(async () => {
    await db.insert(activityLogs).values({
      organizationId,
      userId: user.id,
      action: "project.created",
      resourceType: "project",
      resourceId: id,
    });
  });

  revalidatePath("/projects");
  redirect(`/projects/${id}`);
}

export async function getProjects() {
  const { organizationId } = await requireOrg();

  return db.query.projects.findMany({
    where: eq(projects.organizationId, organizationId),
    orderBy: (projects, { desc }) => [desc(projects.createdAt)],
    with: {
      createdBy: true,
    },
  });
}

export async function getProject(id: string) {
  const { organizationId } = await requireOrg();

  return db.query.projects.findFirst({
    where: and(
      eq(projects.id, id),
      eq(projects.organizationId, organizationId)
    ),
    with: {
      createdBy: true,
    },
  });
}

export async function deleteProject(id: string) {
  const { user, organizationId } = await requireOrg();

  await db
    .delete(projects)
    .where(
      and(eq(projects.id, id), eq(projects.organizationId, organizationId))
    );

  after(async () => {
    await db.insert(activityLogs).values({
      organizationId,
      userId: user.id,
      action: "project.deleted",
      resourceType: "project",
      resourceId: id,
    });
  });

  revalidatePath("/projects");
}

export async function updateProjectStatus(
  id: string,
  status: "pending" | "processing" | "completed" | "failed"
) {
  const { organizationId } = await requireOrg();

  await db
    .update(projects)
    .set({ status, updatedAt: new Date() })
    .where(
      and(eq(projects.id, id), eq(projects.organizationId, organizationId))
    );

  revalidatePath("/projects");
  revalidatePath(`/projects/${id}`);
}
