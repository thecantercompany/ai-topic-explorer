import OpenAI from "openai";
import type { AIResponse, TokenUsage } from "@/lib/types";
import {
  PROMPT_TEMPLATE,
  parseStructuredData,
  extractRawText,
  REQUEST_MAX_RETRIES,
} from "./shared";

const client = new OpenAI({
  apiKey: process.env.PERPLEXITY_API_KEY,
  baseURL: "https://api.perplexity.ai",
});

export async function analyzeWithPerplexity(
  query: string,
  signal?: AbortSignal
): Promise<AIResponse> {
  const completion = await client.chat.completions.create(
    {
      model: "sonar",
      max_tokens: 8192,
      messages: [
        {
          role: "user",
          content: PROMPT_TEMPLATE(query),
        },
      ],
      // @ts-expect-error — Perplexity-specific parameter not in OpenAI SDK types
      return_related_questions: true,
    },
    // Perplexity is the provider that rate-limits us in practice, so honoring
    // the abort signal matters most here: an abandoned request that keeps
    // running still counts against the account's limit.
    { signal, maxRetries: REQUEST_MAX_RETRIES }
  );

  const responseText = completion.choices[0]?.message?.content || "";

  const usage: TokenUsage = {
    inputTokens: completion.usage?.prompt_tokens || 0,
    outputTokens: completion.usage?.completion_tokens || 0,
    purpose: "analysis",
  };

  console.log(
    `[Analysis: Perplexity] Query: "${query.slice(0, 60)}..." — Tokens — input: ${usage.inputTokens}, output: ${usage.outputTokens}`
  );

  if (completion.choices[0]?.finish_reason === "length") {
    console.warn("Perplexity response was truncated due to max_tokens limit");
  }

  const { entities, citations, keyThemes } = parseStructuredData(responseText, "Perplexity");

  // Extract related questions (Perplexity-specific field, not in OpenAI types)
  const perplexityResponse = completion as typeof completion & {
    related_questions?: string[];
  };
  const relatedQuestions = perplexityResponse.related_questions || [];

  return {
    provider: "perplexity",
    rawText: extractRawText(responseText),
    entities,
    citations,
    keyThemes,
    relatedQuestions,
    model: "sonar",
    usage: [usage],
  };
}
