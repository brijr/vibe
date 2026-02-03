import { db } from ".";
import { organizations } from "./schema";
import { eq } from "drizzle-orm";

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
