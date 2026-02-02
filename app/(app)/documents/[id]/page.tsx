import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DocumentStatus } from "@/components/documents/document-status";
import { getCurrentUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { documents } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { formatDate } from "@/lib/utils";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { DeleteDocumentButton } from "./delete-button";
import { AnalyzeDocumentButton } from "./analyze-button";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DocumentPage({ params }: PageProps) {
  const { id } = await params;
  const user = await getCurrentUser();

  if (!user?.organizationId) {
    notFound();
  }

  const document = await db.query.documents.findFirst({
    where: and(
      eq(documents.id, id),
      eq(documents.organizationId, user.organizationId)
    ),
    with: {
      createdBy: true,
    },
  });

  if (!document) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/documents">
          <Button variant="ghost" size="icon">
            <HugeiconsIcon icon={ArrowLeft01Icon} size={20} />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{document.title}</h1>
            <DocumentStatus status={document.status} />
          </div>
          <p className="text-muted-foreground text-sm">
            Created {formatDate(document.createdAt)}
            {document.createdBy && ` by ${document.createdBy.name}`}
          </p>
        </div>
        <div className="flex gap-2">
          <AnalyzeDocumentButton documentId={document.id} />
          <DeleteDocumentButton documentId={document.id} />
        </div>
      </div>

      {document.description && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{document.description}</p>
          </CardContent>
        </Card>
      )}

      {document.aiOutput && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">AI Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {document.aiOutput.summary && (
              <div>
                <h4 className="mb-1 font-medium">Summary</h4>
                <p className="text-muted-foreground">
                  {document.aiOutput.summary}
                </p>
              </div>
            )}
            {document.aiOutput.confidence !== undefined && (
              <div>
                <h4 className="mb-1 font-medium">Confidence</h4>
                <p className="text-muted-foreground">
                  {Math.round(document.aiOutput.confidence * 100)}%
                </p>
              </div>
            )}
            {document.aiOutput.processedAt && (
              <p className="text-muted-foreground text-xs">
                Processed at {formatDate(document.aiOutput.processedAt)}
                {document.aiOutput.model && ` using ${document.aiOutput.model}`}
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
              <dd className="font-mono">{document.id}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Status</dt>
              <dd className="capitalize">{document.status}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Created</dt>
              <dd>{formatDate(document.createdAt)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Updated</dt>
              <dd>{formatDate(document.updatedAt)}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
