# Cash Gap Radar

**See when cash may get tight, what is driving it, and which small actions might help.**

### [Open the live product](https://cash-gap-radar.vercel.app)

Cash Gap Radar is a 13-week cash forecast for a small business. It brings together bank transactions, invoices, and a minimum cash balance chosen by the business. The aim is to spot a potential cash shortage before a bill or payroll date arrives, then show a practical next step.

You can explore it immediately in your browser. No account or bank connection is needed.

## Take the two-minute demo tour

1. Open the [live product](https://cash-gap-radar.vercel.app).
2. Click **Try the live demo**.
3. You are now looking at a forecast for **Maple & Main Landscaping**. The **Synthetic demo** badge means the business and its records are examples, not a real customer's data.

The landing page's “Short by $4,200 in 6 weeks” card is an illustration. Use the dashboard after clicking the demo for the calculated forecast. Its dates and amounts are generated relative to the day you open it.

### Start with the main answer

The headline names the first week when the projected **ending balance** falls below the **safety line**. “Projected gap” is the difference between those two amounts in that week:

```text
Projected gap = safety line − projected ending balance
```

The demo starts with **$10,510** in cash and sets the safety line at **$9,100**, matching one recurring payroll payment in its example records. The safety line is a reserve the business wants to keep available. It is not a bill or an overdraft limit. A balance at or above it is considered safe by this product; below it triggers an action warning.

The demo includes **36 past transactions** and **45 invoices**. These counts tell you how much source material fed the forecast, not how many payments will happen in the next 13 weeks. The invoices include paid examples to learn customer habits and five still open invoices to project future receipts.

**Forecast confidence** describes the payment-history evidence. A customer with at least three paid invoices gets a customer-specific pattern; with fewer, the product uses the pattern across all customers and marks confidence as developing. It is not a guarantee that a customer will pay on time.

Why this matters: a business owner can see *when* the reserve may be breached and *how much* cash is needed to get back above it, rather than reacting only to today's bank balance.

### Read the chart

Scroll to **How your balance moves**. Each position is one week in the 13-week forecast:

| What you see | Meaning |
| --- | --- |
| Green **In** bar | Money expected to arrive that week, including projected invoice receipts and repeating inflows |
| Beige **Out** bar | Repeating payments expected that week, such as payroll or rent |
| Dark **Balance** line | Cash expected at the end of the week after adding inflows and subtracting outflows |
| Dashed **Safety line** | The minimum balance the business wants to retain |
| Red point | A week whose ending balance is below the safety line |

Point to a week for its money in, money out, and ending balance amounts. **View accessible forecast table** shows the same weekly figures in rows. A week can have a large inflow and still end below the safety line if payments and its starting balance outweigh that inflow.

Why this matters: the chart makes the timing visible. The owner can see whether a collection is likely to arrive before or after a large payment.

### Compare possible payment timing

Click **Optimistic**, **Expected**, and **Cautious** above the headline. These views use the same invoices and repeating payments, but change when open invoices are expected to be paid:

- **Optimistic:** earlier payment timing seen in the customer's history.
- **Expected:** the customer's typical, median timing.
- **Cautious:** later payment timing seen in that history.

The headline, gap, and chart can change because an invoice may move to a different week. Weeks without a moved receipt can look the same. This is a timing comparison, not three different bank balances or a promise about future payments.

Why this matters: the company can prepare for a slower collection month instead of relying on one exact payment date.

### Look at the suggested moves

Scroll to **Ways to close the gap**. Each card names a possible action and shows **Could cover**: the estimated cash impact if that action succeeds. **Potential coverage** totals the selected actions' estimates. These are opportunities, not money already received or guaranteed savings.

Click **Draft the message** on an invoice action to see the invoice number, amount, due date, and a follow-up message. **Copy message** puts the draft on your clipboard; it does not send an email. A bill action instead describes a possible payment timing change and may include a risk warning. Payroll is not offered as a bill to delay.

Why this matters: the owner can focus on a named invoice or payment, while deciding whether contacting the customer or vendor is appropriate.

### See where the numbers came from

Open **How this forecast was built** for the detected repeating items, customer payment patterns, and safety balance used. **What drives the tight week** names the largest projected outflows in the relevant week. The forecast starts from the opening cash amount, adds projected receipts, and subtracts repeating payments week by week.

The **warning triangle** marks a projected gap or a risk that deserves attention. The **sparkle** marks a suggested move. The **lock** indicates that data is processed in your browser. The **download arrow** opens your browser's print dialog, where you can save a PDF. The radar logo returns to the start; **Start over** clears the current session.

Why this matters: the person making a cash decision can inspect the assumptions and discuss the pressure points instead of trusting an unexplained number.

## Try your own upload with example files

The live demo above generates its own example records. This separate path shows how a business would bring its exports. Download these synthetic CSV files:

- [Sample bank transactions](https://raw.githubusercontent.com/Abel356/cash-gap-radar/main/public/sample-bank.csv)
- [Sample invoices](https://raw.githubusercontent.com/Abel356/cash-gap-radar/main/public/sample-invoices.csv)

If a file opens as text, use your browser's **Save page as** and keep the `.csv` extension.

1. Return to the [landing page](https://cash-gap-radar.vercel.app) and click **Upload my data**.
2. Choose the bank file under **Bank transactions** and the invoice file under **Invoices**.
3. Review the column choices, then click **Set my safety line**.
4. The sample's **Current bank balance** is prefilled as **$35,500** from its latest dated balance row. Its suggested **Safety buffer** is **$9,100**, the largest payroll-like payment in that file. You can change either number.
5. Click **Build my 13-week radar**.

This sample upload contains **10 transactions and 8 invoices**, so its forecast differs from the one-click demo. The app uses the bank amount as a starting point, treats the safety buffer as the threshold, and uses the paid invoices to estimate when the open ones may arrive. Its dates and projected gap depend on when you open it. The sample is useful for seeing the complete upload, mapping, and forecast journey without using a real company's records.

## A few boundaries

Forecasts are directional decision support, not bookkeeping or financial advice. Suggested actions require a person to act; the product does not collect invoices, move payments, or send messages. Uploaded files are processed in the browser and are not stored on a server. Refreshing or closing the page clears the session.
