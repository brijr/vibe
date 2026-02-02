# Next.js 16 SaaS Starter Spec

## Overview

Build a production-ready Next.js 16 starter for a multi-tenant SaaS application. This will be used for legal tech applications that process documents with AI, but should be generic enough to reuse.

## Tech Stack

| Layer | Choice | Notes |
|-------|--------|-------|
| Framework | Next.js 16 | App router, server actions, Turbopack default |
| Database | Neon (Postgres) | Serverless, use `@neondatabase/serverless` |
| ORM | Drizzle | Type-safe, use `drizzle-orm` + `drizzle-kit` |
| Auth | Clerk | `@clerk/nextjs` v5+, middleware-based |
| Styling | Tailwind CSS v4 + shadcn/ui | Use `npx shadcn@latest init` |
| Forms | React Hook Form + Zod | `@hookform/resolvers` for zod |
| Charts | Recharts | Dynamic import, wrap in client components |
| AI | Anthropic Claude API | `@anthropic-ai/sdk` |
| Deployment | Vercel | Use `@vercel/functions` for `waitUntil` |

## Project Structure

```
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── sign-in/[[...sign-in]]/page.tsx
│   │   │   ├── sign-up/[[...sign-up]]/page.tsx
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx
│   │   │   ├── loading.tsx              # Streaming skeleton for dashboard
│   │   │   ├── error.tsx                # Error boundary for dashboard
│   │   │   ├── page.tsx
│   │   │   ├── documents/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── loading.tsx          # Streaming skeleton for documents
│   │   │   │   ├── [id]/page.tsx
│   │   │   │   └── new/page.tsx
│   │   │   └── settings/
│   │   │       └── page.tsx
│   │   ├── api/
│   │   │   ├── webhooks/
│   │   │   │   └── clerk/route.ts
│   │   │   └── ai/
│   │   │       └── analyze/route.ts
│   │   ├── layout.tsx
│   │   ├── page.tsx (marketing landing)
│   │   ├── global-error.tsx             # Root error boundary
│   │   ├── not-found.tsx                # 404 page
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/ (shadcn - do not manually create)
│   │   ├── forms/
│   │   │   ├── document-form.tsx
│   │   │   └── settings-form.tsx
│   │   ├── charts/
│   │   │   └── stats-chart.tsx
│   │   ├── layout/
│   │   │   ├── sidebar.tsx
│   │   │   ├── header.tsx
│   │   │   └── mobile-nav.tsx
│   │   └── documents/
│   │       ├── document-card.tsx
│   │       ├── document-list.tsx
│   │       └── document-status.tsx
│   ├── lib/
│   │   ├── db/
│   │   │   ├── index.ts
│   │   │   ├── schema.ts
│   │   │   └── queries.ts
│   │   ├── ai/
│   │   │   ├── client.ts
│   │   │   └── prompts.ts
│   │   ├── auth.ts
│   │   ├── utils.ts                   # cn(), formatDate(), serializeForClient()
│   │   └── validators.ts
│   ├── actions/
│   │   ├── documents.ts
│   │   ├── settings.ts
│   │   └── ai.ts
│   ├── hooks/
│   │   ├── use-documents.ts
│   │   └── use-ai-status.ts
│   └── types/
│       └── index.ts
├── drizzle/
│   └── migrations/
├── drizzle.config.ts
├── next.config.ts
├── proxy.ts
├── .env.example
├── .env.local (gitignored)
└── package.json
```

## Database Schema

Use Drizzle with the following schema. Use `cuid2` for IDs via `@paralleldrive/cuid2`.

```typescript
// src/lib/db/schema.ts
import { pgTable, text, timestamp, boolean, jsonb, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';

// Enums
export const documentStatusEnum = pgEnum('document_status', [
  'pending',
  'processing', 
  'completed',
  'failed'
]);

export const userRoleEnum = pgEnum('user_role', ['owner', 'admin', 'member']);

// Organizations (firms/tenants)
export const organizations = pgTable('organizations', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull(),
  slug: text('slug').unique().notNull(),
  clerkOrgId: text('clerk_org_id').unique(), // optional clerk org sync
  settings: jsonb('settings').$type<OrgSettings>().default({}),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Users (synced from Clerk)
export const users = pgTable('users', {
  id: text('id').primaryKey(), // clerk user id
  email: text('email').notNull(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  imageUrl: text('image_url'),
  organizationId: text('organization_id').references(() => organizations.id, { onDelete: 'set null' }),
  role: userRoleEnum('role').default('member').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Documents
export const documents = pgTable('documents', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  organizationId: text('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  createdById: text('created_by_id').references(() => users.id, { onDelete: 'set null' }),
  title: text('title').notNull(),
  description: text('description'),
  fileUrl: text('file_url'),
  fileType: text('file_type'),
  status: documentStatusEnum('status').default('pending').notNull(),
  aiOutput: jsonb('ai_output').$type<AIOutput>(),
  metadata: jsonb('metadata').$type<DocumentMetadata>().default({}),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Activity log for audit trail
export const activityLogs = pgTable('activity_logs', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  organizationId: text('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
  action: text('action').notNull(), // 'document.created', 'document.analyzed', etc.
  resourceType: text('resource_type').notNull(), // 'document', 'organization', etc.
  resourceId: text('resource_id'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const organizationsRelations = relations(organizations, ({ many }) => ({
  users: many(users),
  documents: many(documents),
  activityLogs: many(activityLogs),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [users.organizationId],
    references: [organizations.id],
  }),
  documents: many(documents),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  organization: one(organizations, {
    fields: [documents.organizationId],
    references: [organizations.id],
  }),
  createdBy: one(users, {
    fields: [documents.createdById],
    references: [users.id],
  }),
}));
```

## Type Definitions

```typescript
// src/types/index.ts
export interface OrgSettings {
  aiModel?: 'claude-sonnet-4-5-20250929' | 'claude-opus-4-5-20251101' | 'claude-haiku-4-5-20251001';
  webhookUrl?: string;
  features?: {
    aiAnalysis?: boolean;
    bulkUpload?: boolean;
  };
}

export interface AIOutput {
  summary?: string;
  extractedFields?: Record<string, unknown>;
  confidence?: number;
  processedAt?: string;
  model?: string;
  tokensUsed?: number;
}

export interface DocumentMetadata {
  originalFilename?: string;
  fileSize?: number;
  pageCount?: number;
  uploadedAt?: string;
}

// Serialized versions for client components (Date → string)
export interface SerializedDocument {
  id: string;
  title: string;
  description: string | null;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string; // ISO string, not Date
  updatedAt: string; // ISO string, not Date
}
```

> **RSC Boundary Warning**: Date objects cannot be passed from Server to Client Components. They will silently become strings, then crash when you call `.getFullYear()` or similar methods. Always serialize dates to ISO strings on the server side:
> ```tsx
> // Server Component
> const doc = await getDocument(id);
> return <ClientCard createdAt={doc.createdAt.toISOString()} />
>
> // Client Component
> function ClientCard({ createdAt }: { createdAt: string }) {
>   const date = new Date(createdAt);
>   return <span>{date.toLocaleDateString()}</span>;
> }
> ```

## Environment Variables

```bash
# .env.example

# Database (Neon)
DATABASE_URL="postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/dbname?sslmode=require"

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_xxx"
CLERK_SECRET_KEY="sk_test_xxx"
CLERK_WEBHOOK_SECRET="whsec_xxx"

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/dashboard"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/dashboard"

# Anthropic
ANTHROPIC_API_KEY="sk-ant-xxx"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Key Implementation Files

### 1. Database Client

```typescript
// src/lib/db/index.ts
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

const sql = neon(process.env.DATABASE_URL!);

export const db = drizzle(sql, { schema });

// Alternative: simplified API (Drizzle 0.36+)
// export const db = drizzle(process.env.DATABASE_URL!, { schema });

export type Database = typeof db;
```

### 2. Drizzle Config

```typescript
// drizzle.config.ts
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/lib/db/schema.ts',
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  // Enable verbose logging in development
  verbose: true,
  // Strict mode for safer migrations
  strict: true,
});
```

### 3. Next.js Config

```typescript
// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Optimize barrel file imports (200-800ms savings on cold start)
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
      'recharts',
    ],
  },
  // Add remote image domains if needed
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
      },
    ],
  },
};

export default nextConfig;
```

### 5. Proxy (replaces Middleware in Next.js 16)

```typescript
// proxy.ts (root level - NOT middleware.ts)
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
```

> **Next.js 16 Breaking Change**: `middleware.ts` is renamed to `proxy.ts`. The file should be at the root level (same level as `package.json` or in `src/`). The function export can still be named anything, but `proxy` is recommended. Proxy now runs on Node.js runtime by default (not Edge).

### 6. Auth Helpers

```typescript
// src/lib/auth.ts
import { auth, currentUser } from '@clerk/nextjs/server';
import { cache } from 'react';
import { db } from './db';
import { users } from './db/schema';
import { eq } from 'drizzle-orm';

// React.cache() deduplicates within a single request
// Multiple calls to getCurrentUser() in the same request will only hit the DB once
export const getCurrentUser = cache(async () => {
  const { userId } = await auth();
  if (!userId) return null;

  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    with: {
      organization: true,
    },
  });

  return user;
});

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');
  return user;
}

export async function requireOrg() {
  const user = await requireUser();
  if (!user.organizationId) throw new Error('No organization');
  return { user, organizationId: user.organizationId };
}
```

### 7. Clerk Webhook Handler

```typescript
// src/app/api/webhooks/clerk/route.ts
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    throw new Error('Missing CLERK_WEBHOOK_SECRET');
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Missing svix headers', { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Webhook verification failed:', err);
    return new Response('Invalid signature', { status: 400 });
  }

  const eventType = evt.type;

  if (eventType === 'user.created' || eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;
    const primaryEmail = email_addresses.find(e => e.id === evt.data.primary_email_address_id);

    await db
      .insert(users)
      .values({
        id,
        email: primaryEmail?.email_address ?? '',
        firstName: first_name,
        lastName: last_name,
        imageUrl: image_url,
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email: primaryEmail?.email_address ?? '',
          firstName: first_name,
          lastName: last_name,
          imageUrl: image_url,
          updatedAt: new Date(),
        },
      });
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data;
    if (id) {
      await db.delete(users).where(eq(users.id, id));
    }
  }

  return new Response('OK', { status: 200 });
}
```

### 8. Server Actions Pattern

```typescript
// src/actions/documents.ts
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { after } from 'next/server';
import { db } from '@/lib/db';
import { documents, activityLogs } from '@/lib/db/schema';
import { requireOrg } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';
import { createId } from '@paralleldrive/cuid2';

const createDocumentSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  fileUrl: z.string().url().optional(),
  fileType: z.string().optional(),
});

export async function createDocument(input: z.infer<typeof createDocumentSchema>) {
  const { user, organizationId } = await requireOrg();
  const validated = createDocumentSchema.parse(input);

  const id = createId();

  await db.insert(documents).values({
    id,
    organizationId,
    createdById: user.id,
    ...validated,
  });

  // Non-blocking: log activity after response is sent
  after(async () => {
    await db.insert(activityLogs).values({
      organizationId,
      userId: user.id,
      action: 'document.created',
      resourceType: 'document',
      resourceId: id,
    });
  });

  revalidatePath('/documents');
  redirect(`/documents/${id}`);
}

export async function getDocuments() {
  const { organizationId } = await requireOrg();

  return db.query.documents.findMany({
    where: eq(documents.organizationId, organizationId),
    orderBy: (documents, { desc }) => [desc(documents.createdAt)],
    with: {
      createdBy: true,
    },
  });
}

export async function getDocument(id: string) {
  const { organizationId } = await requireOrg();

  return db.query.documents.findFirst({
    where: and(
      eq(documents.id, id),
      eq(documents.organizationId, organizationId)
    ),
    with: {
      createdBy: true,
    },
  });
}

export async function deleteDocument(id: string) {
  const { user, organizationId } = await requireOrg();

  await db.delete(documents).where(
    and(
      eq(documents.id, id),
      eq(documents.organizationId, organizationId)
    )
  );

  // Non-blocking: log activity after response is sent
  after(async () => {
    await db.insert(activityLogs).values({
      organizationId,
      userId: user.id,
      action: 'document.deleted',
      resourceType: 'document',
      resourceId: id,
    });
  });

  revalidatePath('/documents');
}
```

### 9. AI Integration

```typescript
// src/lib/ai/client.ts
import Anthropic from '@anthropic-ai/sdk';

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Latest models as of early 2026:
// - claude-opus-4-5-20251101 ($5/$25 per 1M tokens) - most capable
// - claude-sonnet-4-5-20250929 ($3/$15 per 1M tokens) - best balance
// - claude-haiku-4-5-20251001 ($0.80/$4 per 1M tokens) - fastest/cheapest

export async function analyzeDocument(content: string, prompt?: string) {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929', // or claude-opus-4-5-20251101 for complex tasks
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: prompt || `Analyze this document and extract key information:\n\n${content}`,
      },
    ],
  });

  const textContent = response.content.find(c => c.type === 'text');
  
  return {
    output: textContent?.text ?? '',
    model: response.model,
    tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
  };
}
```

### 10. Background Job with waitUntil

```typescript
// src/app/api/ai/analyze/route.ts
import { waitUntil } from '@vercel/functions';
import { db } from '@/lib/db';
import { documents } from '@/lib/db/schema';
import { analyzeDocument } from '@/lib/ai/client';
import { eq } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { documentId, content } = await req.json();

  // Update status to processing
  await db
    .update(documents)
    .set({ status: 'processing', updatedAt: new Date() })
    .where(eq(documents.id, documentId));

  // Run AI analysis in background
  waitUntil(
    (async () => {
      try {
        const result = await analyzeDocument(content);
        
        await db
          .update(documents)
          .set({
            status: 'completed',
            aiOutput: {
              summary: result.output,
              model: result.model,
              tokensUsed: result.tokensUsed,
              processedAt: new Date().toISOString(),
            },
            updatedAt: new Date(),
          })
          .where(eq(documents.id, documentId));
      } catch (error) {
        console.error('AI analysis failed:', error);
        await db
          .update(documents)
          .set({ 
            status: 'failed', 
            updatedAt: new Date() 
          })
          .where(eq(documents.id, documentId));
      }
    })()
  );

  return Response.json({ status: 'processing', documentId });
}
```

### 11. Form Component Pattern

```typescript
// src/components/forms/document-form.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTransition } from 'react';
import { createDocument } from '@/actions/documents';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { toast } from 'sonner';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function DocumentForm() {
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
    },
  });

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      try {
        await createDocument(values);
        toast.success('Document created');
      } catch (error) {
        toast.error('Failed to create document');
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Document title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Optional description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Creating...' : 'Create Document'}
        </Button>
      </form>
    </Form>
  );
}
```

### 12. Dashboard Layout

```typescript
// src/app/(dashboard)/layout.tsx
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { requireUser } from '@/lib/auth';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  return (
    <div className="flex h-screen">
      <Sidebar user={user} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header user={user} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
```

### 13. Loading States (Streaming)

```typescript
// src/app/(dashboard)/loading.tsx
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-48" />
      <div className="grid gap-4 md:grid-cols-3">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
      <Skeleton className="h-64" />
    </div>
  );
}
```

```typescript
// src/app/(dashboard)/documents/loading.tsx
import { Skeleton } from '@/components/ui/skeleton';

export default function DocumentsLoading() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16" />
        ))}
      </div>
    </div>
  );
}
```

### 14. Error Boundaries

```typescript
// src/app/(dashboard)/error.tsx
'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16">
      <h2 className="text-xl font-semibold">Something went wrong</h2>
      <p className="text-muted-foreground">
        {error.message || 'An unexpected error occurred'}
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
```

```typescript
// src/app/global-error.tsx
'use client';

import { Button } from '@/components/ui/button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center gap-4">
          <h2 className="text-xl font-semibold">Something went wrong</h2>
          <Button onClick={reset}>Try again</Button>
        </div>
      </body>
    </html>
  );
}
```

### 15. Charts with Dynamic Import

```typescript
// src/components/charts/stats-chart.tsx
'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

// Dynamic import Recharts (~300KB) to reduce initial bundle
const RechartsAreaChart = dynamic(
  () => import('recharts').then((mod) => mod.AreaChart),
  { ssr: false, loading: () => <Skeleton className="h-64 w-full" /> }
);

const Area = dynamic(() => import('recharts').then((mod) => mod.Area), {
  ssr: false,
});
const XAxis = dynamic(() => import('recharts').then((mod) => mod.XAxis), {
  ssr: false,
});
const YAxis = dynamic(() => import('recharts').then((mod) => mod.YAxis), {
  ssr: false,
});
const Tooltip = dynamic(() => import('recharts').then((mod) => mod.Tooltip), {
  ssr: false,
});
const ResponsiveContainer = dynamic(
  () => import('recharts').then((mod) => mod.ResponsiveContainer),
  { ssr: false }
);

interface StatsChartProps {
  data: { date: string; count: number }[];
}

export function StatsChart({ data }: StatsChartProps) {
  return (
    <ResponsiveContainer width="100%" height={256}>
      <RechartsAreaChart data={data}>
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Area
          type="monotone"
          dataKey="count"
          stroke="hsl(var(--primary))"
          fill="hsl(var(--primary) / 0.2)"
        />
      </RechartsAreaChart>
    </ResponsiveContainer>
  );
}
```

## Setup Commands

Run these in order after scaffolding:

```bash
# 1. Create Next.js 16 app (Turbopack is now default)
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

# 2. Install dependencies
pnpm add @clerk/nextjs @neondatabase/serverless drizzle-orm @anthropic-ai/sdk @paralleldrive/cuid2 @vercel/functions svix zod react-hook-form @hookform/resolvers recharts sonner tw-animate-css

# 3. Install dev dependencies  
pnpm add -D drizzle-kit

# 4. Initialize shadcn (uses Tailwind v4 CSS-first config)
npx shadcn@latest init

# 5. Add shadcn components
npx shadcn@latest add button input textarea form card table dialog dropdown-menu avatar badge separator skeleton toast sheet

# 6. Generate migrations
pnpm drizzle-kit generate

# 7. Push to database
pnpm drizzle-kit push
```

## Package.json Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "db:generate": "drizzle-kit generate",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio"
  }
}
```

Note: Turbopack is now the default dev server in Next.js 16, no `--turbo` flag needed.

## Recommended Package Versions (as of early 2026)

```json
{
  "dependencies": {
    "next": "^16.1.0",
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "@clerk/nextjs": "^6.36.0",
    "@neondatabase/serverless": "^0.10.0",
    "drizzle-orm": "^0.44.0",
    "@anthropic-ai/sdk": "^0.40.0",
    "tailwindcss": "^4.0.0",
    "tw-animate-css": "^1.0.0"
  },
  "devDependencies": {
    "drizzle-kit": "^0.31.0",
    "typescript": "^5.8.0"
  }
}
```
```

## Conventions

1. **Server Actions** - All mutations go through server actions in `src/actions/`
2. **Data Fetching** - Use server components with direct db queries or server actions
3. **Client Components** - Only when needed (forms, interactivity, charts)
4. **Error Handling** - Use try/catch in server actions, toast for client feedback
5. **Validation** - Zod schemas for all inputs, both client and server
6. **Multi-tenancy** - Always filter by `organizationId`, never trust client-provided org IDs
7. **Auth Checks** - Use `requireUser()` or `requireOrg()` at the start of every server action
8. **File Structure** - Co-locate related components, keep pages thin
9. **Naming** - kebab-case for files, PascalCase for components, camelCase for functions
10. **Types** - Define in `src/types/`, export from schema for db types
11. **Date Serialization** - Always serialize Date objects to ISO strings before passing to client components
12. **Request Deduplication** - Wrap shared data fetching functions with `React.cache()`
13. **Non-blocking Logging** - Use `after()` from `next/server` for activity logs and analytics

## Implementation Order

1. ✅ Initialize Next.js 16 project with all dependencies
2. ✅ Set up environment variables
3. ✅ Configure next.config.ts with optimizePackageImports
4. ✅ Configure Clerk with proxy.ts (NOT middleware.ts)
5. ✅ Set up Drizzle + Neon connection
6. ✅ Create database schema and run migrations
7. ✅ Build Clerk webhook handler for user sync
8. ✅ Create auth helper functions with React.cache()
9. ✅ Build dashboard layout with sidebar/header
10. ✅ Add loading.tsx files for streaming
11. ✅ Add error.tsx boundaries
12. ✅ Create documents CRUD (pages + server actions)
13. ✅ Add AI analysis endpoint with waitUntil
14. ✅ Build forms with React Hook Form + Zod
15. ✅ Add activity logging with after()
16. ✅ Add charts with dynamic imports
17. ✅ Polish UI with shadcn components

## Notes

- Don't create shadcn `ui/` components manually - always use `npx shadcn@latest add`
- Use `sonner` for toast notifications (already included in shadcn)
- The Clerk webhook needs to be set up in the Clerk dashboard pointing to `/api/webhooks/clerk`
- For file uploads, we'll add Vercel Blob later - for now, just store URLs
- Activity logs are for audit trail - log all CRUD operations using `after()` for non-blocking
- **IMPORTANT**: Use `proxy.ts` NOT `middleware.ts` for Next.js 16
- Claude 3.5 Sonnet models have been retired - use Claude Sonnet 4.5 or Opus 4.5
- Tailwind v4 uses CSS-first config - no `tailwind.config.js` needed
- Always wrap frequently-called data fetching functions with `React.cache()` for request deduplication
- Serialize Date objects to ISO strings before passing to client components
- Use dynamic imports for heavy libraries like Recharts (~300KB savings)
- Add `loading.tsx` files for streaming and better perceived performance
- Add `error.tsx` boundaries for graceful error handling

## Next.js 16 Specific Notes

- **Turbopack is default** - No need for `--turbo` flag, it's the default dev server
- **React 19** - Next.js 16 uses React 19 with improved server components
- **Async Request APIs** - `headers()`, `cookies()`, `params`, `searchParams` are all async now (already reflected in code examples)
- **Caching changes** - `fetch` requests are no longer cached by default, `GET` route handlers are not cached by default
- **`use cache` directive** - Can use `'use cache'` for more granular caching control when needed
- **middleware.ts → proxy.ts** - CRITICAL: Rename `middleware.ts` to `proxy.ts`. The function export should be named `proxy`. Proxy runs on Node.js runtime by default (not Edge). See the Clerk docs for updated setup.
- **Cache Components** - New programming model using PPR and `use cache` for instant navigation
- **DevTools MCP** - Model Context Protocol integration for AI-assisted debugging

### Migration Codemod

If upgrading from Next.js 15, run:
```bash
npx @next/codemod@canary upgrade latest
```

To migrate middleware specifically:
```bash
mv middleware.ts proxy.ts
# Then rename the exported function from `middleware` to `proxy`
```

## Tailwind CSS v4 Notes

Tailwind v4 uses CSS-first configuration. No more `tailwind.config.js` for most projects.

Key changes for shadcn/ui:
- Colors are now OKLCH by default
- Use `@theme inline` directive in CSS
- `tailwindcss-animate` is deprecated → use `tw-animate-css` instead
- All config moves to `globals.css`

Example globals.css structure:
```css
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  /* ... other CSS variables */
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  /* ... map to Tailwind */
}
```
