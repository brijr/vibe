import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DocumentList } from "@/components/documents/document-list";
import { getCurrentUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { documents } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { PlusSignIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export default async function DocumentsPage() {
  const user = await getCurrentUser();

  let docs: Array<{
    id: string;
    title: string;
    description: string | null;
    status: "pending" | "processing" | "completed" | "failed";
    createdAt: Date;
    createdBy: { name: string } | null;
  }> = [];

  if (user?.organizationId) {
    const results = await db.query.documents.findMany({
      where: eq(documents.organizationId, user.organizationId),
      orderBy: [desc(documents.createdAt)],
      with: {
        createdBy: true,
      },
    });

    docs = results.map((doc) => ({
      id: doc.id,
      title: doc.title,
      description: doc.description,
      status: doc.status,
      createdAt: doc.createdAt,
      createdBy: doc.createdBy ? { name: doc.createdBy.name } : null,
    }));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Documents</h1>
          <p className="text-muted-foreground">
            Manage and analyze your documents
          </p>
        </div>
        {user?.organizationId && (
          <Link href="/documents/new">
            <Button>
              <HugeiconsIcon icon={PlusSignIcon} size={16} className="mr-2" />
              New Document
            </Button>
          </Link>
        )}
      </div>

      {!user?.organizationId ? (
        <div className="text-muted-foreground py-12 text-center">
          <p>You need to be part of an organization to view documents.</p>
        </div>
      ) : (
        <DocumentList documents={docs} />
      )}
    </div>
  );
}
