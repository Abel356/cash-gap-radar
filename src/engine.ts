import {
  addDays,
  differenceInCalendarDays,
  endOfWeek,
  isAfter,
  isBefore,
  isWithinInterval,
  startOfWeek,
} from 'date-fns'
import type {
  CustomerProfile,
  Fix,
  ForecastInput,
  ForecastResult,
  Invoice,
  ProjectedItem,
  RecurringItem,
  Scenario,
  ScenarioProjection,
  Transaction,
} from './types'

const SCENARIOS: Scenario[] = ['optimistic', 'expected', 'cautious']
const CADENCES = [7, 14, 30, 31]
const PAYROLL_TERMS = /\b(payroll|salary|adp|gusto|wages)\b/i
const CRITICAL_TERMS = /\b(rent|insurance|tax|taxes)\b/i

export function normalizeDescription(description: string): string {
  return description
    .toLowerCase()
    .replace(/\b(?:ref|txn|transaction|payment|id)[-\s:#]*[a-z0-9-]+\b/gi, ' ')
    .replace(/\d+/g, ' ')
    .replace(/[^a-z\s&]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function median(values: number[]): number {
  if (!values.length) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2
}

export function percentile(values: number[], p: number): number {
  if (!values.length) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const index = (sorted.length - 1) * p
  const low = Math.floor(index)
  const high = Math.ceil(index)
  if (low === high) return sorted[low]
  return sorted[low] + (sorted[high] - sorted[low]) * (index - low)
}

export function detectRecurring(transactions: Transaction[]): RecurringItem[] {
  const groups = new Map<string, Transaction[]>()
  for (const transaction of transactions) {
    const normalized = normalizeDescription(transaction.description)
    const key = `${transaction.amount >= 0 ? 'in' : 'out'}:${normalized}`
    groups.set(key, [...(groups.get(key) ?? []), transaction])
  }

  const detected: RecurringItem[] = []
  for (const [key, group] of groups) {
    if (group.length < 3) continue
    const sorted = [...group].sort((a, b) => a.date.getTime() - b.date.getTime())
    const gaps = sorted.slice(1).map((item, index) =>
      differenceInCalendarDays(item.date, sorted[index].date),
    )
    const gapMedian = median(gaps)
    const cadence = CADENCES.find((candidate) => Math.abs(candidate - gapMedian) <= 3)
    if (!cadence) continue

    const amounts = sorted.map((item) => Math.abs(item.amount))
    const amountMedian = median(amounts)
    const stable = amounts.every((amount) =>
      amountMedian === 0 ? amount === 0 : Math.abs(amount - amountMedian) / amountMedian <= 0.15,
    )
    if (!stable) continue

    const description = normalizeDescription(sorted[0].description)
    detected.push({
      id: `recurring-${key}`,
      description,
      amount: sorted[0].amount >= 0 ? amountMedian : -amountMedian,
      cadenceDays: cadence,
      lastDate: sorted[sorted.length - 1].date,
      isPayroll: PAYROLL_TERMS.test(description),
      direction: sorted[0].amount >= 0 ? 'inflow' : 'outflow',
    })
  }

  const outflows = detected.filter((item) => item.direction === 'outflow')
  if (outflows.length && !outflows.some((item) => item.isPayroll)) {
    const largest = outflows.reduce((a, b) => Math.abs(a.amount) >= Math.abs(b.amount) ? a : b)
    largest.isPayroll = true
  }
  return detected
}

export function buildCustomerProfiles(invoices: Invoice[]): Record<string, CustomerProfile> {
  const paid = invoices.filter((invoice) => invoice.paidDate)
  const portfolioLateness = paid.map((invoice) =>
    differenceInCalendarDays(invoice.paidDate!, invoice.dueDate),
  )
  const fallback = {
    median: Math.round(median(portfolioLateness)),
    q25: Math.round(percentile(portfolioLateness, 0.25)),
    q75: Math.round(percentile(portfolioLateness, 0.75)),
  }
  const customers = [...new Set(invoices.map((invoice) => invoice.customer))]
  return Object.fromEntries(customers.map((customer) => {
    const values = paid
      .filter((invoice) => invoice.customer === customer)
      .map((invoice) => differenceInCalendarDays(invoice.paidDate!, invoice.dueDate))
    const enough = values.length >= 3
    return [customer, {
      customer,
      medianLateness: enough ? Math.round(median(values)) : fallback.median,
      q25Lateness: enough ? Math.round(percentile(values, 0.25)) : fallback.q25,
      q75Lateness: enough ? Math.round(percentile(values, 0.75)) : fallback.q75,
      sampleSize: values.length,
      confidence: enough ? 'high' : 'low',
    } satisfies CustomerProfile]
  }))
}

function projectedInvoiceDate(
  invoice: Invoice,
  profile: CustomerProfile,
  scenario: Scenario,
  today: Date,
): Date {
  const lateness = scenario === 'optimistic'
    ? profile.q25Lateness
    : scenario === 'cautious'
      ? profile.q75Lateness
      : profile.medianLateness
  let date = addDays(invoice.dueDate, lateness)
  if (isBefore(date, today)) date = today
  if (isBefore(invoice.dueDate, today)) {
    const nudgeFloor = addDays(today, 3)
    if (isBefore(date, nudgeFloor)) date = nudgeFloor
  }
  return date
}

function projectionForScenario(
  input: ForecastInput,
  recurring: RecurringItem[],
  profiles: Record<string, CustomerProfile>,
  scenario: Scenario,
): ScenarioProjection {
  const firstWeek = startOfWeek(input.today, { weekStartsOn: 1 })
  const lastWeekEnd = endOfWeek(addDays(firstWeek, 12 * 7), { weekStartsOn: 1 })
  const items: ProjectedItem[] = []

  for (const item of recurring) {
    let next = addDays(item.lastDate, item.cadenceDays)
    while (isBefore(next, input.today)) next = addDays(next, item.cadenceDays)
    while (!isAfter(next, lastWeekEnd)) {
      items.push({
        id: `${item.id}-${next.toISOString()}`,
        date: next,
        description: item.description,
        amount: item.amount,
        kind: 'recurring',
        recurringId: item.id,
      })
      next = addDays(next, item.cadenceDays)
    }
  }

  for (const invoice of input.invoices.filter((item) => !item.paidDate)) {
    const date = projectedInvoiceDate(invoice, profiles[invoice.customer], scenario, input.today)
    if (!isAfter(date, lastWeekEnd)) {
      items.push({
        id: `invoice-${invoice.id}-${scenario}`,
        date,
        description: `${invoice.customer} · ${invoice.invoiceNumber}`,
        amount: invoice.amount,
        kind: 'invoice',
        invoiceId: invoice.id,
      })
    }
  }

  let balance = input.openingBalance
  const weeks = Array.from({ length: 13 }, (_, index) => {
    const weekStart = addDays(firstWeek, index * 7)
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 })
    const weekItems = items.filter((item) => isWithinInterval(item.date, { start: weekStart, end: weekEnd }))
    const inflows = weekItems.filter((item) => item.amount > 0).reduce((sum, item) => sum + item.amount, 0)
    const outflows = Math.abs(weekItems.filter((item) => item.amount < 0).reduce((sum, item) => sum + item.amount, 0))
    balance += inflows - outflows
    return { weekStart, weekEnd, inflows, outflows, endBalance: balance, items: weekItems }
  })

  const shortWeek = weeks.find((week) => week.endBalance < input.safetyBuffer)
  return {
    weeks,
    shortfall: shortWeek ? {
      week: shortWeek.weekStart,
      amount: input.safetyBuffer - shortWeek.endBalance,
      scenario,
    } : null,
  }
}

function rankFixes(
  input: ForecastInput,
  expected: ScenarioProjection,
  recurring: RecurringItem[],
  profiles: Record<string, CustomerProfile>,
): Fix[] {
  if (!expected.shortfall) return []
  const shortWeek = expected.weeks.find((week) => week.weekStart.getTime() === expected.shortfall!.week.getTime())!
  const candidates: Fix[] = []

  for (const invoice of input.invoices.filter((item) => !item.paidDate)) {
    const expectedDate = projectedInvoiceDate(invoice, profiles[invoice.customer], 'expected', input.today)
    if (isAfter(expectedDate, shortWeek.weekEnd)) {
      const confidencePenalty = profiles[invoice.customer].confidence === 'low' ? 0.72 : 1
      candidates.push({
        id: `chase-${invoice.id}`,
        kind: 'chase-invoice',
        title: `Nudge ${invoice.customer}`,
        detail: `${invoice.invoiceNumber} is forecast after the gap. Ask for payment within 5 days.`,
        impact: invoice.amount,
        effort: 'low',
        invoiceId: invoice.id,
        score: invoice.amount * confidencePenalty,
      })
    }
  }

  const beforeGapItems = expected.weeks
    .filter((week) => !isAfter(week.weekStart, shortWeek.weekStart))
    .flatMap((week) => week.items)
    .filter((item) => item.kind === 'recurring' && item.amount < 0)
  for (const item of beforeGapItems) {
    const recurringItem = recurring.find((recurringEntry) => recurringEntry.id === item.recurringId)
    if (!recurringItem || recurringItem.isPayroll) continue
    const impact = Math.abs(item.amount)
    candidates.push({
      id: `delay-${item.id}`,
      kind: 'delay-bill',
      title: `Move ${titleCase(item.description)}`,
      detail: 'Ask the vendor to move this payment beyond the tight week.',
      impact,
      effort: 'medium',
      recurringId: item.recurringId,
      risk: CRITICAL_TERMS.test(item.description) ? 'Critical vendor — confirm terms first' : undefined,
      score: impact / 2 * (CRITICAL_TERMS.test(item.description) ? 0.55 : 1),
    })
    if (impact >= expected.shortfall.amount * 0.25) {
      candidates.push({
        id: `split-${item.id}`,
        kind: 'split-outflow',
        title: `Split ${titleCase(item.description)}`,
        detail: 'Propose half now and half after the tight week.',
        impact: impact / 2,
        effort: 'medium',
        recurringId: item.recurringId,
        score: impact / 4,
      })
    }
  }

  const ranked = candidates.sort((a, b) => b.score - a.score)
  const selected: Fix[] = []
  let covered = 0
  const seen = new Set<string>()
  for (const fix of ranked) {
    const source = fix.invoiceId ?? fix.recurringId ?? fix.id
    if (seen.has(source)) continue
    selected.push(fix)
    seen.add(source)
    covered += fix.impact
    if (covered >= expected.shortfall.amount || selected.length === 3) break
  }
  return selected
}

function titleCase(value: string): string {
  return value.replace(/\b\w/g, (letter) => letter.toUpperCase())
}

export function forecastCash(input: ForecastInput): ForecastResult {
  const recurring = detectRecurring(input.transactions)
  const profiles = buildCustomerProfiles(input.invoices)
  const scenarios = Object.fromEntries(SCENARIOS.map((scenario) => [
    scenario,
    projectionForScenario(input, recurring, profiles, scenario),
  ])) as Record<Scenario, ScenarioProjection>
  const expected = scenarios.expected
  const shortWeek = expected.shortfall
    ? expected.weeks.find((week) => week.weekStart.getTime() === expected.shortfall!.week.getTime())
    : expected.weeks.reduce((lowest, week) => week.endBalance < lowest.endBalance ? week : lowest)
  const drivers = (shortWeek?.items ?? [])
    .filter((item) => item.amount < 0)
    .sort((a, b) => a.amount - b.amount)
    .slice(0, 3)
    .map((item) => `${titleCase(item.description)} (${Math.abs(item.amount).toLocaleString('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 })})`)
  const fixes = rankFixes(input, expected, recurring, profiles)
  const assumptions = [
    `${recurring.length} repeating cash items were projected from their median cadence and amount.`,
    ...Object.values(profiles).map((profile) => profile.confidence === 'high'
      ? `${profile.customer} usually pays ${profile.medianLateness} days after the due date, based on ${profile.sampleSize} paid invoices.`
      : `${profile.customer} uses the portfolio payment pattern because only ${profile.sampleSize} paid invoice${profile.sampleSize === 1 ? '' : 's'} were found.`),
    `The safety line is ${input.safetyBuffer.toLocaleString('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 })}.`,
  ]
  const confidence = Object.values(profiles).some((profile) => profile.confidence === 'low') ? 'low' : 'high'
  return { scenarios, profiles, recurring, drivers, fixes, assumptions, confidence }
}
