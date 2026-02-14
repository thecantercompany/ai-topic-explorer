import OpenAI from "openai";
import type { AIResponse, ExtractedEntities, Citation, KeyTheme, TokenUsage } from "@/lib/types";
import { PROMPT_TEMPLATE, parseStructuredData, extractRawText } from "./shared";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function analyzeWithOpenAI(query: string): Promise<AIResponse> {
  const completion = await client.chat.completions.create({
    model: "gpt-4o",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: PROMPT_TEMPLATE(query),
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
    `[Analysis: OpenAI] Query: "${query.slice(0, 60)}..." — Tokens — input: ${usage.inputTokens}, output: ${usage.outputTokens}`
  );

  if (completion.choices[0]?.finish_reason === "length") {
    console.warn("OpenAI response was truncated due to max_tokens limit");
  }

  const { entities, citations, keyThemes } = parseStructuredData(responseText, "OpenAI");

  return {
    provider: "openai",
    rawText: extractRawText(responseText),
    entities,
    citations,
    keyThemes,
    model: "gpt-4o",
    usage: [usage],
  };
}
