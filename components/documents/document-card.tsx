import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DocumentStatus } from "./document-status";
import { formatDate } from "@/lib/utils";

interface DocumentCardProps {
  document: {
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

export function DocumentCard({ document }: DocumentCardProps) {
  return (
    <Link href={`/documents/${document.id}`}>
      <Card className="hover:bg-muted/50 transition-colors">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="line-clamp-1 text-base">
              {document.title}
            </CardTitle>
            <DocumentStatus status={document.status} />
          </div>
        </CardHeader>
        <CardContent>
          {document.description && (
            <p className="text-muted-foreground mb-2 line-clamp-2 text-sm">
              {document.description}
            </p>
          )}
          <div className="text-muted-foreground flex items-center gap-2 text-xs">
            <span>{formatDate(document.createdAt)}</span>
            {document.createdBy && (
              <>
                <span>•</span>
                <span>{document.createdBy.name}</span>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
