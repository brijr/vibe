import { getCurrentUser } from "@/lib/auth-helpers";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  return (
    <div className="max-w-md">
      <h1 className="font-mono text-sm">Dashboard</h1>

      <p className="text-muted-foreground mt-8 text-sm leading-relaxed">
        Welcome back, {user?.name || "User"}.
      </p>

      <dl className="mt-8 space-y-4 text-sm">
        <div>
          <dt className="text-muted-foreground">Name</dt>
          <dd>{user?.name}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Email</dt>
          <dd>{user?.email}</dd>
        </div>
        {user?.organization && (
          <div>
            <dt className="text-muted-foreground">Organization</dt>
            <dd>{user.organization.name}</dd>
          </div>
        )}
      </dl>
    </div>
  );
}
