import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { verifyAuth } from "@/lib/authMiddleware"

export async function POST(request) {
  const authResult = await verifyAuth(request)
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }
  const verifiedUid = authResult.uid

  try {
    const { messages, conversationId, soulData, soulMemory, customSystemPrompt } =
      await request.json();

    const soulContext = soulData
      ? `
You know this person deeply:
- Name and role: ${soulData.name}
- Their biggest goal: ${soulData.bigGoal}
- Their biggest obstacle: ${soulData.bigObstacle}
- They want help with: ${soulData.helpNeeded}
- This week they want to: ${soulData.weeklyIntent}
`
      : "";

    const memoryContext =
      soulMemory && soulMemory.length > 0
        ? `
What you have learned about them from past conversations:
${soulMemory
  .slice(-10)
  .map((m, i) => `${i + 1}. ${m}`)
  .join("\n")}
`
        : "";

    const systemPrompt = `You are Kaizen 4, the AI model powering The Kaizen platform. The Kaizen is the AI platform built on the Japanese philosophy of continuous improvement.

${soulContext}
${memoryContext}

Use everything you know about this person to make every response deeply personal and relevant. Address them by their first name naturally when appropriate. Reference their goals and context when valuable. You embody kaizen — small daily improvements that compound into massive transformation over time.

You are Kaizen 4. You are powerful, thoughtful, direct, and genuinely helpful. You never mention Claude or Anthropic. You are Kaizen 4, built by The Kaizen team.

Be concise when short answers work. Be thorough when depth helps. Always real, never generic.`;

    const finalSystemPrompt = customSystemPrompt
      ? `${customSystemPrompt}\n\nContext about the user:\n${soulContext}\n${memoryContext}`
      : systemPrompt;

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const stream = await anthropic.messages.stream({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: finalSystemPrompt,
      messages: messages,
    });

    const readableStream = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          if (
            chunk.type === "content_block_delta" &&
            chunk.delta.type === "text_delta"
          ) {
            const text = chunk.delta.text;
            controller.enqueue(new TextEncoder().encode(text));
          }
        }
        controller.close();
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to get response from Kaizen 4" },
      { status: 500 }
    );
  }
}
