import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteFooter, SiteHeader } from "@/components/site-header";
import { Pipeline } from "@/components/pipeline";

export const Route = createFileRoute("/how-it-works")({ component: How });

const RULES = [
  "No vertical literals in the engine. Industry language lives in tenant config.",
  "The LLM never decides whether to act, only how to phrase it.",
  "Nothing sends without a recorded human approval.",
  "Consent is checked at send time, never at compose time.",
  "Every external mutation writes an audit row with a correlation id.",
  "A kill switch per tenant stops scheduled work and leaves the data intact.",
  "Baseline measurement blocks onboarding completion. No baseline, no write access.",
  "Every product works from a CSV import. Cloud connectors are a better read, not a requirement.",
];

const VALIDATORS = [
  "Banned words",
  "No dash characters",
  "No ask in early rounds of nurture",
  "No price claims the source does not support",
  "Every factual claim traces to evidence",
  "The evidence quote must appear verbatim in the source",
  "Draft long enough to send",
  "Recommended work named in the body when the source has it",
];

function How() {
  return (
    <div className="min-h-dvh bg-paper">
      <SiteHeader solid />
      <main className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
        <p className="text-xs font-medium tracking-wide text-forest uppercase">How it works</p>
        <h1 className="mt-3 max-w-2xl font-display text-4xl sm:text-5xl">One experienced sales leader, multiplied.</h1>
        <p className="mt-4 max-w-2xl text-lg text-muted">
          The catalog is the whole flow: attention through advocacy, plus people, process, knowledge, and paperwork.
          Each product is a detector bundle, a message or a board item, and a human approval. Adding one does not
          touch the engine. This is not software you run. It is operated for you.
        </p>

        <div className="mt-12 rounded-xl bg-cream p-6 shadow-(--shadow-card) sm:p-8">
          <Pipeline />
        </div>

        <section className="mt-16 grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-2xl">Standing rules</h2>
            <ol className="mt-6 grid gap-4">
              {RULES.map((r, i) => (
                <li key={r} className="flex gap-4 border-t border-line pt-4">
                  <span className="font-mono text-xs text-faint">{String(i + 1).padStart(2, "0")}</span>
                  <p>{r}</p>
                </li>
              ))}
            </ol>
          </div>
          <div>
            <h2 className="font-display text-2xl">Eight validators, before a human sees it</h2>
            <ul className="mt-6 grid gap-3">
              {VALIDATORS.map((v) => (
                <li key={v} className="rounded-lg bg-cream px-4 py-3 text-sm shadow-(--shadow-card)">
                  {v}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm text-muted">
              This desk is a dry-run. Approving records a decision and attributes recovered dollars. It does not send
              mail, texts, or write back to the CRM.
            </p>
            <Link to="/enter" className="mt-6 inline-flex min-h-11 items-center rounded-md bg-forest px-5 font-medium text-cream">
              Open the sample desk
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
