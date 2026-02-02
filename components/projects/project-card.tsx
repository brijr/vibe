import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProjectStatus } from "./project-status";
import { formatDate } from "@/lib/utils";

interface ProjectCardProps {
  project: {
    id: string;
    title: string;
    description: string | null;
    status: "pending" | "processing" | "completed" | "failed";
    createdAt: Date;
    createdBy?: {
      name: string;
    } | null;
  };
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link href={`/projects/${project.id}`}>
      <Card className="hover:bg-muted/50 transition-colors">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="line-clamp-1 text-base">
              {project.title}
            </CardTitle>
            <ProjectStatus status={project.status} />
          </div>
        </CardHeader>
        <CardContent>
          {project.description && (
            <p className="text-muted-foreground mb-2 line-clamp-2 text-sm">
              {project.description}
            </p>
          )}
          <div className="text-muted-foreground flex items-center gap-2 text-xs">
            <span>{formatDate(project.createdAt)}</span>
            {project.createdBy && (
              <>
                <span>•</span>
                <span>{project.createdBy.name}</span>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
