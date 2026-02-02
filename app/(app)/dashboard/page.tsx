import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { projects } from "@/lib/db/schema";
import { eq, count, and } from "drizzle-orm";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  let stats = {
    total: 0,
    pending: 0,
    completed: 0,
  };

  if (user?.organizationId) {
    const [totalResult, pendingResult, completedResult] = await Promise.all([
      db
        .select({ count: count() })
        .from(projects)
        .where(eq(projects.organizationId, user.organizationId)),
      db
        .select({ count: count() })
        .from(projects)
        .where(
          and(
            eq(projects.organizationId, user.organizationId),
            eq(projects.status, "pending")
          )
        ),
      db
        .select({ count: count() })
        .from(projects)
        .where(
          and(
            eq(projects.organizationId, user.organizationId),
            eq(projects.status, "completed")
          )
        ),
    ]);

    stats = {
      total: totalResult[0]?.count ?? 0,
      pending: pendingResult[0]?.count ?? 0,
      completed: completedResult[0]?.count ?? 0,
    };
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.name || "User"}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Total Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
          </CardContent>
        </Card>
      </div>

      {!user?.organizationId && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-center">
              You are not part of any organization yet. Contact your
              administrator to get started.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
