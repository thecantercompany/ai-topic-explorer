import { prisma } from "@/lib/db";
import type { Prisma } from "@/app/generated/prisma/client";

export type ErrorCategory =
  | "provider_failure"
  | "database_error"
  | "rate_limit"
  | "stream_error"
  | "parse_error"
  | "query_expansion_error";

interface LogErrorParams {
  category: ErrorCategory;
  provider?: string;
  message: string;
  rawError?: unknown;
  topic?: string;
  ip?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Log an error to the database for daily reporting.
 * Fire-and-forget: never awaited, never blocks the request.
 */
export function logError(params: LogErrorParams): void {
  const rawErrorStr = params.rawError
    ? (params.rawError instanceof Error
        ? `${params.rawError.message}\n${params.rawError.stack}`
        : String(params.rawError)
      ).slice(0, 2000)
    : undefined;

  prisma.errorLog
    .create({
      data: {
        category: params.category,
        provider: params.provider ?? null,
        message: params.message,
        rawError: rawErrorStr ?? null,
        topic: params.topic ?? null,
        ip: params.ip ?? null,
        metadata: (params.metadata as Prisma.InputJsonValue) ?? undefined,
      },
    })
    .catch((err) => {
      console.error("[ErrorLogger] Failed to log error to DB:", err);
    });
}
