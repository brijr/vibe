# Vibe Starter

A production-ready Next.js 16 SaaS starter with authentication, database, and AI integration built-in.

## Tech Stack

- **Framework**: Next.js 16 with App Router and Turbopack
- **Database**: Neon Postgres + Drizzle ORM
- **Auth**: Better Auth (email/password)
- **AI**: Vercel AI SDK with AI Gateway
- **Styling**: Tailwind CSS v4 + shadcn/ui (Radix Nova style)
- **Icons**: HugeIcons React
- **Runtime**: Bun

## Features

- Multi-tenant architecture with organizations
- Project management with CRUD operations
- AI-powered content analysis (background processing)
- Activity logging for audit trails
- Responsive dashboard with sidebar navigation
- Form validation with Zod + React Hook Form
- Type-safe database queries

## Quick Start

### 1. Install dependencies

```bash
bun install
```

### 2. Set up environment variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required variables:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Neon Postgres connection string |
| `BETTER_AUTH_SECRET` | Auth secret (min 32 chars). Generate with `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | Your app URL (e.g., `http://localhost:3000`) |
| `AI_GATEWAY_API_KEY` | Vercel AI Gateway API key |
| `NEXT_PUBLIC_APP_URL` | Public app URL |

### 3. Set up the database

```bash
bun db:push
```

### 4. Run the development server

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

```
src/
├── app/
│   ├── (auth)/           # Auth pages (sign-in, sign-up)
│   ├── (app)/            # Protected app routes
│   │   ├── dashboard/    # Dashboard home
│   │   ├── projects/     # Project CRUD
│   │   └── settings/     # User/org settings
│   └── api/
│       ├── auth/         # Better Auth handler
│       └── ai/           # AI analysis endpoint
├── components/
│   ├── layout/           # Sidebar, header, mobile nav
│   ├── projects/         # Project cards, lists
│   ├── forms/            # Form components
│   └── ui/               # shadcn/ui components
├── lib/
│   ├── db/               # Database connection & schema
│   ├── ai/               # AI client & prompts
│   ├── auth.ts           # Better Auth config
│   └── auth-helpers.ts   # Session utilities
├── actions/              # Server actions
├── hooks/                # React hooks
└── types/                # TypeScript types
```

## Database Commands

```bash
bun db:generate  # Generate migrations
bun db:push      # Push schema to database
bun db:studio    # Open Drizzle Studio
```

## AI Integration

The starter uses Vercel AI Gateway which supports multiple providers with a single API key:

- `anthropic/claude-sonnet-4.5`
- `anthropic/claude-opus-4.5`
- `openai/gpt-4o`
- `google/gemini-2.0-flash`

To change the model, edit `lib/ai/client.ts`:

```typescript
const { text } = await generateText({
  model: "openai/gpt-4o", // Change model here
  prompt: userPrompt,
});
```

## Customization

### Adding new routes

1. Create a new folder in `app/(app)/your-feature/`
2. Add a `page.tsx` file
3. Update the sidebar in `components/layout/sidebar.tsx`

### Adding database tables

1. Define the table in `lib/db/schema.ts`
2. Run `bun db:push` to sync with database
3. Create server actions in `actions/`

### Changing the theme

Edit `app/globals.css` to modify the Radix Nova color tokens.

## Deploy

Deploy to Vercel with one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/brijr/vibe-starter)

Set your environment variables in the Vercel dashboard.

## License

MIT
