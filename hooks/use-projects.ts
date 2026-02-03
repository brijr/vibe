"use client";

import { useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteProject, updateProjectStatus } from "@/actions/projects";
import { toast } from "sonner";

export function useProjects() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDelete = useCallback(
    (id: string) => {
      startTransition(async () => {
        try {
          await deleteProject(id);
          toast.success("Project deleted");
          router.push("/projects");
        } catch (error) {
          toast.error("Failed to delete project");
        }
      });
    },
    [router]
  );

  const handleUpdateStatus = useCallback(
    (id: string, status: "pending" | "processing" | "completed" | "failed") => {
      startTransition(async () => {
        try {
          await updateProjectStatus(id, status);
          toast.success("Status updated");
          router.refresh();
        } catch (error) {
          toast.error("Failed to update status");
        }
      });
    },
    [router]
  );

  return {
    isPending,
    handleDelete,
    handleUpdateStatus,
  };
}
