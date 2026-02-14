import OpenAI from "openai";
import type { AIResponse, TokenUsage, QuotedPhrase } from "@/lib/types";
import { PROMPT_TEMPLATE, parseStructuredData, extractRawText } from "./shared";

const client = new OpenAI({
  apiKey: process.env.XAI_API_KEY,
  baseURL: "https://api.x.ai/v1",
});

function GROK_PROMPT_TEMPLATE(topic: string): string {
  return PROMPT_TEMPLATE(topic) + `\n\nIMPORTANT ADDITIONAL INSTRUCTION: Because you have unique insight into X/Twitter conversations, also include a "quotedPhrases" array in your JSON output block. These should be 15 short verbatim phrases, slogans, or talking points that real users frequently post on X when discussing "${topic}". Format: [{"phrase": "example phrase people say", "frequency": 5}]. The "frequency" is 1-5 (5 = viral/ubiquitous, 1 = notable but niche). Focus on actual social media language — hashtags without the #, rallying cries, common opinions, recurring arguments, memes — not academic summaries. These should read like things you'd actually see in a tweet.`;
}

function extractQuotedPhrases(text: string): QuotedPhrase[] {
  try {
    const codeBlockMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch) {
      const parsed = JSON.parse(codeBlockMatch[1]);
      if (Array.isArray(parsed.quotedPhrases)) {
        return parsed.quotedPhrases
          .filter(
            (q: unknown): q is { phrase: string; frequency?: number } =>
              typeof q === "object" &&
              q !== null &&
              "phrase" in q &&
              typeof (q as Record<string, unknown>).phrase === "string"
          )
          .slice(0, 15)
          .map((q: { phrase: string; frequency?: number }) => ({
            phrase: q.phrase,
            frequency: Math.min(5, Math.max(1, q.frequency || 3)),
          }));
      }
    }
  } catch {
    console.warn("Failed to parse quotedPhrases from Grok response");
  }
  return [];
}

export async function analyzeWithGrok(query: string): Promise<AIResponse> {
  const completion = await client.chat.completions.create({
    model: "grok-3",
    max_tokens: 8192,
    messages: [
      {
        role: "user",
        content: GROK_PROMPT_TEMPLATE(query),
      },
    ],
  });

  const responseText = completion.choices[0]?.message?.content || "";

  const usage: TokenUsage = {
    inputTokens: completion.usage?.prompt_tokens || 0,
    outputTokens: completion.usage?.completion_tokens || 0,
    purpose: "analysis",
  };

  console.log(
    `[Analysis: Grok] Query: "${query.slice(0, 60)}..." — Tokens — input: ${usage.inputTokens}, output: ${usage.outputTokens}`
  );

  if (completion.choices[0]?.finish_reason === "length") {
    console.warn("Grok response was truncated due to max_tokens limit");
  }

  const { entities, citations, keyThemes } = parseStructuredData(responseText, "Grok");
  const quotedPhrases = extractQuotedPhrases(responseText);

  return {
    provider: "grok",
    rawText: extractRawText(responseText),
    entities,
    citations,
    keyThemes,
    model: "grok-3",
    usage: [usage],
    ...(quotedPhrases.length > 0 && { quotedPhrases }),
  };
}
