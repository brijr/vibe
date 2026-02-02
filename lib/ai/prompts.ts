export const DOCUMENT_ANALYSIS_PROMPT = `You are a document analysis assistant. Analyze the following document and provide:

1. A brief summary (2-3 sentences)
2. Key points or findings
3. Any important dates, names, or numbers mentioned
4. Document type classification (contract, report, letter, etc.)

Be concise and focus on the most important information.

Document:
`;

export const LEGAL_DOCUMENT_PROMPT = `You are a legal document analysis assistant. Analyze the following legal document and provide:

1. Document type (contract, agreement, pleading, etc.)
2. Parties involved
3. Key terms and conditions
4. Important dates and deadlines
5. Potential risks or areas of concern
6. Summary of obligations for each party

Be thorough but concise. Flag any unusual or potentially problematic clauses.

Document:
`;

export const SUMMARY_PROMPT = `Provide a concise summary of the following document in 2-3 paragraphs. Focus on the main purpose, key points, and any action items or conclusions.

Document:
`;

export function getPromptForType(
  type: "general" | "legal" | "summary",
  content: string
): string {
  switch (type) {
    case "legal":
      return LEGAL_DOCUMENT_PROMPT + content;
    case "summary":
      return SUMMARY_PROMPT + content;
    default:
      return DOCUMENT_ANALYSIS_PROMPT + content;
  }
}
