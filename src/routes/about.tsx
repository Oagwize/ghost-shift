import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteFooter, SiteHeader } from "@/components/site-header";

export const Route = createFileRoute("/about")({ component: About });

function About() {
  return (
    <div className="min-h-dvh bg-paper">
      <SiteHeader solid />
      <main className="mx-auto max-w-3xl px-5 py-12 sm:px-8">
        <p className="text-xs font-medium tracking-wide text-forest uppercase">About</p>
        <h1 className="mt-3 font-display text-4xl sm:text-5xl">I carried a number for years. Now I build the systems I wish I had.</h1>
        <div className="mt-8 grid gap-6 text-lg text-muted">
          <p>
            I have run sales teams where five people did the work of twelve. The reps were good on the phone and buried
            everywhere else. Follow-ups written at nine at night. Records nobody updated. Deals from six months ago
            nobody called again. A list of names with no reason attached to any of them.
          </p>
          <p>
            I built my way out of it one system at a time. Reading program pages to find out exactly when a school could
            buy. Interviewing a distributor's reps and turning what they knew into a machine that produced 24 meetings
            and $50,000 in its first month. Automating the follow-up, the records and the coaching for the two teams I
            run today, which gave me back about twenty hours a week.
          </p>
          <p>
            That is the whole product. Not a tool I resell. The systems I use to do my own job, built for yours.
          </p>
        </div>
        <h2 className="mt-14 font-display text-2xl">What you are actually buying</h2>
        <p className="mt-4 text-muted">
          A sales leader who has carried a number, systems that do the work of a department, and one person accountable
          for the result. I do the work, I report every week, and my name is on the number.
        </p>
        <p className="mt-4 text-muted">
          Ghost Shift is deliberately small. That is why you get the person who built it instead of the person who sold
          it to you, and why you are not paying for an account manager to sit between you and the work.
        </p>
        <dl className="mt-10 grid gap-6 sm:grid-cols-2">
          <div className="rounded-xl bg-cream p-5 shadow-(--shadow-card)">
            <dt className="text-xs font-medium tracking-wide text-forest uppercase">Right fit</dt>
            <dd className="mt-2 text-sm text-muted">
              Two to fifteen salespeople, a customer system you half trust, and the sense that your team spends more
              time typing than selling.
            </dd>
          </div>
          <div className="rounded-xl bg-cream p-5 shadow-(--shadow-card)">
            <dt className="text-xs font-medium tracking-wide text-muted uppercase">Wrong fit</dt>
            <dd className="mt-2 text-sm text-muted">
              You want software you run yourself, or your customers are giant companies with procurement departments.
            </dd>
          </div>
        </dl>
        <Link to="/audit" className="mt-10 inline-flex min-h-11 items-center rounded-md bg-forest px-5 font-medium text-cream">
          Get the free report
        </Link>
      </main>
      <SiteFooter />
    </div>
  );
}
