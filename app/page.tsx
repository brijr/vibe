import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getServerSession } from "@/lib/auth-helpers";
import { Nav, Main, Container } from "@/components/ds";

export default async function HomePage() {
  const session = await getServerSession();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-border border-b">
        <Nav containerClassName="flex h-16 items-center justify-between">
          <Link href="/" className="text-xl font-bold">
            SaaS Starter
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/sign-in">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/sign-up">
              <Button>Get Started</Button>
            </Link>
          </div>
        </Nav>
      </header>

      <Main className="flex flex-1 flex-col items-center justify-center px-4">
        <Container size="3xl" className="p-0 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Build your SaaS faster
          </h1>
          <p className="text-muted-foreground mt-6 text-lg">
            A production-ready Next.js 16 starter for multi-tenant SaaS
            applications. Complete with authentication, database, AI
            integration, and more.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link href="/sign-up">
              <Button size="lg">Get Started</Button>
            </Link>
            <Link href="/sign-in">
              <Button variant="outline" size="lg">
                Sign In
              </Button>
            </Link>
          </div>
        </Container>

        <Container size="4xl" className="mt-20 p-0">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="bg-primary/10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg">
                <span className="text-primary text-xl">1</span>
              </div>
              <h3 className="font-semibold">Multi-Tenant</h3>
              <p className="text-muted-foreground mt-2 text-sm">
                Built-in organization support with role-based access control.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg">
                <span className="text-primary text-xl">2</span>
              </div>
              <h3 className="font-semibold">AI-Powered</h3>
              <p className="text-muted-foreground mt-2 text-sm">
                Integrated Claude AI for document analysis and processing.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg">
                <span className="text-primary text-xl">3</span>
              </div>
              <h3 className="font-semibold">Production-Ready</h3>
              <p className="text-muted-foreground mt-2 text-sm">
                Neon database, Better Auth, and Vercel deployment ready.
              </p>
            </div>
          </div>
        </Container>
      </Main>

      <footer className="border-border border-t py-8">
        <Container className="text-center p-0 px-4">
          <p className="text-muted-foreground text-sm">
            Built with Next.js 16, Tailwind CSS v4, and shadcn/ui
          </p>
        </Container>
      </footer>
    </div>
  );
}