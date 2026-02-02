import Anthropic from "@anthropic-ai/sdk";

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function analyzeDocument(content: string, prompt?: string) {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content:
          prompt ||
          `Analyze this document and extract key information:\n\n${content}`,
      },
    ],
  });

  const textContent = response.content.find((c) => c.type === "text");

  return {
    output: textContent?.text ?? "",
    model: response.model,
    tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
  };
}
