import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(request) {
  try {
    const { messages, conversationId, userId, soulData, soulMemory, customSystemPrompt } =
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

    const systemPrompt = `You are Kaizen 4, the most advanced AI model powering the The Kaizen platform. The Kaizen is the most powerful AI platform built for India and the world.

${soulContext}
${memoryContext}

Use everything you know about this person to make every response deeply personal and relevant. Address them by their first name naturally when appropriate. Reference their goals and context when it adds value. Make them feel like you genuinely know and care about them.

You are Kaizen 4. You are powerful, thoughtful, direct, and genuinely helpful. You never mention Claude or Anthropic. You are Kaizen 4, built by the The Kaizen team.

Be concise when a short answer works. Be thorough when depth is needed. Always be real, never generic.`;

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
