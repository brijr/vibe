"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface UseAIStatusOptions {
  documentId: string;
  initialStatus: "pending" | "processing" | "completed" | "failed";
  pollInterval?: number;
}

export function useAIStatus({
  documentId,
  initialStatus,
  pollInterval = 3000,
}: UseAIStatusOptions) {
  const router = useRouter();
  const [status, setStatus] =
    useState<"pending" | "processing" | "completed" | "failed">(initialStatus);
  const [isPolling, setIsPolling] = useState(initialStatus === "processing");

  const startPolling = useCallback(() => {
    setIsPolling(true);
  }, []);

  const stopPolling = useCallback(() => {
    setIsPolling(false);
  }, []);

  useEffect(() => {
    if (!isPolling) return;

    const interval = setInterval(() => {
      router.refresh();
    }, pollInterval);

    return () => clearInterval(interval);
  }, [isPolling, pollInterval, router]);

  useEffect(() => {
    if (initialStatus !== "processing") {
      stopPolling();
    }
    setStatus(initialStatus);
  }, [initialStatus, stopPolling]);

  return {
    status,
    isPolling,
    startPolling,
    stopPolling,
  };
}
