# Cash Gap Radar

> Know when cash gets tight, what causes it, and the smallest moves that can close the gap.

## Live product

### [Open Cash Gap Radar](https://cash-gap-radar.vercel.app)

The product is already hosted on Vercel. No installation, local build, account, or bank connection is required.

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
- Browser-based CSV parsing and column mapping
- A 13-week forecast with optimistic, expected, and cautious scenarios
- Recurring cash-flow detection for weekly, biweekly, and monthly patterns
- Customer payment-timing profiles based on paid invoices
- First-shortfall detection against a configurable safety balance
- Ranked invoice, bill-delay, and bill-split actions
- Local, copyable invoice follow-up drafts
- A visual chart, accessible forecast table, assumptions, and pressure points
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

## How to test the hosted product

Open [cash-gap-radar.vercel.app](https://cash-gap-radar.vercel.app) in a modern desktop browser. A desktop is recommended for checking the hover effects; the core forecast also works on smaller screens.

No terminal, source-code download, package installation, or development environment is needed for the tests below.

### Test 1: Landing page and demo entry

1. Confirm the page loads with the Cash Gap Radar logo.
2. Confirm **Try the live demo** and **Upload my data** are visible.
3. Hover the main forecast preview, individual chart bars, floating notes, both buttons, and the three lower information blocks.
4. Confirm the preview's **Safety line** text remains readable above the chart bars.
5. Select **Try the live demo**.

Expected result: the hover effects lift the elements without hiding text. The demo opens **Your 13-week cash radar** for **Maple & Main Landscaping** and shows a **Synthetic demo** badge.

Why this matters: a potential customer or recruiter can understand the product and reach a working forecast immediately without sharing financial data.

### Test 2: Forecast summary and chart

1. Read the main forecast headline.
2. Confirm the summary shows **Projected gap**, **Safety line**, and **Forecast confidence**.
3. Hover several weeks in the chart.
4. Confirm each tooltip shows money in, money out, and ending balance.
5. Expand **View accessible forecast table** below the chart.

Expected result: the table contains exactly 13 weekly rows. Every row shows inflows, outflows, ending balance, and either **Above safety line** or **Below safety line**. A week is below the line only when its ending balance is lower than the displayed safety amount.

The demo is generated relative to the date it is opened. Dates and dollar values can change over time, so the stable test is the 13-week structure and the relationship between the balance and safety line—not one hard-coded gap amount.

Why this matters: the company receives a time-bound warning rather than only a current balance. The table also makes the chart values inspectable and accessible.

### Test 3: Scenario comparison

1. Select **Optimistic**.
2. Select **Expected**.
3. Select **Cautious**.
4. Watch the headline, projected gap, and balance line after each selection.

Expected result: the selected scenario is visibly active. Optimistic uses earlier observed customer-payment timing, expected uses median timing, and cautious uses later timing. The forecast can change when invoice timing moves between weeks. Some weeks can remain identical when no receipt moves.

Why this matters: the company can examine timing risk instead of treating a single forecast as certain.

### Test 4: Recommended actions

1. Find **Ways to close the gap**.
2. Open the first recommended action.
3. If it is an invoice action, review the invoice number, amount, due date, and follow-up draft.
4. Select **Copy message**.
5. If it is a bill action, review the next step, estimated impact, and any risk warning.
6. Close the dialog.

Expected result: invoice actions show a locally generated message and briefly change the button to **Copied to clipboard**. Bill actions show the proposed timing change. The application does not send a message, contact a customer, move a payment, or change accounting records.

Why this matters: the product turns a warning into a concrete collections or payment-planning task while leaving the final decision with the business.

### Test 5: Assumptions, drivers, and print view

1. Expand **How this forecast was built**.
2. Review **What drives the tight week**.
3. Select the download icon in the top navigation.

Expected result: the assumptions explain repeating cash items, customer payment-history logic, and the selected safety line. The driver section lists up to three large outflows from the relevant week. The download icon opens the browser print dialog, where **Save as PDF** can be selected when supported by the browser.

Why this matters: a decision-maker can challenge the forecast assumptions, identify the source of pressure, and save a review copy. The application itself does not upload or email that PDF.

## Test the full upload workflow

Use these synthetic files so no real financial information is required:

- [Open or download the sample bank CSV](https://raw.githubusercontent.com/Abel356/cash-gap-radar/main/public/sample-bank.csv)
- [Open or download the sample invoice CSV](https://raw.githubusercontent.com/Abel356/cash-gap-radar/main/public/sample-invoices.csv)

If a link opens as text instead of downloading, use the browser's **Save page as** command and keep the .csv file extension.

1. Open the [hosted product](https://cash-gap-radar.vercel.app).
2. Select **Upload my data**.
3. In **Bank transactions**, choose the downloaded sample-bank.csv.
4. In **Invoices**, choose the downloaded sample-invoices.csv.
5. Leave the date format at **MM/DD/YYYY**. The sample uses ISO dates, which are recognized independently of this selector.
6. Confirm the bank mapping matches date, description, amount, and balance.
7. Confirm the invoice mapping matches customer, invoice_number, amount, issue_date, due_date, and paid_date.
8. Select **Set my safety line**.
9. Confirm **Current bank balance** is **$35,500**. This comes from the latest dated balance row in the sample.
10. Confirm **Safety buffer** is **$9,100**. This is suggested from the largest payroll-like transaction in the sample.
11. Select **Build my 13-week radar**.

Expected result: the dashboard states that it was updated from **10 transactions and 8 invoices**. It creates 13 weekly rows, provides three scenarios, lists forecast assumptions, and offers actions when the expected forecast crosses the safety line.

Forecast dates and totals depend on the date the test is performed. The stable acceptance checks are the file counts, the two prefilled amounts, the 13-week structure, and the presence of scenario and assumption controls.

Why this matters: this test covers the full customer journey from two common accounting exports to a decision-ready forecast without requiring a bank integration or exposing real company data.

### Test data requirements

For another bank CSV:

- required: date, description, and either one signed amount column or separate debit and credit columns;
- optional: running balance, which can prefill the current balance;
- outflows in a signed amount column must be negative.

For another invoice CSV:

- required: customer, invoice number, amount, issue date, and due date;
- optional: paid date; a blank paid date represents an open invoice.

Supported dates include ISO YYYY-MM-DD, slash or dash month-first dates, slash or dash day-first dates, and abbreviated month names. The date-format selector controls ambiguous non-ISO dates. Each file must be 5 MB or smaller.

## Hosted-product troubleshooting

- **The page appears stale:** refresh it once. A refresh also clears the current in-browser forecast session.
- **A sample link opens as text:** save the page with a .csv extension, then select that saved file in the upload screen.
- **A CSV column is mapped incorrectly:** change the relevant mapping dropdown before selecting **Set my safety line**.
- **A row contains an invalid date or amount:** correct the source file, or use **Skip bad rows and continue** after reviewing the warning.
- **Copy message does not work:** allow clipboard access for cash-gap-radar.vercel.app, or select and copy the visible draft manually.
- **The print dialog does not open:** allow browser dialogs and try the download icon again.

## Verified status

- Automated parser and forecast-engine suite: **10 of 10 tests passing**
- Vercel production deployment: **live**
- Public URL: [cash-gap-radar.vercel.app](https://cash-gap-radar.vercel.app)

## Technology

Vite, React, TypeScript, Papa Parse, date-fns, Recharts, Vitest, and Vercel.
