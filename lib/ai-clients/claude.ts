import Anthropic from "@anthropic-ai/sdk";
import type { AIResponse, TokenUsage } from "@/lib/types";
import { PROMPT_TEMPLATE, parseStructuredData, extractRawText } from "./shared";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function analyzeWithClaude(query: string): Promise<AIResponse> {
  const message = await client.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 8192,
    messages: [
      {
        role: "user",
        content: PROMPT_TEMPLATE(query),
      },
    ],
  });

  const usage: TokenUsage = {
    inputTokens: message.usage.input_tokens,
    outputTokens: message.usage.output_tokens,
    purpose: "analysis",
  };

  console.log(
    `[Analysis: Claude] Query: "${query.slice(0, 60)}..." — Tokens — input: ${usage.inputTokens}, output: ${usage.outputTokens}`
  );

  if (message.stop_reason === "max_tokens") {
    console.warn("Claude response was truncated due to max_tokens limit");
  }

  const responseText = message.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("\n");

  const { entities, citations, keyThemes } = parseStructuredData(responseText, "Claude");

  return {
    provider: "claude",
    rawText: extractRawText(responseText),
    entities,
    citations,
    keyThemes,
    model: "claude-sonnet-4-5-20250929",
    usage: [usage],
  };
}
