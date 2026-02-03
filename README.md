# Vibe Starter

A minimal Next.js 16 SaaS starter with authentication, database, AI, and file uploads.

## Stack

- **Next.js 16** - App Router, React 19, Turbopack
- **Neon + Drizzle** - Serverless Postgres with type-safe ORM
- **Better Auth** - Email/password authentication
- **Vercel AI SDK** - Multi-provider AI via AI Gateway
- **Vercel Blob** - File storage
- **Tailwind v4 + shadcn/ui** - Styling with Base UI components

---

## Quick Start

```bash
bun install                    # Install dependencies
cp .env.example .env           # Set up environment variables
bun db:push                    # Create database tables
bun dev                        # Start dev server at localhost:3000
```

---

## Project Structure

```
├── app/
│   ├── (auth)/                 # Public routes (sign-in, sign-up)
│   ├── (app)/                  # Protected routes (requires auth)
│   │   ├── dashboard/          # Main dashboard
│   │   └── settings/           # User settings
│   └── api/
│       ├── auth/[...all]/      # Better Auth handler
│       └── upload/             # File upload endpoint
│
├── lib/
│   ├── db/
│   │   ├── index.ts            # Database connection
│   │   ├── schema.ts           # Table definitions
│   │   └── queries.ts          # Reusable queries
│   ├── ai/
│   │   └── client.ts           # AI generation helper
│   ├── auth.ts                 # Better Auth server config
│   ├── auth-client.ts          # Client-side auth (signIn, signOut, useSession)
│   ├── auth-helpers.ts         # Server helpers (getCurrentUser, requireUser, requireOrg)
│   ├── blob.ts                 # File upload utilities
│   ├── validators.ts           # Zod schemas
│   └── utils.ts                # Utilities (cn, formatDate)
│
├── components/
│   ├── ui/                     # shadcn/ui components
│   ├── layout/                 # Sidebar, Header, MobileNav
│   └── forms/                  # Form components
│
├── actions/                    # Server actions
└── types/                      # TypeScript types
```

---

## Patterns

### Adding a Database Table

```typescript
// lib/db/schema.ts
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { organizations } from "./schema";

export const posts = pgTable("posts", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  organizationId: text("organization_id")
    .references(() => organizations.id, { onDelete: "cascade" })
    .notNull(),
  title: text("title").notNull(),
  content: text("content"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const postsRelations = relations(posts, ({ one }) => ({
  organization: one(organizations, {
    fields: [posts.organizationId],
    references: [organizations.id],
  }),
}));
```

Then sync to database:

```bash
bun db:push
```

---

### Creating a Server Action

```typescript
// actions/posts.ts
"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";
import { requireOrg } from "@/lib/auth-helpers";
import { z } from "zod";

const createPostSchema = z.object({
  title: z.string().min(1).max(255),
  content: z.string().optional(),
});

export async function createPost(input: z.infer<typeof createPostSchema>) {
  const { organizationId } = await requireOrg();
  const validated = createPostSchema.parse(input);

  const [post] = await db
    .insert(posts)
    .values({ ...validated, organizationId })
    .returning();

  revalidatePath("/posts");
  return post;
}

export async function deletePost(id: string) {
  const { organizationId } = await requireOrg();

  await db.delete(posts).where(
    and(eq(posts.id, id), eq(posts.organizationId, organizationId))
  );

  revalidatePath("/posts");
}
```

---

### Adding a Protected Page

```typescript
// app/(app)/posts/page.tsx
import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";
import { requireOrg } from "@/lib/auth-helpers";
import { eq } from "drizzle-orm";

export default async function PostsPage() {
  const { organizationId } = await requireOrg();

  const allPosts = await db.query.posts.findMany({
    where: eq(posts.organizationId, organizationId),
    orderBy: (posts, { desc }) => [desc(posts.createdAt)],
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Posts</h1>
      <div className="grid gap-4">
        {allPosts.map((post) => (
          <div key={post.id} className="p-4 border rounded-lg">
            <h2 className="font-semibold">{post.title}</h2>
            <p className="text-muted-foreground">{post.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

### Building a Form

```typescript
// components/forms/post-form.tsx
"use client";

import { useTransition } from "react";
import { createPost } from "@/actions/posts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field";
import { toast } from "sonner";

export function PostForm() {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        await createPost({
          title: formData.get("title") as string,
          content: formData.get("content") as string,
        });
        toast.success("Post created");
        e.currentTarget.reset();
      } catch {
        toast.error("Failed to create post");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="title">Title</FieldLabel>
          <Input id="title" name="title" required />
        </Field>
        <Field>
          <FieldLabel htmlFor="content">Content</FieldLabel>
          <Textarea id="content" name="content" rows={4} />
        </Field>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Creating..." : "Create Post"}
        </Button>
      </FieldGroup>
    </form>
  );
}
```

---

### Using AI

```typescript
import { generate } from "@/lib/ai/client";

// Basic usage
const result = await generate("Summarize this text: ...");
console.log(result.output);

// With system prompt
const result = await generate("Write a tagline for a coffee shop", {
  system: "You are a creative copywriter",
});

// With different model
const result = await generate("Explain quantum computing", {
  model: "openai/gpt-4o",
});
```

**Available models:**

| Model | ID |
|-------|-----|
| Claude Sonnet 4.5 | `anthropic/claude-sonnet-4.5` (default) |
| Claude Opus 4.5 | `anthropic/claude-opus-4.5` |
| GPT-4o | `openai/gpt-4o` |
| Gemini 2.0 Flash | `google/gemini-2.0-flash` |

---

### Uploading Files

**Server-side:**

```typescript
import { uploadFile, deleteFile, listFiles } from "@/lib/blob";

// Upload
const blob = await uploadFile(file, "documents/report.pdf");
console.log(blob.url);        // Public URL
console.log(blob.downloadUrl); // Force download URL

// Delete
await deleteFile(blob.url);

// List files in a folder
const files = await listFiles("documents/");
```

**Client-side via API:**

```typescript
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

---

### Authentication

**Server-side (in Server Components or Actions):**

```typescript
import { getCurrentUser, requireUser, requireOrg } from "@/lib/auth-helpers";

// Get user if logged in, null otherwise
const user = await getCurrentUser();

// Require authentication (throws + redirects if not logged in)
const user = await requireUser();

// Require organization membership
const { user, organizationId } = await requireOrg();
```

**Client-side:**

```typescript
import { useSession, signIn, signOut } from "@/lib/auth-client";

// Hook for session state
const { data: session, isPending } = useSession();

// Sign in
await signIn.email({
  email: "user@example.com",
  password: "password123",
});

// Sign out
await signOut();
```

---

### Adding Navigation

```typescript
// components/layout/sidebar.tsx
import { Home03Icon, File01Icon, Settings01Icon } from "@hugeicons/core-free-icons";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home03Icon },
  { name: "Posts", href: "/posts", icon: File01Icon },      // Add your route
  { name: "Settings", href: "/settings", icon: Settings01Icon },
];
```

---

## Environment Variables

| Variable | Description | How to get |
|----------|-------------|------------|
| `DATABASE_URL` | Neon Postgres connection string | [neon.tech](https://neon.tech) dashboard |
| `BETTER_AUTH_SECRET` | Auth encryption key (min 32 chars) | `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | Your app URL | `http://localhost:3000` for dev |
| `AI_GATEWAY_API_KEY` | Vercel AI Gateway key | [Vercel AI settings](https://vercel.com/docs/ai) |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob token | Vercel dashboard → Storage |
| `NEXT_PUBLIC_APP_URL` | Public app URL | Same as `BETTER_AUTH_URL` |

---

## Commands

```bash
bun dev           # Start development server
bun build         # Build for production
bun start         # Start production server
bun lint          # Run ESLint

bun db:push       # Push schema changes to database
bun db:generate   # Generate migration files
bun db:studio     # Open Drizzle Studio (database GUI)
```

---

## Conventions

| What | Convention | Example |
|------|------------|---------|
| Files | kebab-case | `post-form.tsx` |
| Components | PascalCase | `PostForm` |
| Server Actions | camelCase | `createPost` |
| Route Groups | `(name)` | `(app)` = protected, `(auth)` = public |
| Server Components | Default | `page.tsx`, `layout.tsx` |
| Client Components | `"use client"` directive | Interactive forms, hooks |

**Where to put things:**

- **Database tables** → `lib/db/schema.ts`
- **Server actions** → `actions/`
- **API routes** → `app/api/`
- **Protected pages** → `app/(app)/`
- **Public pages** → `app/(auth)/` or `app/`
- **Reusable components** → `components/`
- **Validation schemas** → `lib/validators.ts`
- **Types** → `types/index.ts`
