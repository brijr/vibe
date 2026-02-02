import { db } from ".";
import { documents, organizations, activityLogs } from "./schema";
import { eq, and, desc } from "drizzle-orm";

export async function getDocumentsByOrg(organizationId: string) {
  return db.query.documents.findMany({
    where: eq(documents.organizationId, organizationId),
    orderBy: [desc(documents.createdAt)],
    with: {
      createdBy: true,
    },
  });
}

export async function getDocumentById(id: string, organizationId: string) {
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

export async function getOrganizationBySlug(slug: string) {
  return db.query.organizations.findFirst({
    where: eq(organizations.slug, slug),
  });
}

export async function getOrganizationById(id: string) {
  return db.query.organizations.findFirst({
    where: eq(organizations.id, id),
  });
}

export async function getRecentActivityLogs(
  organizationId: string,
  limit = 10
) {
  return db.query.activityLogs.findMany({
    where: eq(activityLogs.organizationId, organizationId),
    orderBy: [desc(activityLogs.createdAt)],
    limit,
    with: {
      user: true,
    },
  });
}
