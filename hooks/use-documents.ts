"use client";

import { useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteDocument, updateDocumentStatus } from "@/actions/documents";
import { toast } from "sonner";

export function useDocuments() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDelete = useCallback(
    (id: string) => {
      startTransition(async () => {
        try {
          await deleteDocument(id);
          toast.success("Document deleted");
          router.push("/documents");
        } catch (error) {
          toast.error("Failed to delete document");
        }
      });
    },
    [router]
  );

  const handleUpdateStatus = useCallback(
    (id: string, status: "pending" | "processing" | "completed" | "failed") => {
      startTransition(async () => {
        try {
          await updateDocumentStatus(id, status);
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
