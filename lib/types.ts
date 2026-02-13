export type Provider = "claude" | "openai" | "gemini";

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
  model: string;
  usage?: TokenUsage[];
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
  };
  errors: {
    claude?: string;
    openai?: string;
    gemini?: string;
  };
  combinedWordFrequencies: WordFrequency[];
  combinedEntities: CombinedEntities;
  combinedCitations: CombinedCitation[];
  tokenUsage?: TokenUsage[];
}
