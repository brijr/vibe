import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth-helpers";
import { Main, Container } from "@/components/ds";

export default async function HomePage() {
  const session = await getServerSession();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <Main className="flex min-h-screen flex-col justify-center px-6 py-16">
      <Container size="2xl" className="p-0">
        <h1 className="font-mono text-sm tracking-tight">brijr/vibe</h1>

        <p className="text-muted-foreground mt-8 max-w-md text-sm leading-relaxed">
          A minimal Next.js starter. Authentication, database, file uploads, and
          AI integration. Nothing more.
        </p>

        <ul className="text-muted-foreground mt-8 space-y-1 text-sm">
          <li>Next.js 16</li>
          <li>Better Auth</li>
          <li>Neon Postgres</li>
          <li>Vercel Blob</li>
          <li>AI SDK</li>
        </ul>

        <div className="mt-12 flex gap-6 text-sm">
          <a
            href="https://github.com/brijr/vibe-starter"
            className="text-foreground underline underline-offset-4 hover:no-underline"
          >
            GitHub
          </a>
          <Link
            href="/sign-in"
            className="text-muted-foreground hover:text-foreground"
          >
            Sign in
          </Link>
        </div>
      </Container>
    </Main>
  );
}