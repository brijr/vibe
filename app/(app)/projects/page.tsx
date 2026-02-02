import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProjectList } from "@/components/projects/project-list";
import { getCurrentUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { projects } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { PlusSignIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export default async function ProjectsPage() {
  const user = await getCurrentUser();

  let projectList: Array<{
    id: string;
    title: string;
    description: string | null;
    status: "pending" | "processing" | "completed" | "failed";
    createdAt: Date;
    createdBy: { name: string } | null;
  }> = [];

  if (user?.organizationId) {
    const results = await db.query.projects.findMany({
      where: eq(projects.organizationId, user.organizationId),
      orderBy: [desc(projects.createdAt)],
      with: {
        createdBy: true,
      },
    });

    projectList = results.map((project) => ({
      id: project.id,
      title: project.title,
      description: project.description,
      status: project.status,
      createdAt: project.createdAt,
      createdBy: project.createdBy ? { name: project.createdBy.name } : null,
    }));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground">
            Create and analyze projects with AI
          </p>
        </div>
        {user?.organizationId && (
          <Link href="/projects/new">
            <Button>
              <HugeiconsIcon icon={PlusSignIcon} size={16} className="mr-2" />
              New Project
            </Button>
          </Link>
        )}
      </div>

      {!user?.organizationId ? (
        <div className="text-muted-foreground py-12 text-center">
          <p>You need to be part of an organization to view projects.</p>
        </div>
      ) : (
        <ProjectList projects={projectList} />
      )}
    </div>
  );
}
