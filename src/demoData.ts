import { addDays, subDays } from 'date-fns'
import type { Invoice, Transaction } from './types'

export interface DemoDataset {
  businessName: string
  transactions: Transaction[]
  invoices: Invoice[]
  openingBalance: number
  safetyBuffer: number
}

const CUSTOMERS = [
  { name: 'Riverside Condos', lateness: 1, amount: 6800 },
  { name: 'Cedar Lane Clinic', lateness: 4, amount: 7200 },
  { name: 'Harbor Dental', lateness: 25, amount: 8400 },
  { name: 'Pine & Co.', lateness: 19, amount: 6900 },
  { name: 'Northstar Realty', lateness: 8, amount: 5400 },
  { name: 'Westmount School', lateness: 12, amount: 7600 },
  { name: 'Juniper House', lateness: 3, amount: 4800 },
  { name: 'Fieldstone Group', lateness: 15, amount: 6200 },
]

function recurringTransactions(
  today: Date,
  label: string,
  amount: number,
  cadence: number,
  count: number,
  lastOffset: number,
): Transaction[] {
  return Array.from({ length: count }, (_, index) => {
    const stepsBack = count - 1 - index
    return {
      id: `${label}-${index}`,
      date: subDays(today, lastOffset + stepsBack * cadence),
      description: `${label} REF ${1200 + index}`,
      amount,
    }
  })
}

export function createDemoData(today = new Date()): DemoDataset {
  const transactions: Transaction[] = [
    ...recurringTransactions(today, 'Gusto payroll', -9100, 14, 12, 9),
    ...recurringTransactions(today, 'Studio rent', -3100, 30, 6, 17),
    ...recurringTransactions(today, 'Ford truck lease', -1250, 30, 6, 12),
    ...recurringTransactions(today, 'Field service software', -460, 30, 6, 4),
    ...recurringTransactions(today, 'Seasonal maintenance retainer', 4200, 30, 6, 20),
  ]

