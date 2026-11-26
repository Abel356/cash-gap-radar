# Cash Gap Radar

> Know when cash gets tight, what causes it, and the smallest moves that can close the gap.

## Live product

### [Open Cash Gap Radar](https://cash-gap-radar.vercel.app)

No signup or bank connection is required. Select **Try the live demo** to reach a working forecast immediately.

## The problem

Small-business owners often discover a cash shortfall only days before payroll or rent is due. The information they need is split between bank activity, outstanding invoices, and recurring obligations—and customer due dates rarely reflect when customers actually pay.

Cash Gap Radar turns those scattered signals into one direct answer:

> “You’re short $4,200 in the week of March 10. Two invoices can cover it.”

## What the product does

- Forecasts the next 13 weeks in optimistic, expected, and cautious scenarios
- Learns customer payment timing from historical invoices
- Detects recurring inflows, payroll, rent, subscriptions, and other outflows
- Identifies the first week that falls below a user-defined safety buffer
- Ranks the smallest practical actions by cash impact, effort, risk, and confidence
- Creates editable invoice follow-up drafts locally
- Explains every assumption in plain language
- Provides an accessible forecast table and print-to-PDF view

## Quick walkthrough

1. Open the live product.
2. Select **Try the live demo**.
3. Compare the three forecast scenarios and inspect the tight week.
4. Open the recommended invoice actions to see how the gap can be covered.

The demo uses a synthetic nine-person landscaping company with deliberately different customer payment habits and a seeded payroll shortfall.

## Product principles

**Specific over generic.** The product recommends concrete invoices and bills instead of showing another passive dashboard.

**Behavior over due dates.** Forecast dates are based on how each customer has historically paid.

**Language, not AI math.** Every number comes from a deterministic TypeScript engine. Message drafts use a reliable local template.

**Private by default.** Uploaded files are parsed in the browser. There are no accounts, databases, bank connections, or stored transaction records.

## Technology

Vite, React, TypeScript, Papa Parse, date-fns, Recharts, Vitest, and Vercel.

## Current status

The complete P0 product flow is live: demo mode, uploaded-data onboarding, column mapping, safety-buffer setup, three-scenario forecasting, shortfall detection, ranked fixes, assumptions, draft messages, responsive layouts, accessibility support, and PDF printing.
