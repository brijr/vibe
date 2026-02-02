"use client";

import { useTransition } from "react";
import { updateUserSettings } from "@/actions/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldGroup, FieldDescription } from "@/components/ui/field";
import { toast } from "sonner";

interface SettingsFormProps {
  defaultValues: {
    name: string;
    email: string;
  };
}

export function SettingsForm({ defaultValues }: SettingsFormProps) {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;

    startTransition(async () => {
      try {
        await updateUserSettings({ name, email });
        toast.success("Settings updated");
      } catch (error) {
        toast.error("Failed to update settings");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="name">Name</FieldLabel>
          <Input
            id="name"
            name="name"
            defaultValue={defaultValues.name}
            required
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={defaultValues.email}
            disabled
          />
          <FieldDescription>
            Email cannot be changed at this time.
          </FieldDescription>
        </Field>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save Changes"}
        </Button>
      </FieldGroup>
    </form>
  );
}
