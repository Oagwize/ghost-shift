import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { SiteFooter, SiteHeader } from "@/components/site-header";
import { Button, Field, Input, Textarea } from "@/components/ui";
import { useDesk } from "@/lib/engine/store";
import { useAudits } from "@/lib/engine/audit-store";
import { buildGapAudit, deskWorld } from "@/lib/engine/gap-audit";
import { parseCsv, SAMPLE_CSV } from "@/lib/engine/detectors";
import { RIVERSIDE, HARBOR } from "@/lib/engine/seed";
import { uid } from "@/lib/engine/ids";

export const Route = createFileRoute("/audit/")({ component: AuditHome });

function AuditHome() {
  const navigate = useNavigate();
  const save = useAudits((s) => s.save);
  const requestAudit = useDesk((s) => s.requestAudit);
  const shops = useDesk((s) => s.shops);
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [system, setSystem] = useState("CSV");
  const [csv, setCsv] = useState(SAMPLE_CSV);
  const [err, setErr] = useState<string | null>(null);

  function runSample() {
    const shop = shops.find((s) => s.id === RIVERSIDE);
    const report = buildGapAudit({
      company: shop?.name ?? "Northline Supply",
      system: shop?.system ?? "CSV",
      shopId: RIVERSIDE,
      method: "sample",
      world: deskWorld(RIVERSIDE),
    });
    save(report);
    if (name.trim() && email.trim()) {
      requestAudit({ name: name.trim(), shop: shop?.name ?? "Northline Supply", email: email.trim(), system: "CSV" });
    }
    void navigate({ to: "/audit/$id", params: { id: report.id } });
  }

  function runWorkspace(shopId: string) {
    const shop = shops.find((s) => s.id === shopId);
    if (!shop) return;
    const report = buildGapAudit({
      company: shop.name,
      system: shop.system,
      shopId: shop.id,
      method: "workspace",
      world: deskWorld(shop.id),
    });
    save(report);
    void navigate({ to: "/audit/$id", params: { id: report.id } });
  }

  function runCsv(e: React.FormEvent) {
    e.preventDefault();
    if (!company.trim()) {
      setErr("Company name is required.");
      return;
    }
    const shopId = uid("csv");
    const jobs = parseCsv(csv, shopId);
    if (!jobs.length) {
      setErr("That CSV did not parse. Need a header row and at least one account.");
      return;
    }
    const empty = deskWorld(RIVERSIDE);
    const report = buildGapAudit({
      company: company.trim(),
      system,
      shopId,
      method: "csv",
      world: {
        ...empty,
        shopId,
        jobs,
        quotes: [],
        invoices: [],
        payments: [],
        appointments: [],
        contacts: [],
        memberships: [],
        calls: [],
        cues: [],
        enquiries: [],
        works: [],
      },
    });
    save(report);
    if (name.trim() && email.trim()) {
      requestAudit({ name: name.trim(), shop: company.trim(), email: email.trim(), system });
    }
    void navigate({ to: "/audit/$id", params: { id: report.id } });
  }

  return (
    <div className="min-h-dvh bg-paper">
      <SiteHeader solid />
      <main className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
        <p className="text-xs font-medium tracking-wide text-forest uppercase">Gap Audit · self-serve</p>
        <h1 className="mt-3 max-w-2xl font-display text-4xl sm:text-5xl">Your numbers. Ranked fixes. One dollar figure.</h1>
        <p className="mt-4 max-w-xl text-lg text-muted">
          Instant Playbook is the estimate from ten answers. This is the measured number from the records. Read-only.
          Nothing sends. Lost Call Report sits inside it.
        </p>

        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl bg-cream p-6 text-left shadow-(--shadow-card)">
            <p className="text-xs font-medium tracking-wide text-forest uppercase">Fastest</p>
            <h2 className="mt-2 font-display text-2xl">Run the Northline sample</h2>
            <p className="mt-2 text-sm text-muted">
              The export already on this desk. Buying cues, quiet proposals, inbound that died, aging. Ten seconds.
            </p>
            <Button type="button" className="mt-6" onClick={runSample}>
              Build the report
            </Button>
          </div>
          <div className="rounded-xl bg-cream p-6 shadow-(--shadow-card)">
            <p className="text-xs font-medium tracking-wide text-muted uppercase">From a workspace</p>
            <h2 className="mt-2 font-display text-2xl">Use records already connected</h2>
            <p className="mt-2 text-sm text-muted">Meridian only has what onboarding loaded. Northline is the full sample.</p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <Button type="button" variant="outline" onClick={() => runWorkspace(RIVERSIDE)}>
                Northline
              </Button>
              <Button type="button" variant="outline" onClick={() => runWorkspace(HARBOR)}>
                Meridian
              </Button>
            </div>
          </div>
        </div>

        <form onSubmit={runCsv} className="mt-12 grid max-w-2xl gap-4">
          <h2 className="font-display text-2xl">Or paste a CSV</h2>
          <p className="text-sm text-muted">
            Same mapping as the desk. Declined work becomes the recommendation query. Calls and buying cues will be empty
            unless they are in this file.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Your name">
              <Input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
            </Field>
            <Field label="Email">
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
            </Field>
          </div>
          <Field label="Company name">
            <Input value={company} onChange={(e) => setCompany(e.target.value)} required />
          </Field>
          <Field label="System of record" hint="CSV works if you cannot connect yet.">
            <select
              className="min-h-11 w-full rounded-md border border-line bg-paper px-3"
              value={system}
              onChange={(e) => setSystem(e.target.value)}
            >
              <option>CSV</option>
              <option>HubSpot</option>
              <option>Salesforce</option>
            </select>
          </Field>
          <Field label="Export">
            <Textarea value={csv} onChange={(e) => setCsv(e.target.value)} className="min-h-40 font-mono text-sm" />
          </Field>
          {err ? <p className="text-sm text-danger">{err}</p> : null}
          <div className="mb-20 flex flex-col gap-3 pr-24 sm:mb-0 sm:flex-row sm:pr-0">
            <Button type="submit">Build from this file</Button>
            <Link
              to="/playbook"
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-line bg-cream px-5 font-medium"
            >
              I only have ten minutes. Playbook.
            </Link>
          </div>
        </form>
      </main>
      <SiteFooter />
    </div>
  );
}
