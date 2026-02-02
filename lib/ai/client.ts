import { generateText } from "ai";

// Using Vercel AI Gateway - supports multiple providers with one API key
// Models: anthropic/claude-sonnet-4.5, anthropic/claude-opus-4.5, openai/gpt-4o, etc.
// Docs: https://ai-sdk.dev/providers/ai-sdk-providers/ai-gateway

export async function analyzeContent(content: string, prompt?: string) {
  const systemPrompt = `You are a helpful AI assistant that analyzes content and provides clear, structured insights.`;

  const userPrompt =
    prompt ||
    `Analyze the following content and provide:
1. A brief summary (2-3 sentences)
2. Key points or findings
3. Any recommendations or next steps

Content:
${content}`;

  const { text, usage } = await generateText({
    model: "anthropic/claude-sonnet-4.5",
    system: systemPrompt,
    prompt: userPrompt,
  });

  return {
    output: text,
    model: "claude-sonnet-4.5",
    tokensUsed: (usage?.inputTokens ?? 0) + (usage?.outputTokens ?? 0),
  };
}

export async function summarizeContent(content: string) {
  const { text, usage } = await generateText({
    model: "anthropic/claude-sonnet-4.5",
    prompt: `Provide a concise summary of the following content in 2-3 paragraphs:\n\n${content}`,
  });

  return {
    output: text,
    model: "claude-sonnet-4.5",
    tokensUsed: (usage?.inputTokens ?? 0) + (usage?.outputTokens ?? 0),
  };
}
