import Anthropic from "@anthropic-ai/sdk";

const QUESTION_LABELS = [
  "Problems they were most reliably brought in corporate:",
  "Their natural role in teams and projects:",
  "The outcome their work most consistently delivered:",
  "Their ideal consulting client:",
  "Their preferred consulting working style:",
];

const SYSTEM_PROMPT = `You are a business positioning expert who helps accomplished corporate professionals identify their consulting niche. You write with precision and warmth — no jargon, no hype, no fluff.

Your output must be valid JSON with exactly these three fields:

"nicheStatement": A single bold sentence (15–25 words) that names what this person does, for whom, and to what outcome. It should feel like relief to read — specific enough to be credible, broad enough to work across industries. Do NOT start with "I help." Try a format like: "She turns [situation] into [outcome] for [client type]." or "[Client type] hire her when [situation] and need [outcome]."

"idealClient": 2–3 sentences describing the exact business or leader this person should target. Include signals like company stage, size, growth moment, or the specific situation that creates urgency. Written in second person ("Your ideal client is...").

"conversationStarter": One natural sentence they can actually say to someone in their network this week. It should sound like a real human talking at a coffee meeting — not a pitch deck. No buzzwords.

Rules:
- No phrases like "leverage," "synergies," "thought leadership," "holistic," "game-changer," or "scalable solutions"
- No promises of passive income, audiences, or viral growth
- Be specific and credible — this audience has 15–25 years of corporate experience and can spot generic output instantly
- The niche statement should make someone exhale and say "that's exactly it"`;

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "Key missing entirely." },
      { status: 500 }
    );
  }

  const keyPreview = `length=${apiKey.length}, starts="${apiKey.slice(0, 10)}", ends="${apiKey.slice(-4)}"`;
  if (!apiKey.startsWith("sk-ant-")) {
    return Response.json(
      { error: `Key format wrong: ${keyPreview}` },
      { status: 500 }
    );
  }

  const client = new Anthropic({ apiKey });

  try {
    const body = await request.json();
    const { answers } = body as { answers: string[] };

    if (!answers || !Array.isArray(answers) || answers.length !== 5) {
      return Response.json(
        { error: "Expected exactly 5 answers." },
        { status: 400 }
      );
    }

    const answersFormatted = answers
      .map((answer, i) => `${QUESTION_LABELS[i]} ${answer}`)
      .join("\n");

    const message = await client.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 600,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Here are the five quiz answers. Generate the consulting niche profile as JSON.

${answersFormatted}

Respond with only valid JSON — no markdown code blocks, no explanation, no extra text.`,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      return Response.json(
        { error: "Unexpected response from AI." },
        { status: 500 }
      );
    }

    // Strip markdown code fences if the model adds them
    const cleaned = content.text
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    let result;
    try {
      result = JSON.parse(cleaned);
    } catch {
      console.error("JSON parse error. Raw response:", content.text);
      return Response.json(
        { error: "Could not parse the AI response. Please try again." },
        { status: 500 }
      );
    }

    if (!result.nicheStatement || !result.idealClient || !result.conversationStarter) {
      return Response.json(
        { error: "Incomplete response from AI. Please try again." },
        { status: 500 }
      );
    }

    return Response.json(result);
  } catch (err) {
    console.error("API route error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json(
      { error: `Debug: ${message}` },
      { status: 500 }
    );
  }
}
