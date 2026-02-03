# Vibe Starter

A minimal Next.js 16 SaaS starter with auth, database, AI, and file uploads ready to go.

## Stack

- **Next.js 16** - App Router, Turbopack, React 19
- **Neon + Drizzle** - Postgres database with type-safe ORM
- **Better Auth** - Email/password authentication
- **Vercel AI SDK** - AI Gateway for multiple providers
- **Vercel Blob** - File uploads
- **Tailwind v4 + shadcn/ui** - Styling (Radix Nova)

## Quick Start

```bash
# Install
bun install

# Set up env
cp .env.example .env

# Push schema to database
bun db:push

# Run dev server
bun dev
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Neon Postgres connection string |
| `BETTER_AUTH_SECRET` | Auth secret (min 32 chars) |
| `BETTER_AUTH_URL` | App URL |
| `AI_GATEWAY_API_KEY` | Vercel AI Gateway key |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob token |

## Structure

```
├── app/
│   ├── (auth)/           # Sign in/up pages
│   ├── (app)/            # Protected dashboard
│   └── api/              # Auth + upload routes
├── lib/
│   ├── db/schema.ts      # Database tables
│   ├── ai/client.ts      # AI helper
│   ├── blob.ts           # File upload helper
│   ├── auth.ts           # Auth config
│   └── validators.ts     # Zod schemas
└── components/
    ├── layout/           # Sidebar, header
    └── ui/               # shadcn components
```

## Patterns

### Database

```typescript
// lib/db/schema.ts - Add tables
export const items = pgTable("items", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  organizationId: text("organization_id")
    .references(() => organizations.id, { onDelete: "cascade" })
    .notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

### Server Actions

```typescript
// actions/items.ts
"use server";

import { db } from "@/lib/db";
import { items } from "@/lib/db/schema";
import { requireOrg } from "@/lib/auth-helpers";

export async function createItem(name: string) {
  const { organizationId } = await requireOrg();

  const [item] = await db
    .insert(items)
    .values({ name, organizationId })
    .returning();

  return item;
}
```

### AI

```typescript
import { generate } from "@/lib/ai/client";

const result = await generate("Summarize this text", {
  system: "You are a helpful assistant",
  model: "anthropic/claude-sonnet-4.5", // or openai/gpt-4o
});
```

### File Uploads

```typescript
import { uploadFile } from "@/lib/blob";

const blob = await uploadFile(file, "uploads/doc.pdf");
console.log(blob.url);
```

## Commands

```bash
bun dev          # Dev server
bun build        # Production build
bun db:push      # Push schema to DB
bun db:studio    # Open Drizzle Studio
```
