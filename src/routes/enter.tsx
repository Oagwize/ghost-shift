import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SiteFooter, SiteHeader } from "@/components/site-header";
import { Button, Panel } from "@/components/ui";
import { useDesk } from "@/lib/engine/store";
import { RIVERSIDE } from "@/lib/engine/seed";

export const Route = createFileRoute("/enter")({ component: Enter });

function Enter() {
  const enter = useDesk((s) => s.enter);
  const navigate = useNavigate();

  return (
    <div className="min-h-dvh bg-paper">
      <SiteHeader solid />
      <main className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
        <p className="text-xs font-medium tracking-wide text-forest uppercase">Sample desk</p>
        <h1 className="mt-3 font-display text-4xl">Who is opening it.</h1>
        <p className="mt-3 max-w-xl text-muted">
          No password. Two seats, two jobs. The rep works one queue. Mission Control sees new playbooks, stuck
          onboarding, and both companies.
        </p>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <Panel>
            <p className="text-xs font-medium tracking-wide text-muted uppercase">Rep queue</p>
            <h2 className="mt-2 font-display text-2xl">Dana Ruiz</h2>
            <p className="mt-2 text-sm text-muted">
              Account executive at Northline Supply. Morning replies from overnight inbound sit first, then missed-call
              texts, then form, chat, and the rest of the catalog. She picks from the list. Keyboard A and S. Nothing
              actually leaves.
            </p>
            <Button
              className="mt-6 w-full"
              onClick={() => {
                enter("staff", RIVERSIDE);
                void navigate({ to: "/shop" });
              }}
            >
              Open as Dana
            </Button>
          </Panel>
          <Panel>
            <p className="text-xs font-medium tracking-wide text-muted uppercase">Mission Control</p>
            <h2 className="mt-2 font-display text-2xl">Robert Greenleaf</h2>
            <p className="mt-3 text-sm text-muted">
              Today's work first: new playbooks, report requests, a workspace that still needs a baseline. Then
              the two companies, and the operator board for scoring, hygiene, pacing, and paperwork. He does not sit
              in Dana's queue unless she is stuck.
            </p>
            <Button
              className="mt-6 w-full"
              onClick={() => {
                enter("operator", RIVERSIDE);
                void navigate({ to: "/desk" });
              }}
            >
              Open Mission Control
            </Button>
          </Panel>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
