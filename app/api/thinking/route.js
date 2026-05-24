import { NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"
import { canUseFeature } from "@/lib/gates"

export async function POST(request) {
  try {
    const { problem, userId, soulData, soulMemory } = await request.json()

    if (!problem || problem.trim().length < 10) {
      return NextResponse.json(
        { error: "Please describe your problem in more detail" },
        { status: 400 }
      )
    }

    if (userId) {
      const userSnap = await getDoc(doc(db, "users", userId))
      if (userSnap.exists()) {
        const plan = userSnap.data().plan || "spark"
        if (!canUseFeature(plan, "structuredThinking")) {
          return NextResponse.json(
            { error: "STRUCTURED_THINKING_LOCKED", plan },
            { status: 402 }
          )
        }
      }
    }

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })

    const soulContext = soulData ? `
You know this person:
- Name and role: ${soulData.name}
- Their goal: ${soulData.bigGoal}
- Their obstacle: ${soulData.bigObstacle}
` : ""

    const systemPrompt = `You are Kinet 4 Deep, the most advanced structured reasoning AI in Kinetix.

${soulContext}

When the user gives you a problem you break it down into exactly 5 sequential thinking steps. Each step builds on the previous one. Then you provide a final summary with concrete next actions.

You MUST respond in this exact JSON format with no other text:

{
  "steps": [
    { "step": 1, "title": "Step title in 3-6 words", "content": "Detailed reasoning for this step. 2-4 sentences." },
    { "step": 2, "title": "Step title", "content": "Reasoning..." },
    { "step": 3, "title": "Step title", "content": "Reasoning..." },
    { "step": 4, "title": "Step title", "content": "Reasoning..." },
    { "step": 5, "title": "Step title", "content": "Reasoning..." }
  ],
  "summary": "2-3 sentence summary tying it all together",
  "actions": [
    "First concrete action to take, 8-12 words",
    "Second concrete action, 8-12 words",
    "Third concrete action, 8-12 words"
  ]
}

Be specific. Be concrete. Apply deep reasoning. Reference the user's context when relevant. Return ONLY valid JSON.`

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: "user", content: problem }],
    })

    const text = response.content[0].text.trim()
    const cleanText = text.replace(/```json|```/g, "").trim()
    const parsed = JSON.parse(cleanText)

    return NextResponse.json(parsed)
  } catch (err) {
    console.error("Deep thinking error:", err)
    return NextResponse.json(
      { error: "Failed to generate structured thinking" },
      { status: 500 }
    )
  }
}
