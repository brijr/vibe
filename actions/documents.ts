"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { db } from "@/lib/db";
import { documents, activityLogs } from "@/lib/db/schema";
import { requireOrg } from "@/lib/auth-helpers";
import { eq, and } from "drizzle-orm";
import { createDocumentSchema } from "@/lib/validators";
import { createId } from "@paralleldrive/cuid2";
import type { CreateDocumentInput } from "@/lib/validators";

export async function createDocument(input: CreateDocumentInput) {
  const { user, organizationId } = await requireOrg();
  const validated = createDocumentSchema.parse(input);

  const id = createId();

  await db.insert(documents).values({
    id,
    organizationId,
    createdById: user.id,
    ...validated,
  });

  after(async () => {
    await db.insert(activityLogs).values({
      organizationId,
      userId: user.id,
      action: "document.created",
      resourceType: "document",
      resourceId: id,
    });
  });

  revalidatePath("/documents");
  redirect(`/documents/${id}`);
}

export async function getDocuments() {
  const { organizationId } = await requireOrg();

  return db.query.documents.findMany({
    where: eq(documents.organizationId, organizationId),
    orderBy: (documents, { desc }) => [desc(documents.createdAt)],
    with: {
      createdBy: true,
    },
  });
}

export async function getDocument(id: string) {
  const { organizationId } = await requireOrg();

  return db.query.documents.findFirst({
    where: and(
      eq(documents.id, id),
      eq(documents.organizationId, organizationId)
    ),
    with: {
      createdBy: true,
    },
  });
}

export async function deleteDocument(id: string) {
  const { user, organizationId } = await requireOrg();

  await db
    .delete(documents)
    .where(
      and(eq(documents.id, id), eq(documents.organizationId, organizationId))
    );

  after(async () => {
    await db.insert(activityLogs).values({
      organizationId,
      userId: user.id,
      action: "document.deleted",
      resourceType: "document",
      resourceId: id,
    });
  });

  revalidatePath("/documents");
}

export async function updateDocumentStatus(
  id: string,
  status: "pending" | "processing" | "completed" | "failed"
) {
  const { organizationId } = await requireOrg();

  await db
    .update(documents)
    .set({ status, updatedAt: new Date() })
    .where(
      and(eq(documents.id, id), eq(documents.organizationId, organizationId))
    );

  revalidatePath("/documents");
  revalidatePath(`/documents/${id}`);
}
