import Anthropic from "@anthropic-ai/sdk";
import type { TokenUsage } from "@/lib/types";

const EXPANSION_PROMPT = (topic: string) => `Given the topic: "${topic}"

Generate 3-4 distinct subtopic queries that would provide comprehensive coverage of this topic. Each query should explore a different angle or dimension — for example, different aspects like history, current state, key players, controversies, technical details, societal impact, etc.

Return ONLY a JSON array of strings, no other text:
["subtopic query 1", "subtopic query 2", "subtopic query 3"]`;

export async function expandQuery(
  topic: string
): Promise<{ queries: string[]; usage: TokenUsage }> {
  const apiKey = process.env.ANTHROPIC_EXPANSION_API_KEY;
  if (!apiKey) {
    // Fall back to single query if no expansion key configured
    return {
      queries: [topic],
      usage: { inputTokens: 0, outputTokens: 0, purpose: "expansion" },
    };
  }

  const client = new Anthropic({ apiKey });

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 300,
    messages: [{ role: "user", content: EXPANSION_PROMPT(topic) }],
  });

  const usage: TokenUsage = {
    inputTokens: message.usage.input_tokens,
    outputTokens: message.usage.output_tokens,
    purpose: "expansion",
  };

  console.log(
    `[Query Expansion] Tokens — input: ${usage.inputTokens}, output: ${usage.outputTokens}`
  );

  const responseText = message.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("\n");

  try {
    // Extract JSON array from the response
    const match = responseText.match(/\[[\s\S]*\]/);
    if (match) {
      const queries: string[] = JSON.parse(match[0]);
      if (Array.isArray(queries) && queries.length > 0 && queries.every((q) => typeof q === "string")) {
        // Always include the original topic as the first query
        return { queries: [topic, ...queries], usage };
      }
    }
  } catch (e) {
    console.warn("Failed to parse query expansion response:", e);
  }

  // Fallback: just use the original topic
  return { queries: [topic], usage };
}
