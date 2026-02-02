import { db } from ".";
import { projects, organizations, activityLogs } from "./schema";
import { eq, and, desc } from "drizzle-orm";

export async function getProjectsByOrg(organizationId: string) {
  return db.query.projects.findMany({
    where: eq(projects.organizationId, organizationId),
    orderBy: [desc(projects.createdAt)],
    with: {
      createdBy: true,
    },
  });
}

export async function getProjectById(id: string, organizationId: string) {
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
