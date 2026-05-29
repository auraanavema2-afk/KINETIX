import { NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"

export async function POST(request) {
  try {
    const {
      messages,
      arenaId,
      soulData,
      soulMemory,
      memberCount,
    } = await request.json()

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })

    const soulContext = soulData ? `
You are chatting with a group. One key member:
Name: ${soulData.name}
Their goal: ${soulData.bigGoal}
` : ""

    const systemPrompt = `You are Kaizen 4 Arena, the collaborative AI brain for The Kaizen Arena workspace.

${soulContext}

You are helping ${memberCount || "multiple"} people work together in real time. This is a shared workspace where multiple users are collaborating.

When responding:
- Address the group naturally, not just one person
- Build on what multiple people have said
- Help synthesize different ideas and viewpoints
- Keep responses focused and actionable for collaboration
- You embody the kaizen philosophy — helping the group improve continuously together

You are Kaizen 4 Arena. Built by The Kaizen team.`

    const stream = await anthropic.messages.stream({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      system: systemPrompt,
      messages: messages,
    })

    const readableStream = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          if (
            chunk.type === "content_block_delta" &&
            chunk.delta.type === "text_delta"
          ) {
            controller.enqueue(
              new TextEncoder().encode(chunk.delta.text)
            )
          }
        }
        controller.close()
      },
    })

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    })
  } catch (err) {
    console.error("Arena API error:", err)
    return NextResponse.json(
      { error: "Kaizen 4 Arena encountered an error" },
      { status: 500 }
    )
  }
}
