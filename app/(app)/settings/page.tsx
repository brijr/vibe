import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth-helpers";
import { SettingsForm } from "@/components/forms/settings-form";
import { Container } from "@/components/ds";

export default async function SettingsPage() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  return (
    <Container size="2xl" className="space-y-6 p-0">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <SettingsForm
            defaultValues={{
              name: user.name,
              email: user.email,
            }}
          />
        </CardContent>
      </Card>

      {user.organization && (
        <Card>
          <CardHeader>
            <CardTitle>Organization</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4 text-sm">
              <div>
                <dt className="text-muted-foreground">Name</dt>
                <dd className="font-medium">{user.organization.name}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Slug</dt>
                <dd className="font-mono">{user.organization.slug}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Your Role</dt>
                <dd className="capitalize">{user.role}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      )}
    </Container>
  );
}
