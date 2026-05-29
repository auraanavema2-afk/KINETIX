import { NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { db } from "@/lib/firebase"
import { doc, updateDoc, increment } from "firebase/firestore"
import { verifyAuth } from "@/lib/authMiddleware"

export async function POST(request) {
  const authResult = await verifyAuth(request)
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }
  const verifiedUid = authResult.uid

  try {
    const {
      prompt,
      type,
      soulData,
      iterating,
      previousCode,
      iterationRequest
    } = await request.json()

    if (!prompt || prompt.trim().length < 10) {
      return NextResponse.json(
        { error: "Please describe what you want to build in more detail" },
        { status: 400 }
      )
    }

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })

    const typeInstructions = {
      app: `Build a complete single-page web application. Must be interactive and functional. Include real working JavaScript logic. Make it genuinely useful.`,
      website: `Build a complete landing page or website. Must look professional and modern. Include all sections — hero, features, about, CTA. Make it visually impressive.`,
      deck: `Build a complete presentation as an HTML slideshow. Include 6-8 slides. Each slide is full screen with clean typography. Include navigation arrows. Professional and beautiful.`,
    }

    const soulContext = soulData ? `
The person building this:
- Name: ${soulData.name}
- Their goal: ${soulData.bigGoal}
- They want help with: ${soulData.helpNeeded}
Make the output relevant to their context when possible.
` : ""

    const iterationContext = iterating ? `
You are IMPROVING an existing build. Here is the current code:

${previousCode}

The user wants this change: ${iterationRequest}

Keep everything that is working. Only change what the user asked for. Return the complete updated code.
` : ""

    const systemPrompt = `You are Kaizen Mint, the AI builder inside The Kaizen platform. You build complete, production-quality ${type}s from a single prompt.

${soulContext}

${typeInstructions[type] || typeInstructions.app}

${iterationContext}

CRITICAL RULES:
1. Return ONLY the complete HTML code. Nothing else. No explanation. No markdown. No backticks.
2. The entire output must be a single self-contained HTML file.
3. All CSS must be inside a <style> tag in the <head>.
4. All JavaScript must be inside a <script> tag before </body>.
5. Do NOT use external CDN links except for Google Fonts.
6. Make it look extraordinary. Dark theme with modern design by default unless specified.
7. Use CSS animations and transitions to make it feel alive.
8. Every element must be functional. No placeholder text like "lorem ipsum".
9. Make it genuinely impressive. This is what The Kaizen is known for.
10. The output must work perfectly when rendered in an iframe.`

    const userMessage = iterating
      ? `Apply this change: ${iterationRequest}`
      : `Build this: ${prompt}`

    const stream = await anthropic.messages.stream({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
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
        if (verifiedUid && db) {
          try {
            await updateDoc(doc(db, "users", verifiedUid), {
              mintBuilds: increment(1)
            })
          } catch (e) {
            console.error("Failed to increment mint builds:", e)
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
    console.error("Mint API error:", err)
    return NextResponse.json(
      { error: "Failed to build. Please try again." },
      { status: 500 }
    )
  }
}
