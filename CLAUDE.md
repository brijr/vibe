# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun dev          # Start dev server at localhost:3000
bun build        # Production build
bun lint         # Run linter

bun db:push      # Push schema changes to database
bun db:generate  # Generate migrations
bun db:studio    # Open Drizzle Studio
```

## Architecture

This is a Next.js 16 SaaS starter with App Router, using:
- **Neon + Drizzle** for serverless Postgres
- **Better Auth** for email/password authentication
- **Vercel AI SDK** with AI Gateway provider
- **Vercel Blob** for file storage
- **Tailwind v4 + shadcn/ui** for styling

### Route Structure

- `app/(app)/*` - Protected routes (auth required, has sidebar layout)
- `app/(auth)/*` - Public auth routes (sign-in, sign-up)
- `app/api/*` - Route handlers
- `app/page.tsx` - Public landing page

### Key Directories

- `actions/` - Server Actions (mutations)
- `lib/db/schema.ts` - Drizzle database schema
- `lib/db/queries.ts` - Reusable database queries
- `lib/validators.ts` - Zod validation schemas
- `components/ds.tsx` - Layout design system
- `components/ui/` - shadcn/ui components

### Server vs Client Boundary

Server-only (never import in Client Components):
- `lib/db/*`
- `lib/auth.ts`
- `lib/auth-helpers.ts`

Client Components must have `"use client"` directive.

## Critical Patterns

### Auth Helpers

```ts
// Server-side
import { getCurrentUser, requireUser, requireOrg } from "@/lib/auth-helpers";

const user = await getCurrentUser();        // null if not logged in
const user = await requireUser();           // throws if not logged in
const { user, organizationId } = await requireOrg(); // throws if no org
```

```ts
// Client-side
import { useSession, signIn, signOut } from "@/lib/auth-client";
```

### Server Actions

All mutations go in `actions/`. Always validate with Zod, always call `revalidatePath()`:

```ts
"use server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireOrg } from "@/lib/auth-helpers";
import { z } from "zod";

export async function createItem(input: { name: string }) {
  const { organizationId } = await requireOrg();
  const validated = z.object({ name: z.string().min(1) }).parse(input);
  await db.insert(items).values({ ...validated, organizationId });
  revalidatePath("/items");
}
```

### Client Forms

Use `startTransition` to call Server Actions, `toast` for feedback:

```tsx
"use client";
import { useTransition } from "react";
import { toast } from "sonner";

const [isPending, startTransition] = useTransition();

startTransition(async () => {
  try {
    await createItem({ name });
    toast.success("Created");
  } catch {
    toast.error("Failed");
  }
});
```

### Design System (ds.tsx)

Use `@/components/ds` for layouts:

| Component | Usage |
|-----------|-------|
| `Layout` | Root HTML wrapper |
| `Main` | Main content area |
| `Container` | Centered content (`size="2xl"\|"3xl"\|"4xl"\|"5xl"`) |
| `Center` | Full-screen centered (auth/error pages) |
| `Section` | Vertical section with padding |
| `Nav` | Navigation with inner container |
| `Prose` | Rich text styling |

### AI Integration

```ts
import { generate } from "@/lib/ai/client";
const result = await generate("Summarize: ...");
```

### File Uploads

```ts
import { uploadFile, deleteFile, listFiles } from "@/lib/blob";
```

## Files to Modify Carefully

| File | Reason |
|------|--------|
| `lib/db/schema.ts` | Requires `bun db:push` after changes |
| `lib/auth.ts` | Auth configuration |
| `components/ui/*` | shadcn components - prefer CLI updates |

## Conventions

- Use `@/` path aliases
- Files: kebab-case (`settings-form.tsx`)
- Components: PascalCase (`SettingsForm`)
- Server Actions: camelCase (`updateUserSettings`)
- Validate all input with Zod before database writes
- Note: `requireOrg()` throws if user has no organization; sign-up flow doesn't create orgs by default
