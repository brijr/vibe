"use client";

import { useTransition } from "react";
import { createDocument } from "@/actions/documents";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Field,
  FieldLabel,
  FieldError,
  FieldGroup,
  FieldDescription,
} from "@/components/ui/field";
import { toast } from "sonner";

export function DocumentForm() {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;

    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    startTransition(async () => {
      try {
        await createDocument({ title, description: description || undefined });
        toast.success("Document created");
      } catch (error) {
        toast.error("Failed to create document");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="title">Title</FieldLabel>
          <Input
            id="title"
            name="title"
            placeholder="Document title"
            required
          />
          <FieldDescription>
            Give your document a descriptive title.
          </FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="description">Description</FieldLabel>
          <Textarea
            id="description"
            name="description"
            placeholder="Optional description"
            rows={4}
          />
          <FieldDescription>
            Add more context about this document.
          </FieldDescription>
        </Field>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Creating..." : "Create Document"}
        </Button>
      </FieldGroup>
    </form>
  );
}
