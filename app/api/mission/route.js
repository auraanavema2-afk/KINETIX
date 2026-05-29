import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { verifyAuth } from "@/lib/authMiddleware"

export async function POST(request) {
  const authResult = await verifyAuth(request)
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }

  try {
    const { soulData, soulMemory, activityCount, currentPhase } = await request.json();

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const context = soulData
      ? `
User name: ${soulData.name}
Their big goal: ${soulData.bigGoal}
Their biggest obstacle: ${soulData.bigObstacle}
They want help with: ${soulData.helpNeeded}
This week they want to: ${soulData.weeklyIntent}
${soulMemory?.length > 0 ? `Recent insights about them: ${soulMemory.slice(-5).join(", ")}` : ""}
Current activity streak: ${activityCount || 0} days
Current phase: ${currentPhase || "Starting"}
`
      : "New user with no soul data yet";

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 400,
      messages: [
        {
          role: "user",
          content: `Based on this person's context: ${context}

Generate exactly 3 specific, actionable tasks they should do TODAY to make progress on their goal.

Return ONLY a JSON array with exactly 3 objects. Each object has:
- action: string (the specific task, max 12 words)
- time: string (estimated time like "20 min" or "1 hour")
- priority: "high" or "medium"

Return only valid JSON. No other text.`,
        },
      ],
    });

    const parsed = JSON.parse(response.content[0].text.trim());
    return NextResponse.json({ actions: parsed });
  } catch {
    return NextResponse.json({
      actions: [
        { action: "Review your main goal and write down one next step", time: "10 min", priority: "high" },
        { action: "Work on the most important task on your list", time: "1 hour", priority: "high" },
        { action: "Reflect on yesterday and plan tomorrow", time: "15 min", priority: "medium" },
      ],
    });
  }
}
