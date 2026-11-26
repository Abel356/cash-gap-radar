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

  const paidInvoices: Invoice[] = CUSTOMERS.flatMap((customer, customerIndex) =>
    Array.from({ length: 5 }, (_, invoiceIndex) => {
      const dueDate = subDays(today, 38 + invoiceIndex * 31 + customerIndex)
      const amountVariation = [-2, 0, 1, 3, -1][invoiceIndex]
      const paymentVariation = [-18, -9, 0, 9, 18][invoiceIndex]
      return {
        id: `paid-${customerIndex}-${invoiceIndex}`,
        customer: customer.name,
        invoiceNumber: `MM-${2300 + customerIndex * 10 + invoiceIndex}`,
        amount: customer.amount + amountVariation * 90,
        issueDate: subDays(dueDate, 30),
        dueDate,
        paidDate: addDays(dueDate, customer.lateness + paymentVariation),
      }
    }),
  )

  const openInvoices: Invoice[] = [
    {
      id: 'open-riverside', customer: 'Riverside Condos', invoiceNumber: 'MM-2418', amount: 9800,
      issueDate: subDays(today, 18), dueDate: addDays(today, 8),
    },
    {
      id: 'open-cedar', customer: 'Cedar Lane Clinic', invoiceNumber: 'MM-2421', amount: 7600,
      issueDate: subDays(today, 9), dueDate: addDays(today, 21),
    },
    {
      id: 'open-harbor', customer: 'Harbor Dental', invoiceNumber: 'MM-2412', amount: 8400,
      issueDate: subDays(today, 12), dueDate: addDays(today, 18),
    },
    {
      id: 'open-pine', customer: 'Pine & Co.', invoiceNumber: 'MM-2415', amount: 6900,
      issueDate: subDays(today, 6), dueDate: addDays(today, 24),
    },
    {
      id: 'open-northstar', customer: 'Northstar Realty', invoiceNumber: 'MM-2423', amount: 5600,
      issueDate: addDays(today, 10), dueDate: addDays(today, 40),
    },
  ]

  return {
    businessName: 'Maple & Main Landscaping',
    transactions,
    invoices: [...paidInvoices, ...openInvoices],
    openingBalance: 10_510,
    safetyBuffer: 9_100,
  }
}

export function createNoShortfallData(today = new Date()): DemoDataset {
  return { ...createDemoData(today), businessName: 'Maple & Main — healthy case', openingBalance: 92_000 }
}
