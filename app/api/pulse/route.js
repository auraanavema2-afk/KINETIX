import { NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { verifyAuth } from "@/lib/authMiddleware"

export async function POST(request) {
  const authResult = await verifyAuth(request)
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }

  try {
    const { soulData, soulMemory, messageCount, streakDays } = await request.json()
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const today = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
    const context = soulData ? `
User name: ${soulData.name || "Builder"}
Their goal: ${soulData.bigGoal || "Building something meaningful"}
Their obstacle: ${soulData.bigObstacle || "Not specified"}
They need help with: ${soulData.helpNeeded || "General productivity"}
This week intent: ${soulData.weeklyIntent || "Making progress"}
${soulMemory?.length > 0 ? `Recent insights: ${soulMemory.slice(-5).join(", ")}` : ""}
Activity: ${messageCount || 0} total messages, ${streakDays || 0} day streak
Today: ${today}
` : "New user with no context yet"
    const systemPrompt = `You are The Kaizen Pulse, the personalised morning intelligence briefing for builders.
${context}
Generate a fresh briefing for TODAY. Return ONLY valid JSON in this exact format with no other text:
{
  "greeting": "Personal greeting using their name and time of day, max 8 words",
  "todayFocus": { "title": "...", "why": "...", "action": "..." },
  "industryPulse": [{ "icon": "📈", "title": "...", "summary": "..." }, { "icon": "💡", "title": "...", "summary": "..." }, { "icon": "⚡", "title": "...", "summary": "..." }],
  "personalInsight": { "pattern": "...", "suggestion": "..." },
  "todayQuote": "..."
}`
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1200,
      system: systemPrompt,
      messages: [{ role: "user", content: "Generate my Pulse briefing for today." }],
    })
    const text = response.content[0].text.trim()
    const cleanText = text.replace(/```json|```/g, "").trim()
    const parsed = JSON.parse(cleanText)
    return NextResponse.json(parsed)
  } catch (err) {
    console.error("Pulse error:", err)
    return NextResponse.json({
      greeting: "Good morning, Builder",
      todayFocus: { title: "Take one focused action today", why: "Momentum compounds. Even small actions move you forward.", action: "Pick the most important task and work on it for 30 focused minutes." },
      industryPulse: [
        { icon: "📈", title: "Daily action beats perfect planning", summary: "Builders who ship outperform those who plan." },
        { icon: "💡", title: "Focus is your competitive edge", summary: "Single-tasking creates better outcomes than multitasking." },
        { icon: "⚡", title: "Small wins build momentum", summary: "Celebrate progress no matter how small." }
      ],
      personalInsight: { pattern: "You are building consistently which is the most important habit.", suggestion: "Keep showing up daily. Compound progress is your superpower." },
      todayQuote: "Builders build. The rest is noise. Focus on what only you can do."
    })
  }
}
