# Cash Gap Radar

> Know when cash gets tight, what causes it, and the smallest moves that can close the gap.

## Live product

### [Open Cash Gap Radar](https://cash-gap-radar.vercel.app)

No signup or bank connection is required. Select **Try the live demo** to open a working forecast immediately.

## Why this product exists

Small businesses can appear profitable while still being unable to cover payroll, rent, or another near-term obligation. Cash Gap Radar combines recent bank activity, invoice history, and a user-defined safety balance into a 13-week view. It identifies the first week projected below that safety balance and suggests a small set of actions that could improve the position.

This helps a company:

- see a possible cash problem weeks before the payment is due;
- focus collection work on invoices that can materially change the outcome;
- compare earlier and later customer-payment scenarios;
- understand which recurring payments create the tightest week; and
- discuss a forecast using visible assumptions instead of a hidden score.

The forecast is directional decision support. It is not bookkeeping, accounting, lending, or financial advice.

## What is implemented

- A synthetic demo that works without uploading files
- Local CSV parsing and column mapping for bank transactions and invoices
- A 13-week forecast with optimistic, expected, and cautious scenarios
- Recurring cash-flow detection for weekly, biweekly, and monthly patterns
- Customer payment-timing profiles based on paid invoices
- First-shortfall detection against a configurable safety balance
- Ranked invoice, bill-delay, and bill-split actions
- Local, copyable invoice follow-up drafts
- A chart, an accessible forecast table, assumptions, and pressure points
- Browser printing and Save as PDF support

There is no account system, database, live bank connection, email sender, or server-side storage. Uploaded CSV data is processed in the browser and disappears when the page is refreshed or closed.

## How the forecast works

1. **Read the source files.** The browser parses one bank CSV and one invoice CSV. The user confirms the detected columns before continuing.
2. **Find repeating transactions.** A description is normalized so changing reference numbers do not make the same payment look different. A pattern needs at least three matching transactions, a median interval within three days of 7, 14, 30, or 31 days, and amounts within 15% of the median.
3. **Learn customer timing.** A customer with at least three paid invoices gets its own payment profile. Customers with less history use the portfolio-wide pattern and are marked as lower confidence.
4. **Create three scenarios.** Optimistic uses the 25th-percentile customer delay, expected uses the median delay, and cautious uses the 75th-percentile delay.
5. **Build 13 Monday-based weeks.** Projected invoice receipts and repeating cash items change the opening balance week by week.
6. **Find the first gap.** A week is short only when its ending balance is below the safety line. A balance exactly equal to the safety line is considered safe.
7. **Rank possible moves.** The engine considers collecting invoices forecast after the gap and moving or splitting eligible non-payroll outflows. It returns up to three non-duplicated actions, stopping earlier when their estimated impact covers the expected gap.

All forecast calculations are deterministic TypeScript. The same inputs and date produce the same result.

## Run the project locally from the beginning

These instructions assume no development tools are already installed.

### 1. Install Git

Download and install Git from [git-scm.com](https://git-scm.com/downloads). Accepting the installer defaults is sufficient for this project.

Open a new terminal after installation and verify it:

```text
git --version
```

Expected result: a version such as `git version 2.x.x`. The exact number can differ. If the terminal says the command is unknown, close the terminal, open it again, and retry.

### 2. Install Node.js

Install Node.js 22 LTS from [nodejs.org](https://nodejs.org/). This project uses Vite 7, which requires Node `20.19.0` or newer in the Node 20 line, or Node `22.12.0` or newer.

Open a new terminal and verify both Node and npm:

```text
node --version
npm --version
```

Expected result: both commands print version numbers. `node --version` should satisfy the requirement above.

### 3. Install pnpm

pnpm is the package manager used by this repository. Install pnpm 10:

```text
npm install --global pnpm@10
pnpm --version
```

Expected result: the second command prints a version beginning with `10`.

Windows PowerShell note: if PowerShell blocks `pnpm.ps1`, use `pnpm.cmd` anywhere this guide says `pnpm`, or run the commands in Command Prompt.

### 4. Clone the repository and enter its folder

Choose a parent folder where you want the project to live, then run:

```text
git clone https://github.com/Abel356/cash-gap-radar.git
cd cash-gap-radar
```

The `cd` command is required: all remaining commands must run inside the folder that contains `package.json`.

If the repository was already downloaded as a ZIP, extract it first and use its real path. Examples:

```text
cd "C:\Users\YourName\Downloads\cash-gap-radar"
```

```text
cd "/Users/YourName/Downloads/cash-gap-radar"
```

Quotation marks are required when a folder name contains spaces.

### 5. Install the project dependencies

From the repository folder, run:

```text
pnpm install --frozen-lockfile
```

Expected result: pnpm reads `pnpm-lock.yaml`, creates `node_modules`, and finishes without an error. Package counts and timing vary by computer. The frozen lockfile ensures the dependency versions match the reviewed repository state.

### 6. Start the development website

Run:

```text
pnpm dev
```

Expected terminal output includes a local address, normally:

```text
Local: http://localhost:5173/
```

Keep that terminal open. Open the displayed address in a browser. If port 5173 is already occupied, Vite selects another port; use the address Vite actually prints.

Expected browser result: the Cash Gap Radar landing page appears with **Try the live demo** and **Upload my data** buttons. Changes to source files should refresh the page automatically.

To stop the development server, return to the terminal and press `Ctrl+C`.

## Automated tests

### Run the complete test suite once

Open a terminal, enter the repository folder, and run:

```text
cd cash-gap-radar
pnpm test
```

If the folder is elsewhere, replace `cash-gap-radar` with its full path as shown in the setup section.

Expected summary:

```text
Test Files  2 passed (2)
Tests       10 passed (10)
```

Durations and spacing can differ. A successful command exits without a red failure report.

The ten tests verify:

1. Currency and accounting-style negative amounts are parsed correctly.
2. ISO, month-first, and day-first dates are recognized.
3. Separate debit and credit columns become signed transaction amounts.
4. Changing references and digits are removed from recurring descriptions.
5. A stable biweekly payroll pattern is detected.
6. An irregular one-off supplier pattern is rejected.
7. Thin customer history falls back to portfolio payment timing and lower confidence.
8. The demo produces the same 13-week result for the same date, finds a gap, and returns at least one action.
9. A balance exactly equal to the safety line remains safe.
10. A balance one dollar below the safety line creates a one-dollar shortfall.

Why this matters to the company: parsing tests protect the accuracy of imported financial data; recurrence and customer-profile tests protect the forecast assumptions; boundary tests prevent false alerts at the safety line; and determinism makes a forecast reproducible during review.

### Keep tests running while editing

```text
pnpm test:watch
```

Vitest stays open and reruns affected tests after file changes. Press `q` to quit watch mode.

## Test the production build locally

Create the optimized build:

```text
pnpm build
```

Expected result:

- TypeScript completes without an error.
- Vite reports a successful build.
- A new `dist` folder contains `index.html` and hashed CSS and JavaScript assets.

The current build can print a warning that a JavaScript chunk is larger than 500 kB. That warning is non-fatal; a line ending with `built in ...` confirms success. It is still a useful future performance-improvement signal.

Serve the exact built files:

```text
pnpm preview
```

Expected terminal output normally includes `http://localhost:4173/`. Open the address Vite prints. This step is different from `pnpm dev`: it checks the optimized files that a host would serve.

Stop the preview server with `Ctrl+C`.

## Manual product acceptance test

Run `pnpm dev` or open the [hosted product](https://cash-gap-radar.vercel.app), then complete every check below.

### Test 1: Landing page and demo entry

1. Confirm the landing page renders without a blank screen or browser error.
2. Hover the preview card, chart bars, floating notes, buttons, and the three lower information blocks.
3. Select **Try the live demo**.

Expected result: hover states remain readable, the preview's **Safety line** label stays above its bars, and the demo opens **Your 13-week cash radar** for **Maple & Main Landscaping** with a **Synthetic demo** badge.

Why it matters: this proves a reviewer can understand the value proposition and reach the working product without supplying sensitive data.

### Test 2: Forecast summary and chart

1. Confirm the header states how many transactions and invoices were used.
2. Read the headline, projected gap, safety line, and confidence.
3. Hover several chart weeks to open their tooltips.
4. Expand **View accessible forecast table**.

Expected result: the table contains exactly 13 weekly rows. Each tooltip and row shows inflows, outflows, and ending balance. A row is **Below safety line** only when its ending balance is lower than the displayed safety line.

Exact dates and dollar amounts move with the day the demo is opened, so they should not be hard-coded in a manual check.

Why it matters: the company gets a time-bound warning rather than only a current balance, while the table makes the chart values inspectable and accessible.

### Test 3: Scenario comparison

1. Select **Optimistic**.
2. Select **Expected**.
3. Select **Cautious**.

Expected result: the selected button is visibly active and the headline, chart, or shortfall can update. Optimistic schedules invoice receipts using earlier observed customer timing, expected uses median timing, and cautious uses later observed timing. Some weeks can remain identical when no invoice timing changes in that week.

Why it matters: the business can examine timing risk instead of treating one forecast as certain.

### Test 4: Recommended actions

1. In **Ways to close the gap**, open the first action.
2. If it is an invoice action, review the invoice number, value, due date, and message draft, then select **Copy message**.
3. If it is a bill action, review the estimated impact and any risk warning.
4. Close the dialog.

Expected result: invoice actions produce a local template and briefly show **Copied to clipboard**. Non-invoice actions show the suggested next step. The app does not send a message or move money.

Why it matters: the forecast becomes an actionable collections or payment-planning task while keeping the human in control.

### Test 5: Assumptions, drivers, and print view

1. Expand **How this forecast was built**.
2. Review **What drives the tight week**.
3. Select the download icon in the top navigation.

Expected result: assumptions name detected recurring items, customer-history logic, and the safety line. Drivers list up to three large outflows in the relevant week. The browser print dialog opens, where the user can choose **Save as PDF** if the browser supports it.

Why it matters: a decision-maker can challenge the inputs, see the source of pressure, and share a stable review copy. The application itself does not upload or email the PDF.

## Test the CSV upload workflow with repository samples

1. Return to the landing page and select **Upload my data**.
2. For **Bank transactions**, choose `public/sample-bank.csv` from the cloned repository.
3. For **Invoices**, choose `public/sample-invoices.csv`.
4. Leave the date format at `MM/DD/YYYY`. ISO dates in these samples are recognized independently of that selector.
5. Confirm the bank mapping shows `date`, `description`, `amount`, and `balance` in the matching fields.
6. Confirm the invoice mapping shows `customer`, `invoice_number`, `amount`, `issue_date`, `due_date`, and `paid_date` in the matching fields.
7. Select **Set my safety line**.
8. Confirm **Current bank balance** is prefilled with `$35,500`, taken from the latest dated balance row.
9. Confirm **Safety buffer** is suggested as `$9,100`, the largest payroll-like transaction in the sample.
10. Select **Build my 13-week radar**.

Expected result: the dashboard says it was updated from **10 transactions and 8 invoices**. It builds 13 weeks, shows the three scenarios, and exposes its assumptions. Forecast dates and totals depend on the current date, so the transaction and invoice counts—not a hard-coded gap amount—are the stable acceptance check.

Why it matters: this exercises the complete customer journey from two common accounting exports to a decision-ready forecast without requiring a bank integration.

### CSV requirements for testing other files

Bank CSV:

- required: date, description, and either one signed amount column or separate debit and credit columns;
- optional: running balance, which can prefill the current balance;
- outflows in a signed amount column must be negative.

Invoice CSV:

- required: customer, invoice number, amount, issue date, and due date;
- optional: paid date; a blank paid date represents an open invoice.

Supported dates include ISO `YYYY-MM-DD`, slash or dash month-first dates, slash or dash day-first dates, and abbreviated month names. The date-format selector controls ambiguous non-ISO dates. Each file must be 5 MB or smaller.

## Troubleshooting

- **`git`, `node`, or `pnpm` is not recognized:** reopen the terminal after installation and rerun the version check.
- **PowerShell says scripts are disabled:** replace `pnpm` with `pnpm.cmd` in the command.
- **`ERR_PNPM_OUTDATED_LOCKFILE`:** confirm you cloned the latest `main` branch and did not change `package.json` or `pnpm-lock.yaml`.
- **The page will not open on port 5173:** use the exact Local URL printed by Vite; it may have selected a different port.
- **A CSV column is wrong:** use the mapping dropdowns before selecting **Set my safety line**.
- **A CSV row reports an invalid amount or date:** correct the source row, or use **Skip bad rows and continue** after reviewing the warning.
- **The clipboard button fails:** allow clipboard access for the local or hosted page, then try again. The draft remains visible for manual copying.

## Project map

```text
public/sample-bank.csv       Sample bank activity for upload testing
public/sample-invoices.csv   Sample paid and open invoices for upload testing
src/App.tsx                  Screens, interactions, chart, and action dialogs
src/csv.ts                   CSV reading, mapping, and validation
src/csv.test.ts              CSV unit tests
src/demoData.ts              Synthetic demo generator
src/engine.ts                Deterministic forecasting and action ranking
src/engine.test.ts           Forecast-engine unit tests
src/styles.css               Layout, responsive design, and motion
```

## Technology

Vite, React, TypeScript, Papa Parse, date-fns, Recharts, Vitest, pnpm, and Vercel.
