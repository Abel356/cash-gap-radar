# Cash Gap Radar

Cash Gap Radar tells a small-business owner when cash is likely to get tight and which small actions can close the gap. Upload a bank-transactions CSV and an invoice CSV, confirm the detected columns, set a safety line, and get a deterministic 13-week forecast in the browser.

> “You’re short $4,200 in the week of March 10. Two invoices can cover it.”

## What is included

- One-click synthetic demo for **Maple & Main Landscaping**
- Client-side CSV parsing, column guesses, previews, date-format control, and row-level errors
- Pure TypeScript forecast engine with optimistic, expected, and cautious scenarios
- Recurring cash-item detection and customer-specific payment-lateness profiles
- Safety-buffer shortfall detection, cash-driver explanations, and ranked fixes
- 13-week accessible chart and table
- Local, editable invoice follow-up drafts with clipboard copy
- Print stylesheet for saving the radar as a PDF
- Responsive mobile and desktop layouts
- Vitest coverage for recurring items, lateness fallback, boundary cases, demo behavior, money parsing, date formats, and debit/credit CSVs

All transaction parsing and forecast math run locally. There is no account, database, bank connection, or file upload.

## Run locally

```bash
npm install
npm run dev
```

Open the URL printed by Vite. For the fastest walkthrough, choose **Try the live demo**.

## Test and build

```bash
npm test
npm run build
```

## CSV shape

Bank CSVs need a date, description, and either a signed amount or separate debit/credit columns. A balance column is optional. Invoice CSVs need customer, invoice number, amount, issue date, due date, and an optional paid date. The mapper handles different header names.

Supported dates are `YYYY-MM-DD`, `MM/DD/YYYY`, and `DD/MM/YYYY` with an explicit toggle. Files over 5 MB are rejected.

## Forecast approach

The engine is a pure function: the same inputs and “today” date produce the same result.

1. Descriptions are normalized and recurring clusters are detected when at least three amounts are stable and their median gap is approximately 7, 14, 30, or 31 days.
2. Paid invoices establish each customer’s median, 25th-percentile, and 75th-percentile lateness. Customers with fewer than three paid invoices use the portfolio pattern and are marked low-confidence.
3. Open invoices and recurring cash items are placed into 13 Monday-starting weeks.
4. The first week below the safety buffer becomes the shortfall week.
5. Candidate fixes are scored by dollars covered per effort, with confidence and critical-vendor risk penalties. The smallest useful set is shown.

The LLM never calculates forecast numbers. The current draft-message fallback is deliberately local and deterministic.

## Product scope

This implementation covers the PRD’s P0 experience and the most resilient P1 pieces. Accounting integrations, bank connections, accounts, automatic sending, and movement of money are intentionally out of scope. The next production step would be a rate-limited language-only proxy for opt-in summaries and message tone, with an exact payload disclosure.

## Privacy

- No file is sent to a server.
- No uploaded rows are persisted.
- No analytics capture file content.
- Demo data is synthetic and visibly labelled.
- Forecast outputs are decision support, not bookkeeping or financial advice.
