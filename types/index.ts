export interface OrgSettings {
  aiModel?:
    | "claude-sonnet-4-5-20250929"
    | "claude-opus-4-5-20251101"
    | "claude-haiku-4-5-20251001";
  webhookUrl?: string;
  features?: {
    aiAnalysis?: boolean;
    bulkUpload?: boolean;
  };
}

export interface AIOutput {
  summary?: string;
  extractedFields?: Record<string, unknown>;
  confidence?: number;
  processedAt?: string;
  model?: string;
  tokensUsed?: number;
}

export interface ProjectMetadata {
  source?: string;
  tags?: string[];
  priority?: "low" | "medium" | "high";
}

export interface SerializedProject {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  status: "pending" | "processing" | "completed" | "failed";
  createdAt: string;
  updatedAt: string;
}
