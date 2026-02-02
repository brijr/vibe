"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { db } from "@/lib/db";
import { user, organizations, activityLogs } from "@/lib/db/schema";
import { requireUser, requireOrg } from "@/lib/auth-helpers";
import { eq } from "drizzle-orm";
import { settingsSchema, organizationSettingsSchema } from "@/lib/validators";
import type { SettingsInput, OrganizationSettingsInput } from "@/lib/validators";

export async function updateUserSettings(input: SettingsInput) {
  const currentUser = await requireUser();
  const validated = settingsSchema.parse(input);

  await db
    .update(user)
    .set({
      name: validated.name,
      updatedAt: new Date(),
    })
    .where(eq(user.id, currentUser.id));

  revalidatePath("/settings");
}

export async function updateOrganizationSettings(
  input: OrganizationSettingsInput
) {
  const { user: currentUser, organizationId } = await requireOrg();
  const validated = organizationSettingsSchema.parse(input);

  await db
    .update(organizations)
    .set({
      name: validated.name,
      settings: {
        aiModel: validated.aiModel,
        features: validated.features,
      },
      updatedAt: new Date(),
    })
    .where(eq(organizations.id, organizationId));

  after(async () => {
    await db.insert(activityLogs).values({
      organizationId,
      userId: currentUser.id,
      action: "organization.settings_updated",
      resourceType: "organization",
      resourceId: organizationId,
    });
  });

  revalidatePath("/settings");
}
