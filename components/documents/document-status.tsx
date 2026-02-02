import { Badge } from "@/components/ui/badge";

interface DocumentStatusProps {
  status: "pending" | "processing" | "completed" | "failed";
}

const statusConfig = {
  pending: {
    label: "Pending",
    variant: "outline" as const,
  },
  processing: {
    label: "Processing",
    variant: "secondary" as const,
  },
  completed: {
    label: "Completed",
    variant: "default" as const,
  },
  failed: {
    label: "Failed",
    variant: "destructive" as const,
  },
};

export function DocumentStatus({ status }: DocumentStatusProps) {
  const config = statusConfig[status];

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
