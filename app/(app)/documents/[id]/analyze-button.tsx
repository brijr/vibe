"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AiMagicIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

interface AnalyzeDocumentButtonProps {
  documentId: string;
}

export function AnalyzeDocumentButton({
  documentId,
}: AnalyzeDocumentButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleAnalyze() {
    startTransition(async () => {
      try {
        const response = await fetch("/api/ai/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            documentId,
            content: "Sample document content for analysis",
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to start analysis");
        }

        toast.success("Analysis started");
        router.refresh();
      } catch (error) {
        toast.error("Failed to start analysis");
      }
    });
  }

  return (
    <Button onClick={handleAnalyze} disabled={isPending} variant="secondary">
      <HugeiconsIcon icon={AiMagicIcon} size={16} className="mr-2" />
      {isPending ? "Starting..." : "Analyze"}
    </Button>
  );
}
