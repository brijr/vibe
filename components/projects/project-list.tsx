import { ProjectCard } from "./project-card";

interface Project {
  id: string;
  title: string;
  description: string | null;
  status: "pending" | "processing" | "completed" | "failed";
  createdAt: Date;
  createdBy?: {
    name: string;
  } | null;
}

interface ProjectListProps {
  projects: Project[];
}

export function ProjectList({ projects }: ProjectListProps) {
  if (projects.length === 0) {
    return (
      <div className="text-muted-foreground py-12 text-center">
        <p>No projects yet.</p>
        <p className="text-sm">Create your first project to get started.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
