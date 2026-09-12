const STEPS = [
  { n: "01", name: "Read", text: "CSV export or the CRM you already pay for. Import first, always." },
  { n: "02", name: "Model", text: "Accounts, proposals, invoices, meetings. Vendor fields kept in a raw column." },
  { n: "03", name: "Detect", text: "Deterministic queries. The model never decides whether to act." },
  { n: "04", name: "Draft", text: "Phrasing only, in the rep's voice, through eight validators." },
  { n: "05", name: "Approve", text: "One item, evidence left, draft right. Three actions. A person, always." },
  { n: "06", name: "Execute", text: "Dry-run in this desk. Live send is send-as the customer, never our domain." },
  { n: "07", name: "Measure", text: "Baseline before write access. Attribution only when the chain is complete." },
];

export function Pipeline() {
  return (
    <ol className="grid gap-0 sm:grid-cols-2 lg:grid-cols-7">
      {STEPS.map((s) => (
        <li key={s.n} className="border-t border-line py-5 pr-4 sm:border-t-0 sm:border-l sm:pl-4 sm:first:border-l-0 sm:first:pl-0">
          <p className="font-mono text-xs text-faint">{s.n}</p>
          <p className="mt-2 font-display text-lg">{s.name}</p>
          <p className="mt-2 text-sm text-muted">{s.text}</p>
        </li>
      ))}
    </ol>
  );
}
