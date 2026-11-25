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

## Build and run from start to finish

These instructions start with an empty terminal and end with a tested production build running locally.

### 1. Install the prerequisites

Install the following tools before cloning the project:

- [Git](https://git-scm.com/downloads)
- [Node.js](https://nodejs.org/) `20.19.0` or newer (`22.12.0+` is recommended)
- A current browser such as Chrome, Edge, Firefox, or Safari

Open PowerShell, Terminal, or your preferred shell and confirm the tools are available:

```bash
git --version
node --version
npm --version
```

If one of those commands is not recognized, install that prerequisite, close the terminal, and open a new terminal before continuing.

### 2. Choose a parent folder

The following examples place the project in your Documents folder. You can use any writable folder.

Windows PowerShell:

```powershell
cd "$HOME\Documents"
```

macOS or Linux:

```bash
cd "$HOME/Documents"
```

To confirm your current location:

```bash
pwd
```

### 3. Clone the repository and enter it

```bash
git clone https://github.com/Abel356/cash-gap-radar.git
cd cash-gap-radar
```

Confirm that you are in the correct folder:

```bash
git status
```

You should see the `main` branch and a clean working tree.

If you already downloaded or unzipped the repository, skip `git clone` and change into that folder directly:

Windows PowerShell:

```powershell
cd "C:\path\to\cash-gap-radar"
```

macOS or Linux:

```bash
cd "/path/to/cash-gap-radar"
```

### 4. Install the dependencies

This repository is locked with pnpm. Node ships with Corepack, which can activate the matching package manager:

```bash
corepack enable
corepack prepare pnpm@11.25.0 --activate
pnpm install
```

If Corepack is unavailable, npm also works:

```bash
npm install
```

Use one package manager consistently. The remaining examples use pnpm; replace `pnpm` with `npm run` for scripts when using npm. For example, `pnpm dev` becomes `npm run dev`.

No `.env` file, API key, database, account, or external service is required. The forecast and fallback message drafts run entirely in the browser.

### 5. Start the development server

If you opened a new terminal, return to the repository first (change the path if you cloned it somewhere else):

```bash
cd "$HOME/Documents/cash-gap-radar"
pnpm dev
```

If your prompt is already inside `cash-gap-radar`, run only `pnpm dev`.

Vite prints a local address similar to:

```text
http://localhost:5173/
```

Open that address in your browser. Keep the terminal running while using the app. Press `Ctrl+C` in the terminal when you want to stop the server.

### 6. Try the application

For the fastest walkthrough:

1. Select **Try the live demo**.
2. Switch between **Optimistic**, **Expected**, and **Cautious** scenarios.
3. Review the 13-week chart and ranked fixes.
4. Open an invoice fix and copy the locally generated follow-up draft.
5. Use the download button and your browser's print dialog to save the radar as a PDF.

To test the upload flow, select **Upload my data** and use:

- `public/sample-bank.csv`
- `public/sample-invoices.csv`

Both files are synthetic. They are safe to use for demonstrations.

### 7. Run all automated tests

Open a second terminal or stop the development server, then return to the repository:

Windows PowerShell:

```powershell
cd "$HOME\Documents\cash-gap-radar"
pnpm test
```

macOS or Linux:

```bash
cd "$HOME/Documents/cash-gap-radar"
pnpm test
```

The expected result is two passing test files and ten passing tests.

For watch mode while editing the forecast engine:

```bash
pnpm test:watch
```

### 8. Create the production build

From the repository folder, run:

```bash
pnpm build
```

This command performs two steps:

1. TypeScript checks the application with `tsc -b`.
2. Vite creates an optimized static site in `dist/`.

The build is successful when the command exits without errors and lists files such as `dist/index.html` and `dist/assets/...`.

Vite may display a non-blocking warning that the main JavaScript chunk is larger than 500 kB. The build still succeeds; code splitting is a future optimization.

### 9. Preview the production build

```bash
pnpm preview
```

Open the preview URL printed in the terminal, usually:

```text
http://localhost:4173/
```

This serves the compiled files from `dist/` and is the closest local check to a deployed production site. Press `Ctrl+C` to stop the preview server.

### 10. Pull future updates

Return to the repository and pull the latest `main` branch:

```bash
cd "$HOME/Documents/cash-gap-radar"
git switch main
git pull
pnpm install
pnpm test
pnpm build
```

On Windows PowerShell, `"$HOME/Documents/cash-gap-radar"` also works, or use `"$HOME\Documents\cash-gap-radar"`.

## Available commands

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Start the Vite development server with hot reload |
| `pnpm test` | Run all tests once |
| `pnpm test:watch` | Re-run tests when source files change |
| `pnpm build` | Type-check and create the production build in `dist/` |
| `pnpm preview` | Serve the production build locally |

## Troubleshooting

### `node`, `npm`, or `git` is not recognized

Install the missing prerequisite, close the terminal completely, and open a new one so your `PATH` refreshes.

### The Node.js version is unsupported

Check your version:

```bash
node --version
```

Upgrade to Node `20.19.0+` or `22.12.0+`, then run `pnpm install` again.

### `corepack` or `pnpm` is not recognized

Use npm instead:

```bash
npm install
npm run dev
```

The equivalent test, build, and preview commands are `npm test`, `npm run build`, and `npm run preview`.

### Port 5173 is already in use

Vite normally selects another available port and prints it. You can also choose one explicitly:

```bash
pnpm dev -- --port 5174
```

### The browser shows an old build

Stop the server with `Ctrl+C`, restart it, and perform a hard refresh in the browser. For a production check, rebuild before previewing:

```bash
pnpm build
pnpm preview
```

### Dependency installation is inconsistent

Confirm you are in the repository and use the lockfile:

```bash
cd "$HOME/Documents/cash-gap-radar"
pnpm install --frozen-lockfile
```

If you chose npm instead, continue using npm rather than switching package managers midway.

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
