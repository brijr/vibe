import { generateText } from "ai";
import type { AIResponse } from "@/types";

// Vercel AI Gateway - supports multiple providers with one API key
// Models: anthropic/claude-sonnet-4.5, openai/gpt-4o, google/gemini-2.0-flash
// Docs: https://ai-sdk.dev/providers/ai-sdk-providers/ai-gateway

const DEFAULT_MODEL = "anthropic/claude-sonnet-4.5";

export async function generate(
  prompt: string,
  options?: { system?: string; model?: string }
): Promise<AIResponse> {
  const { text, usage } = await generateText({
    model: options?.model ?? DEFAULT_MODEL,
    system: options?.system,
    prompt,
  });

  return {
    output: text,
    model: options?.model ?? DEFAULT_MODEL,
    tokensUsed: (usage?.inputTokens ?? 0) + (usage?.outputTokens ?? 0),
  };
}
