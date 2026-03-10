import { NextRequest, NextResponse } from "next/server";

const ERROR_API_URL = process.env.ERROR_API_URL;
const ERROR_API_KEY = process.env.ERROR_API_KEY;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { description, pageUrl, userAgent, timestamp } = body;

    if (
      !description ||
      typeof description !== "string" ||
      description.trim().length === 0
    ) {
      return NextResponse.json(
        { error: "Description is required" },
        { status: 400 }
      );
    }

    if (description.trim().length > 2000) {
      return NextResponse.json(
        { error: "Description too long" },
        { status: 400 }
      );
    }

    if (ERROR_API_URL && ERROR_API_KEY) {
      await fetch(ERROR_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": ERROR_API_KEY,
        },
        body: JSON.stringify({
          project: "ai-topic-explorer",
          category: "user_bug_report",
          message: description.trim(),
          context: {
            pageUrl: pageUrl || null,
            userAgent: userAgent || null,
            reportedAt: timestamp || new Date().toISOString(),
            source: "bug_report_form",
          },
        }),
      });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to submit report" },
      { status: 500 }
    );
  }
}
