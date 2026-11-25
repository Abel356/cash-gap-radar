export type Scenario = 'optimistic' | 'expected' | 'cautious'
export type Confidence = 'high' | 'low'

export interface Transaction {
  id: string
  date: Date
  description: string
  amount: number
  balance?: number
}

export interface Invoice {
  id: string
  customer: string
  invoiceNumber: string
  amount: number
  issueDate: Date
  dueDate: Date
  paidDate?: Date
}

export interface CustomerProfile {
  customer: string
  medianLateness: number
  q25Lateness: number
  q75Lateness: number
  sampleSize: number
  confidence: Confidence
}

export interface RecurringItem {
  id: string
  description: string
  amount: number
  cadenceDays: number
  lastDate: Date
  isPayroll: boolean
  direction: 'inflow' | 'outflow'
}

export interface WeekProjection {
  weekStart: Date
  weekEnd: Date
  inflows: number
  outflows: number
  endBalance: number
  items: ProjectedItem[]
}

export interface ProjectedItem {
  id: string
  date: Date
  description: string
  amount: number
  kind: 'invoice' | 'recurring'
  invoiceId?: string
  recurringId?: string
}

export interface Shortfall {
  week: Date
  amount: number
  scenario: Scenario
}

export interface Fix {
  id: string
  kind: 'chase-invoice' | 'delay-bill' | 'split-outflow'
  title: string
  detail: string
  impact: number
  effort: 'low' | 'medium' | 'high'
  risk?: string
  invoiceId?: string
  recurringId?: string
  score: number
}

export interface ScenarioProjection {
  weeks: WeekProjection[]
  shortfall: Shortfall | null
}

export interface ForecastResult {
  scenarios: Record<Scenario, ScenarioProjection>
  profiles: Record<string, CustomerProfile>
  recurring: RecurringItem[]
  drivers: string[]
  fixes: Fix[]
  assumptions: string[]
  confidence: Confidence
}

export interface ForecastInput {
  transactions: Transaction[]
  invoices: Invoice[]
  openingBalance: number
  safetyBuffer: number
  today: Date
}
