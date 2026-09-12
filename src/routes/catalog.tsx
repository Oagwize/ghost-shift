import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteFooter, SiteHeader } from "@/components/site-header";
import { CATALOG, PACKAGES, ROUTE_ITEMS, STAGE_NAME, STAGE_ORDER } from "@/lib/engine/catalog";
import type { StageId } from "@/lib/engine/types";

export const Route = createFileRoute("/catalog")({ component: CatalogPage });

function CatalogPage() {
  const byStage = STAGE_ORDER.map((stage) => ({
    stage,
    routes: ROUTE_ITEMS.filter((r) => r.stage === stage),
    products: CATALOG.filter((p) => p.stage === stage),
  })).filter((row) => row.products.length || row.routes.length);

  return (
    <div className="min-h-dvh bg-paper">
      <SiteHeader solid />
      <main className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
        <p className="text-xs font-medium tracking-wide text-forest uppercase">The catalog</p>
        <h1 className="mt-3 max-w-2xl font-display text-4xl sm:text-5xl">Every product, in the order a company actually works.</h1>
        <p className="mt-4 max-w-2xl text-lg text-muted">
          Nine stages, plus people, process, knowledge, and paperwork. Each one is a detector, a draft, and a human
          approval. Turn them on from Mission Control. Nothing sends itself.
        </p>
        <p className="mt-3 text-sm text-muted">
          {CATALOG.length} installable products. {ROUTE_ITEMS.length} public reports. {PACKAGES.length} packages. Dry-run
          on this desk.
        </p>

        <div className="mt-14 grid gap-16">
          {byStage.map((row) => (
            <section key={row.stage}>
              <p className="font-mono text-xs text-faint">{row.stage === "A" || row.stage === "B" || row.stage === "C" || row.stage === "D" ? row.stage : String(row.stage).padStart(2, "0")}</p>
              <h2 className="mt-1 font-display text-3xl">{STAGE_NAME[row.stage as StageId]}</h2>
              <ol className="mt-6 grid gap-6 sm:grid-cols-2">
                {row.routes.map((r) => (
                  <li key={r.name} className="border-t border-line pt-4">
                    <p className="text-xs font-medium tracking-wide text-forest uppercase">Public</p>
                    <h3 className="mt-1 font-display text-xl">{r.name}</h3>
                    <p className="mt-2 text-sm text-muted">{r.pitch}</p>
                    <a href={r.href} className="mt-3 inline-flex min-h-11 items-center text-sm text-forest">
                      Open
                    </a>
                  </li>
                ))}
                {row.products.map((p) => (
                  <li key={p.id} className="border-t border-line pt-4">
                    <p className="text-xs font-medium tracking-wide text-muted uppercase">
                      {p.audience === "rep" ? "Rep queue" : "Operator board"}
                      {p.readOnly ? " · read-only" : ""}
                    </p>
                    <h3 className="mt-1 font-display text-xl">{p.name}</h3>
                    <p className="mt-2 text-sm text-muted">{p.pitch}</p>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>

        <section className="mt-16">
          <p className="font-mono text-xs text-faint">Packaging</p>
          <h2 className="mt-1 font-display text-3xl">How they get sold.</h2>
          <p className="mt-3 max-w-xl text-muted">
            Each package is a container. The products above go inside it. The sample desk is a multi-product retainer
            with the catalog on.
          </p>
          <ol className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {PACKAGES.map((pkg) => (
              <li key={pkg.name} className="border-t border-line pt-4">
                <h3 className="font-display text-xl">{pkg.name}</h3>
                <p className="mt-2 text-sm text-muted">{pkg.contains}</p>
                {pkg.href ? (
                  <a href={pkg.href} className="mt-3 inline-flex min-h-11 items-center text-sm text-forest">
                    Open
                  </a>
                ) : null}
              </li>
            ))}
          </ol>
        </section>

        <div className="mt-16 rounded-xl bg-cream p-6 shadow-(--shadow-card) sm:p-8">
          <h2 className="font-display text-2xl">See them run</h2>
          <p className="mt-2 max-w-xl text-muted">
            Northline has the full catalog on. Dana's queue holds customer work. Robert's board holds internal work.
            Approve still does not send.
          </p>
          <Link
            to="/enter"
            className="mt-6 inline-flex min-h-11 items-center rounded-md bg-forest px-5 font-medium text-cream"
          >
            Open the sample desk
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}