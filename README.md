# Vibe Starter

A minimal Next.js 16 SaaS starter with authentication, database, AI, and file uploads.
This repo is intended for AI agents as well as humans, so the patterns below are explicit and aligned with the codebase.

## Stack

- **Next.js 16** (App Router, React 19, Turbopack)
- **Neon + Drizzle** (serverless Postgres + type-safe ORM)
- **Better Auth** (email/password authentication)
- **Vercel AI SDK** (Vercel AI Gateway provider)
- **Vercel Blob** (file storage)
- **Tailwind v4 + shadcn/ui + Base UI** (components and styling)

## Quick Start

```bash
bun install
cp .env.example .env
bun db:push
bun dev
```

The app runs at `http://localhost:3000`.

## Environment Variables

| Variable | Description | Notes |
|----------|-------------|-------|
| `DATABASE_URL` | Neon Postgres connection string | Required for Drizzle + Better Auth tables |
| `BETTER_AUTH_SECRET` | Auth encryption key (min 32 chars) | Generate with `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | App URL | `http://localhost:3000` in dev |
| `AI_GATEWAY_API_KEY` | Vercel AI Gateway key | Used by AI SDK global provider |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob token | Required for uploads |
| `NEXT_PUBLIC_APP_URL` | Public app URL | Usually same as `BETTER_AUTH_URL` |

## Repo Map

```
app/
  (auth)/              Public auth routes (sign-in, sign-up)
  (app)/               Protected routes (requires auth)
  api/                 Route handlers (auth, uploads)
  global-error.tsx     Root error boundary
  not-found.tsx        Global 404
  layout.tsx           Root layout
  page.tsx             Marketing / landing

actions/               Server Actions
components/
  forms/               Client-side forms
  layout/              App shell (sidebar, header)
  ui/                  Base UI + shadcn components
lib/
  ai/                  AI helpers (AI SDK)
  db/                  Drizzle connection + schema + queries
  auth.ts              Better Auth config
  auth-client.ts       Client auth helpers
  auth-helpers.ts      Server auth helpers
  blob.ts              Vercel Blob helpers
  validators.ts        Zod schemas
  utils.ts             Shared utilities

types/                 Shared TypeScript types
```

## Agent Workflow (Read First)

- Treat `lib/db/*`, `lib/auth.ts`, and `lib/auth-helpers.ts` as server-only. Do not import them into Client Components.
- Keep mutations in **Server Actions** (`actions/*`) and call them from Client Components with `startTransition`.
- Validate all user input with Zod (`lib/validators.ts`) before writing to the database.
- Use `getCurrentUser()` for optional user access; use `requireUser()` to enforce auth.
- `requireOrg()` throws if the user has no organization. The current sign-up flow does not create organizations, so create one in your feature if needed.
- After mutations, call `revalidatePath()` for affected routes.
- Use `@/` path aliases.
- Keep Server Components async and data-fetching in the server. Do not add data fetching to Client Components unless necessary.

## Patterns

### Add a Database Table

```ts
// lib/db/schema.ts
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { organizations } from "./schema";

export const items = pgTable("items", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  organizationId: text("organization_id")
    .references(() => organizations.id, { onDelete: "cascade" })
    .notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const itemsRelations = relations(items, ({ one }) => ({
  organization: one(organizations, {
    fields: [items.organizationId],
    references: [organizations.id],
  }),
}));
```

Then sync to the database:

```bash
bun db:push
```

### Create a Server Action

```ts
// actions/items.ts
"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { items } from "@/lib/db/schema";
import { requireOrg } from "@/lib/auth-helpers";
import { z } from "zod";

const createItemSchema = z.object({
  name: z.string().min(1).max(255),
});

export async function createItem(input: z.infer<typeof createItemSchema>) {
  const { organizationId } = await requireOrg();
  const validated = createItemSchema.parse(input);

  await db.insert(items).values({
    name: validated.name,
    organizationId,
  });

  revalidatePath("/items");
}
```

### Add a Protected Page

Use `(app)` routes and gate access in a Server Component:

```ts
// app/(app)/layout.tsx
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-helpers";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  return <>{children}</>;
}
```

### Build a Client Form

```tsx
// components/forms/settings-form.tsx
"use client";

import { useTransition } from "react";
import { updateUserSettings } from "@/actions/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SettingsForm() {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;

    startTransition(async () => {
      await updateUserSettings({ name, email });
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <Input name="name" required />
      <Input name="email" type="email" required />
      <Button type="submit" disabled={isPending}>
        Save Changes
      </Button>
    </form>
  );
}
```

Note: disabled inputs are not included in `FormData`. If a field is required by the server action, keep it enabled, or add a hidden input that carries the value.

### Authentication

Server-side (Server Components / Actions):

```ts
import { getCurrentUser, requireUser, requireOrg } from "@/lib/auth-helpers";

const user = await getCurrentUser();
const requiredUser = await requireUser();
const { user: orgUser, organizationId } = await requireOrg();
```

Client-side:

```ts
import { useSession, signIn, signOut } from "@/lib/auth-client";

const { data: session, isPending } = useSession();
await signIn.email({ email, password });
await signOut();
```

### AI (Vercel AI SDK + Gateway)

`lib/ai/client.ts` wraps `generateText` and uses the AI Gateway global provider.
The default model is set in that file; update it there if you need a different model.

```ts
import { generate } from "@/lib/ai/client";

const result = await generate("Summarize this text: ...");
console.log(result.output);
```

If you need streaming, tools, or embeddings, create a Route Handler in `app/api/*` and follow the AI SDK docs in `node_modules/ai/docs/`.

### File Uploads (Vercel Blob)

Server-side helpers:

```ts
import { uploadFile, deleteFile, listFiles } from "@/lib/blob";

const blob = await uploadFile(file, "documents/report.pdf");
await deleteFile(blob.url);
const files = await listFiles("documents/");
```

Client-side via API:

```ts
async function upload(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  const { url } = await res.json();
  return url;
}
```

## Commands

```bash
bun dev
bun build
bun start
bun lint

bun db:push
bun db:generate
bun db:studio
```

## Conventions

| What | Convention | Example |
|------|------------|---------|
| Files | kebab-case | `settings-form.tsx` |
| Components | PascalCase | `SettingsForm` |
| Server Actions | camelCase | `updateUserSettings` |
| Route Groups | `(name)` | `(app)` is protected, `(auth)` is public |
| Client Components | `"use client"` directive | Forms, hooks |
| Server Components | default | `page.tsx`, `layout.tsx` |

## Where to Put Things

- Database tables → `lib/db/schema.ts`
- Reusable DB queries → `lib/db/queries.ts`
- Server actions → `actions/`
- API routes → `app/api/`
- Protected pages → `app/(app)/`
- Public pages → `app/(auth)/` or `app/`
- Validation schemas → `lib/validators.ts`
- Shared types → `types/`
