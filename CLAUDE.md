# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun dev              # Start dev server at localhost:3000
bun run build        # Production build (not bare `bun build` — that invokes bun's bundler)
bun lint             # Run ESLint

bun run test         # Run tests once (vitest)
bun run test:watch   # Run tests in watch mode
npx vitest run path/to/file.test.ts  # Run a single test file

bun db:push          # Push schema changes to database
bun db:generate      # Generate migrations
bun db:studio        # Open Drizzle Studio
```

## Architecture

Next.js 16 SaaS starter with App Router, using:
- **Neon + Drizzle** for serverless Postgres
- **Better Auth** for email/password authentication
- **Vercel AI SDK** with AI Gateway provider
- **Vercel Blob** for file storage
- **Tailwind v4 + shadcn/ui** (radix-nova style, hugeicons icon library)

### Route Structure

- `app/(app)/*` — Protected routes. Layout checks auth via `getCurrentUser()` and redirects to `/sign-in`. Wraps content with `SidebarProvider`, `AppSidebar`, `AppHeader`.
- `app/(auth)/*` — Public auth routes (sign-in, sign-up)
- `app/api/auth/[...all]` — Better Auth catch-all handler
- `app/api/upload` — Authenticated file upload endpoint (Vercel Blob)
- `app/page.tsx` — Public landing page

### Key Directories

- `actions/` — Server Actions (mutations)
- `lib/db/schema.ts` — Drizzle database schema
- `lib/db/queries.ts` — Reusable database queries
- `lib/validators.ts` — Zod schemas (`signInSchema`, `signUpSchema`, `settingsSchema`)
- `components/ds.tsx` — Layout design system
- `components/ui/` — shadcn/ui components
- `hooks/` — Custom React hooks

### Database Schema

Multi-tenant model with organizations:
- `organizations` — id, name, slug (unique), settings (jsonb)
- `user` — Better Auth user table extended with `organizationId` (FK to organizations) and `role` (enum: "owner", "admin", "member")
- `session`, `account`, `verification` — Better Auth tables

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
| `Prose` | Rich text styling (`isArticle`, `isSpaced` props) |

### AI Integration

```ts
import { generate } from "@/lib/ai/client";

// Default model: anthropic/claude-sonnet-4.5 via Vercel AI Gateway
const result = await generate("Summarize: ...");
// Returns: { output: string, model: string, tokensUsed: number }

// Override model or system prompt:
const result = await generate("...", { system: "You are...", model: "openai/gpt-4o" });
```

### File Uploads

```ts
import { uploadFile, deleteFile, listFiles } from "@/lib/blob";
```

## Files to Modify Carefully

| File | Reason |
|------|--------|
| `lib/db/schema.ts` | Requires `bun db:push` after changes |
| `lib/auth.ts` | Auth configuration (session expiry: 7d, cookie cache: 5min) |
| `components/ui/*` | shadcn components — prefer CLI updates |

## Conventions

- Use `@/` path aliases
- Files: kebab-case (`settings-form.tsx`)
- Components: PascalCase (`SettingsForm`)
- Server Actions: camelCase (`updateUserSettings`)
- Validate all input with Zod before database writes
- Note: `requireOrg()` throws if user has no organization; sign-up flow doesn't create orgs by default

## Environment Variables

Required:
- `DATABASE_URL` — Neon Postgres connection string
- `BETTER_AUTH_SECRET` — Auth encryption key (min 32 chars)
- `BETTER_AUTH_URL` — App URL (`http://localhost:3000` in dev)
- `AI_GATEWAY_API_KEY` — Vercel AI Gateway key
- `BLOB_READ_WRITE_TOKEN` — Vercel Blob token
- `NEXT_PUBLIC_APP_URL` — Public app URL
