import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteFooter, SiteHeader } from "@/components/site-header";
import { PRODUCTS, FLAGSHIP } from "@/lib/engine/products";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <div className="min-h-dvh bg-paper">
      <SiteHeader />
      <main>
        <section className="px-5 pt-10 pb-16 sm:px-8 sm:pt-16 sm:pb-24">
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div>
              <p className="text-xs font-medium tracking-wide text-forest uppercase">The shift you never had to hire</p>
              <h1 className="mt-4 max-w-xl font-display text-4xl font-medium tracking-tight sm:text-6xl">
                Run like a company three times your size.
              </h1>
              <p className="mt-6 max-w-lg text-lg text-muted">
                You have five salespeople. Your competitor has fifteen, plus ops, plus someone whose whole job is
                follow-up. Ghost Shift takes what a good sales leader does and runs it continuously, inside the tools you
                already have. Your people keep the conversations. Nothing around the conversation waits on hiring.
              </p>
              <div className="mt-8 mb-20 flex flex-col gap-3 pr-24 sm:mb-0 sm:flex-row sm:pr-0">
                <Link
                  to="/playbook"
                  className="inline-flex min-h-11 items-center justify-center rounded-md bg-forest px-5 font-medium text-cream"
                >
                  Get a playbook
                </Link>
                <Link
                  to="/enter"
                  className="inline-flex min-h-11 items-center justify-center rounded-md border border-line bg-cream px-5 font-medium"
                >
                  Open the sample desk
                </Link>
              </div>
            </div>
            <aside className="rounded-xl bg-cream p-6 shadow-(--shadow-card)">
              <p className="text-xs font-medium tracking-wide text-muted uppercase">Instant Playbook</p>
              <p className="mt-4 font-display text-4xl tabular-nums tracking-tight">Ten questions</p>
              <p className="mt-1 text-sm text-muted">Five minutes. A number you can defend.</p>
              <dl className="mt-6 grid gap-3 text-sm">
                <div className="flex justify-between gap-4 border-t border-line pt-3">
                  <dt className="text-muted">Loss estimate</dt>
                  <dd>Five queries, shown</dd>
                </div>
                <div className="flex justify-between gap-4 border-t border-line pt-3">
                  <dt className="text-muted">Industry score</dt>
                  <dd>Against the table</dd>
                </div>
                <div className="flex justify-between gap-4 border-t border-line pt-3">
                  <dt className="text-muted">Ninety days</dt>
                  <dd>Printable, shareable</dd>
                </div>
              </dl>
            </aside>
          </div>
        </section>

        <section className="border-y border-line bg-cream px-5 py-12 sm:px-8">
          <div className="mx-auto max-w-6xl">
            <p className="text-xs font-medium tracking-wide text-muted uppercase">Six roles. One monthly fee. No hires.</p>
            <h2 className="mt-2 font-display text-3xl">What your team gets</h2>
            <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                ["A researcher who never stops", "Every day, companies with a real reason to buy. Not names. Reasons, with the source attached."],
                ["A writer for every rep", "Follow-ups drafted in each rep's own voice from what was said on the call. They read and send."],
                ["Someone who never forgets a deal", "Every deal that went quiet gets contacted again on schedule, with something useful."],
                ["A coach in every call", "Recordings scored weekly against what your best rep does, with one thing for each person to fix."],
                ["An operations manager", "Records stay clean, leads get routed, the pipeline meeting is prepared before anyone walks in."],
                ["A sales leader on call", "Strategy, reviews, and the number. Me. Not a dashboard you have to run."],
              ].map(([title, body]) => (
                <li key={title} className="border-t border-line pt-4">
                  <h3 className="font-display text-xl">{title}</h3>
                  <p className="mt-2 text-sm text-muted">{body}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="px-5 py-16 sm:px-8">
          <div className="mx-auto max-w-6xl">
            <p className="text-xs font-medium tracking-wide text-muted uppercase">Already built</p>
            <h2 className="mt-2 max-w-xl font-display text-3xl">The products that go in first, and the rest of the catalog behind them.</h2>
            <ol className="mt-10 grid gap-8 lg:grid-cols-2">
              {PRODUCTS.filter((p) => FLAGSHIP.includes(p.id)).map((p, i) => (
                <li key={p.id} className="border-t border-line pt-5">
                  <p className="font-mono text-xs text-faint">{String(i + 1).padStart(2, "0")}</p>
                  <h3 className="mt-2 font-display text-2xl">{p.name}</h3>
                  <p className="mt-2 text-muted">{p.pitch}</p>
                </li>
              ))}
            </ol>
            <Link to="/catalog" className="mt-10 inline-flex min-h-11 items-center text-forest">
              Full catalog · {PRODUCTS.length} products
            </Link>
          </div>
        </section>

        <section className="border-y border-line bg-cream px-5 py-16 sm:px-8">
          <div className="mx-auto max-w-6xl">
            <p className="text-xs font-medium tracking-wide text-muted uppercase">The part I prove</p>
            <h2 className="mt-2 font-display text-3xl">I count before I touch anything, and again after sixty days.</h2>
            <p className="mt-4 max-w-2xl text-muted">
              Hours per rep on follow-up and admin. Deals with a real next step. Time to first call on a new lead. Dead
              deals reopened. What came back in revenue. If the numbers have not moved by month two, cancel.
            </p>
            <dl className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <dt className="text-xs font-medium tracking-wide text-muted uppercase">Same salespeople</dt>
                <dd className="mt-2 font-display text-2xl">$1.6M to $4.5M</dd>
                <p className="mt-1 text-sm text-muted">In a year. No new hires.</p>
              </div>
              <div>
                <dt className="text-xs font-medium tracking-wide text-muted uppercase">Same story</dt>
                <dd className="mt-2 font-display text-2xl">$1M to $3M</dd>
                <p className="mt-1 text-sm text-muted">Different company. Same year.</p>
              </div>
              <div>
                <dt className="text-xs font-medium tracking-wide text-muted uppercase">First month, a distributor</dt>
                <dd className="mt-2 font-display text-2xl">24 meetings</dd>
                <p className="mt-1 text-sm text-muted">$50,000 from a call list built out of public announcements.</p>
              </div>
              <div>
                <dt className="text-xs font-medium tracking-wide text-muted uppercase">Hours back</dt>
                <dd className="mt-2 font-display text-2xl">About 20 / week</dd>
                <p className="mt-1 text-sm text-muted">For the person running it. That is why this exists.</p>
              </div>
            </dl>
          </div>
        </section>

        <section className="px-5 py-16 sm:px-8">
          <div className="mx-auto grid max-w-6xl gap-8 rounded-xl bg-forest px-6 py-10 text-cream sm:px-10 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="font-display text-3xl">A person on your team reads every message.</h2>
              <p className="mt-3 text-cream/80">
                Never a send on its own. The model never decides whether to act. Detectors are queries. Drafts sit until
                a rep presses approve. Unapproved items expire and never execute.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
              <Link
                to="/how-it-works"
                className="inline-flex min-h-11 items-center justify-center rounded-md bg-cream px-5 font-medium text-forest"
              >
                How it runs
              </Link>
              <Link
                to="/enter"
                className="inline-flex min-h-11 items-center justify-center rounded-md border border-cream/30 px-5 font-medium text-cream"
              >
                Try the queue
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
