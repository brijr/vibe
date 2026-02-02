export const ANALYSIS_SYSTEM_PROMPT = `You are a helpful AI assistant that analyzes content and provides clear, structured insights. Be concise and focus on actionable information.`;

export const GENERAL_ANALYSIS_PROMPT = `Analyze the following content and provide:
1. A brief summary (2-3 sentences)
2. Key points or findings
3. Any recommendations or next steps

Content:
`;

export const SUMMARY_PROMPT = `Provide a concise summary of the following content in 2-3 paragraphs. Focus on the main purpose, key points, and any conclusions.

Content:
`;

export const EXTRACT_PROMPT = `Extract and list the key information from the following content. Include:
- Main topics or themes
- Important facts or data points
- Any dates, names, or specific details mentioned

Content:
`;

export function getPromptForType(
  type: "general" | "summary" | "extract",
  content: string
): string {
  switch (type) {
    case "summary":
      return SUMMARY_PROMPT + content;
    case "extract":
      return EXTRACT_PROMPT + content;
    default:
      return GENERAL_ANALYSIS_PROMPT + content;
  }
}
