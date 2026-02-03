# CLAUDE.md

Project-specific instructions for AI agents working with this codebase.

## Critical Rules

1. **Never import server-only code in Client Components**
   - `lib/db/*`, `lib/auth.ts`, `lib/auth-helpers.ts` are server-only
   - Client Components have `"use client"` directive

2. **Always validate input with Zod before database writes**
   - Check `lib/validators.ts` for existing schemas
   - Create new schemas there if needed

3. **Always use `@/` path aliases**
   - `@/components`, `@/lib`, `@/actions`, etc.

4. **Use ds.tsx for layouts**
   - Import from `@/components/ds`
   - See Design System section below

5. **Keep mutations in Server Actions**
   - Place in `actions/` directory
   - Call from Client Components with `startTransition`
   - Call `revalidatePath()` after mutations

## Files to Never Auto-Modify

| File | Reason |
|------|--------|
| `lib/auth.ts` | Auth configuration - requires careful changes |
| `lib/db/schema.ts` | Database schema - requires `bun db:push` after changes |
| `lib/db/index.ts` | Database connection singleton |
| `.env` / `.env.example` | Environment variables - never commit secrets |
| `drizzle.config.ts` | Drizzle ORM configuration |
| `components/ui/*` | shadcn/ui components - update via CLI only |

## Before Making Changes

1. Read the relevant existing files first
2. Check `lib/validators.ts` for existing Zod schemas
3. Check `lib/db/queries.ts` for existing database queries
4. Check `actions/` for existing server actions
5. Check `components/ui/` for existing UI components

## Common Task Recipes

### Add a New Page

```tsx
// app/(app)/items/page.tsx
import { getCurrentUser } from "@/lib/auth-helpers";
import { Container } from "@/components/ds";

export default async function ItemsPage() {
  const user = await getCurrentUser();

  return (
    <div className="max-w-md">
      <h1 className="font-mono text-sm">Items</h1>
      {/* content */}
    </div>
  );
}
```

### Add a New API Route

```ts
// app/api/items/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-helpers";

export async function GET(request: NextRequest) {
  const user = await requireUser();
  // ... fetch data
  return NextResponse.json({ items: [] });
}

export async function POST(request: NextRequest) {
  const user = await requireUser();
  const body = await request.json();
  // ... validate and create
  return NextResponse.json({ success: true });
}
```

### Add a Database Table

```ts
// 1. Add to lib/db/schema.ts
export const items = pgTable("items", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  organizationId: text("organization_id")
    .references(() => organizations.id, { onDelete: "cascade" })
    .notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 2. Run: bun db:push
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

const schema = z.object({ name: z.string().min(1).max(255) });

export async function createItem(input: z.infer<typeof schema>) {
  const { organizationId } = await requireOrg();
  const validated = schema.parse(input);

  await db.insert(items).values({
    name: validated.name,
    organizationId,
  });

  revalidatePath("/items");
}
```

### Add a Form Component

```tsx
// components/forms/item-form.tsx
"use client";

import { useTransition } from "react";
import { createItem } from "@/actions/items";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field";
import { toast } from "sonner";

export function ItemForm() {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;

    startTransition(async () => {
      try {
        await createItem({ name });
        toast.success("Item created");
      } catch {
        toast.error("Failed to create item");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="name">Name</FieldLabel>
          <Input id="name" name="name" required />
        </Field>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Creating..." : "Create"}
        </Button>
      </FieldGroup>
    </form>
  );
}
```

## Error Handling Patterns

### Server Actions

```ts
// Option 1: Return error object
export async function createItem(input: Input) {
  try {
    // ... create item
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to create item" };
  }
}

// Option 2: Throw (caught by error boundary)
export async function createItem(input: Input) {
  const validated = schema.parse(input); // throws on invalid
  await db.insert(items).values(validated); // throws on DB error
}
```

### Client Components

```tsx
// Use toast for user feedback
import { toast } from "sonner";

startTransition(async () => {
  try {
    await createItem({ name });
    toast.success("Item created");
  } catch {
    toast.error("Failed to create item");
  }
});
```

### Form Validation

```tsx
import { FieldError } from "@/components/ui/field";

const [errors, setErrors] = useState<{ name?: string }>({});

// In form
{errors.name && <FieldError>{errors.name}</FieldError>}
```

## Design System (ds.tsx)

Import from `@/components/ds`:

| Component | Usage |
|-----------|-------|
| `Layout` | Root HTML wrapper (used in `app/layout.tsx`) |
| `Main` | Main content wrapper |
| `Container` | Centered content with max-width. Props: `size="2xl"\|"3xl"\|"4xl"\|"5xl"` |
| `Section` | Vertical section with padding |
| `Nav` | Navigation with inner container |
| `Center` | Full-screen centered (auth/error pages) |
| `Prose` | Rich text styling. Props: `isArticle`, `isSpaced` |

### Example Usage

```tsx
import { Main, Container, Center } from "@/components/ds";

// Page with container
<Main>
  <Container size="3xl">
    {/* content */}
  </Container>
</Main>

// Centered layout (auth/error)
<Center>
  <h1>404</h1>
</Center>
```

## Auth Helpers

### Server-side

```ts
import { getCurrentUser, requireUser, requireOrg } from "@/lib/auth-helpers";

const user = await getCurrentUser();        // null if not logged in
const user = await requireUser();           // throws if not logged in
const { user, organizationId } = await requireOrg(); // throws if no org
```

### Client-side

```ts
import { useSession, signIn, signOut } from "@/lib/auth-client";

const { data: session, isPending } = useSession();
await signIn.email({ email, password });
await signOut();
```

## Commands

```bash
bun dev          # Start dev server
bun build        # Production build
bun db:push      # Push schema to database
bun db:studio    # Open Drizzle Studio
```
