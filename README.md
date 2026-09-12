# Ghost Shift

AI operations for small sales organizations.

**The shift you never had to hire.** Run like a company three times your size.

This is the dry-run desk. Instant Playbook, self-serve Gap Audit, Mission Control, and the full product catalog. A person still approves every message. Nothing sends.

## Two seats

No password.

- **Dana Ruiz** — account executive at Northline Supply. Customer queue: overnight replies, missed-call texts, form and chat, quotes, cash.
- **Robert Greenleaf** — operator. Mission Control, both companies, the operator board. He does not sit in Dana's queue unless she is stuck.

Open the sample desk and pick a seat. Reset sample restores the original export.

## What is in here

| Surface | Path | What it is |
|---|---|---|
| Instant Playbook | `/playbook` | Ten questions. A number you can defend. |
| Gap Audit | `/audit` | The measured number. Lost Call Report sits inside it. |
| Catalog | `/catalog` | Every product, in the order a company actually works. |
| Sample desk | `/enter` | Pick Dana or Robert. |
| Mission Control | `/desk` | Robert's home. Inbox, workspaces, board. |
| Rep queue | `/shop` | Dana's list. Approve, skip, or edit. |
| Operator board | `/desk/ops` | Internal work. Scoring, hygiene, pacing, paperwork. |

Sixty installable products. Four public reports. Nine packages. Northline has the catalog on so you can walk the whole list.

## Run it

```bash
npm install
npm run dev
```

Then:

```bash
npm run typecheck
npm run build
```

## Rules this desk keeps

- The model never decides whether to act. Detectors are queries. Drafts sit until a person presses approve.
- Consent is checked at send time. This preview never sends.
- A kill switch per workspace stops scheduled work and leaves the records.
- Baseline measurement blocks write access. Count first.
- No vertical literals in the engine. Industry language lives in tenant config.

## License

Private. All rights reserved.
