import { getCurrentUser } from "@/lib/auth-helpers";
import { SettingsForm } from "@/components/forms/settings-form";

export default async function SettingsPage() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-md">
      <h1 className="font-mono text-sm">Settings</h1>

      <div className="mt-8">
        <h2 className="text-muted-foreground mb-4 text-sm">Profile</h2>
        <SettingsForm
          defaultValues={{
            name: user.name,
            email: user.email,
          }}
        />
      </div>

      {user.organization && (
        <div className="mt-12">
          <h2 className="text-muted-foreground mb-4 text-sm">Organization</h2>
          <dl className="space-y-4 text-sm">
            <div>
              <dt className="text-muted-foreground">Name</dt>
              <dd>{user.organization.name}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Slug</dt>
              <dd className="font-mono">{user.organization.slug}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Role</dt>
              <dd className="capitalize">{user.role}</dd>
            </div>
          </dl>
        </div>
      )}
    </div>
  );
}
