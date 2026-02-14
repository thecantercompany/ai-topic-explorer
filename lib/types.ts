export type Provider = "claude" | "openai" | "gemini" | "perplexity" | "grok";

export interface Entity {
  name: string;
  url?: string;
}

export interface ExtractedEntities {
  people: Entity[];
  organizations: Entity[];
}

export interface Citation {
  title: string;
  url: string;
}

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  purpose: "expansion" | "analysis";
}

export interface AIResponse {
  provider: Provider;
  rawText: string;
  entities: ExtractedEntities;
  citations: Citation[];
  keyThemes: KeyTheme[];
  model: string;
  usage?: TokenUsage[];
  relatedQuestions?: string[];
}

export interface KeyTheme {
  phrase: string;
  relevance: number;
}

export interface WordFrequency {
  word: string;
  count: number;
}

export interface WordCloudWord {
  text: string;
  value: number;
}

export interface CombinedCitation {
  title: string;
  url: string;
  domain: string;
  providers: Provider[];
}

export interface CombinedEntities {
  people: Entity[];
  organizations: Entity[];
}

export interface AnalysisResult {
  topic: string;
  expandedQueries?: string[];
  responses: {
    claude: AIResponse | null;
    openai: AIResponse | null;
    gemini: AIResponse | null;
    perplexity: AIResponse | null;
    grok: AIResponse | null;
  };
  errors: {
    claude?: string;
    openai?: string;
    gemini?: string;
    perplexity?: string;
    grok?: string;
  };
  combinedWordFrequencies: WordFrequency[];
  combinedKeyThemes: KeyTheme[];
  combinedEntities: CombinedEntities;
  combinedCitations: CombinedCitation[];
  tokenUsage?: TokenUsage[];
}
