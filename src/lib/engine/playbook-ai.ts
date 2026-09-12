import { createServerFn } from "@tanstack/react-start";
import { computePlaybook, type PlaybookAnswers } from "./playbook";
import { money } from "./ids";

type PhraseInput = { answers: PlaybookAnswers };

function isAnswers(v: unknown): v is PlaybookAnswers {
  if (!v || typeof v !== "object") return false;
  const a = v as PlaybookAnswers;
  return typeof a.company === "string" && typeof a.industry === "string" && typeof a.sellers === "number";
}

export const phrasePlaybook = createServerFn({ method: "POST" })
  .validator((input: PhraseInput) => {
    if (!isAnswers(input?.answers)) throw new Error("Invalid playbook");
    return input;
  })
  .handler(async ({ data }) => {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) return { ok: false as const, error: "Phrasing is not available in this environment." };

    const result = computePlaybook(data.answers);
    const facts = result.opportunities
      .map((o) => `${o.rank}. ${o.title} · ${o.product} · ${money(o.amount)} · ${o.body}`)
      .join("\n");

    const prompt = `You write for Ghost Shift, an AI operations firm for small sales organizations. Voice: calm, specific, first person plural about the work, never a pitch. Banned: em dashes, the words guaranteed and free, exclamation points, emoji.

Rewrite only the three opportunity paragraphs and one sentence that opens the ninety-day roadmap. Do not change any dollar amounts, product names, or ranks. Do not invent metrics. Every claim must rest on the facts below.

Company: ${data.answers.company}
Industry: ${result.industry.label}
Sellers: ${data.answers.sellers}
Revenue: ${money(data.answers.revenue)}
Average deal: ${money(data.answers.avgDeal)}
Score: ${result.score}/100
Recoverable total: ${money(result.total)}
Facts:
${facts}

Return JSON only:
{"opportunities":["...","...","..."],"roadmapLead":"..."}`;

    let res: Response;
    try {
      res = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        signal: AbortSignal.timeout(20000),
        body: JSON.stringify({
          model: "grok-4.5",
          temperature: 0.4,
          max_tokens: 700,
          messages: [{ role: "user", content: prompt }],
        }),
      });
    } catch {
      return { ok: false as const, error: "Phrasing took too long. The numbers still stand." };
    }
    if (!res.ok) return { ok: false as const, error: `Phrasing failed (${res.status}). The numbers still stand.` };

    const body = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const text = body.choices?.[0]?.message?.content ?? "";
    const jsonStart = text.indexOf("{");
    const jsonEnd = text.lastIndexOf("}");
    if (jsonStart < 0 || jsonEnd <= jsonStart) {
      return { ok: false as const, error: "Phrasing came back unreadable. The numbers still stand." };
    }
    try {
      const parsed = JSON.parse(text.slice(jsonStart, jsonEnd + 1)) as {
        opportunities?: unknown;
        roadmapLead?: unknown;
      };
      const opportunities = Array.isArray(parsed.opportunities)
        ? parsed.opportunities.map((x) => String(x).trim()).filter(Boolean).slice(0, 3)
        : [];
      const roadmapLead = typeof parsed.roadmapLead === "string" ? parsed.roadmapLead.trim() : "";
      if (opportunities.length !== 3 || !roadmapLead) {
        return { ok: false as const, error: "Phrasing came back incomplete. The numbers still stand." };
      }
      return { ok: true as const, opportunities, roadmapLead };
    } catch {
      return { ok: false as const, error: "Phrasing came back unreadable. The numbers still stand." };
    }
  });
