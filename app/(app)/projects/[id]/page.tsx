import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProjectStatus } from "@/components/projects/project-status";
import { getCurrentUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { projects } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { formatDate } from "@/lib/utils";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { DeleteProjectButton } from "./delete-button";
import { AnalyzeProjectButton } from "./analyze-button";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectPage({ params }: PageProps) {
  const { id } = await params;
  const user = await getCurrentUser();

  if (!user?.organizationId) {
    notFound();
  }

  const project = await db.query.projects.findFirst({
    where: and(
      eq(projects.id, id),
      eq(projects.organizationId, user.organizationId)
    ),
    with: {
      createdBy: true,
    },
  });

  if (!project) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/projects">
          <Button variant="ghost" size="icon">
            <HugeiconsIcon icon={ArrowLeft01Icon} size={20} />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{project.title}</h1>
            <ProjectStatus status={project.status} />
          </div>
          <p className="text-muted-foreground text-sm">
            Created {formatDate(project.createdAt)}
            {project.createdBy && ` by ${project.createdBy.name}`}
          </p>
        </div>
        <div className="flex gap-2">
          <AnalyzeProjectButton
            projectId={project.id}
            content={project.content || project.description || project.title}
          />
          <DeleteProjectButton projectId={project.id} />
        </div>
      </div>

      {project.description && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{project.description}</p>
          </CardContent>
        </Card>
      )}

      {project.content && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Content</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {project.content}
            </p>
          </CardContent>
        </Card>
      )}

      {project.aiOutput && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">AI Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {project.aiOutput.summary && (
              <div>
                <h4 className="mb-1 font-medium">Summary</h4>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {project.aiOutput.summary}
                </p>
              </div>
            )}
            {project.aiOutput.processedAt && (
              <p className="text-muted-foreground text-xs">
                Processed at {formatDate(project.aiOutput.processedAt)}
                {project.aiOutput.model && ` using ${project.aiOutput.model}`}
                {project.aiOutput.tokensUsed &&
                  ` (${project.aiOutput.tokensUsed} tokens)`}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Details</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-muted-foreground">ID</dt>
              <dd className="font-mono">{project.id}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Status</dt>
              <dd className="capitalize">{project.status}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Created</dt>
              <dd>{formatDate(project.createdAt)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Updated</dt>
              <dd>{formatDate(project.updatedAt)}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
