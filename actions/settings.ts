"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { requireUser } from "@/lib/auth-helpers";
import { eq } from "drizzle-orm";
import { settingsSchema, type SettingsInput } from "@/lib/validators";

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
