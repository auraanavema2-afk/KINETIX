import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { verifyAuth } from "@/lib/authMiddleware"

export async function POST(request) {
  const authResult = await verifyAuth(request)
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }

  try {
    const { type, content } = await request.json();

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    if (type === "title") {
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 20,
        messages: [
          {
            role: "user",
            content: `Generate a short title of 3 to 5 words for a conversation that starts with this message. Return only the title, no punctuation, no quotes: "${content}"`,
          },
        ],
      });
      return NextResponse.json({ result: response.content[0].text.trim() });
    }

    if (type === "memory") {
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 60,
        messages: [
          {
            role: "user",
            content: `From this conversation excerpt, extract ONE specific insight about the user that would help an AI assistant serve them better in future conversations. Be specific and factual. Return only the insight in one sentence, maximum 20 words: "${content}"`,
          },
        ],
      });
      return NextResponse.json({ result: response.content[0].text.trim() });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch {
    return NextResponse.json(
      { error: "Failed to process soul request" },
      { status: 500 }
    );
  }
}
