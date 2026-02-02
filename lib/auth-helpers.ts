import { cache } from "react";
import { headers } from "next/headers";
import { auth } from "./auth";
import { db } from "./db";
import { user } from "./db/schema";
import { eq } from "drizzle-orm";

export const getServerSession = cache(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session;
});

export const getCurrentUser = cache(async () => {
  const session = await getServerSession();
  if (!session?.user) return null;

  const dbUser = await db.query.user.findFirst({
    where: eq(user.id, session.user.id),
    with: {
      organization: true,
    },
  });

  return dbUser;
});

export async function requireUser() {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("Unauthorized");
  return currentUser;
}

export async function requireOrg() {
  const currentUser = await requireUser();
  if (!currentUser.organizationId) throw new Error("No organization");
  return { user: currentUser, organizationId: currentUser.organizationId };
}
