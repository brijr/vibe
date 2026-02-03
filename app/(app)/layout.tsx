import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { AppHeader } from "@/components/app-header";
import { getCurrentUser } from "@/lib/auth-helpers";
import { Main, Container } from "@/components/ds";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <SidebarInset>
        <AppHeader user={user} />
        <Main className="flex-1 overflow-y-auto">
          <Container size="3xl" className="py-8">
            {children}
          </Container>
        </Main>
      </SidebarInset>
    </SidebarProvider>
  );
}
