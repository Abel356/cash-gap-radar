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
