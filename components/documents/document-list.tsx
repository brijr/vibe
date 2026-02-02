import { DocumentCard } from "./document-card";

interface Document {
  id: string;
  title: string;
  description: string | null;
  status: "pending" | "processing" | "completed" | "failed";
  createdAt: Date;
  createdBy?: {
    name: string;
  } | null;
}

interface DocumentListProps {
  documents: Document[];
}

export function DocumentList({ documents }: DocumentListProps) {
  if (documents.length === 0) {
    return (
      <div className="text-muted-foreground py-12 text-center">
        <p>No documents yet.</p>
        <p className="text-sm">Create your first document to get started.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {documents.map((document) => (
        <DocumentCard key={document.id} document={document} />
      ))}
    </div>
  );
}
