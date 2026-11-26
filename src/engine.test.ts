import { addDays } from 'date-fns'
import Papa from 'papaparse'
import { describe, expect, it } from 'vitest'
import { createDemoData } from './demoData'
import { rowsToInvoices, rowsToTransactions } from './csv'
import { sampleCsv } from './sampleCsv'
import { buildCustomerProfiles, detectRecurring, forecastCash, normalizeDescription } from './engine'
import type { Invoice, Transaction } from './types'

const day = new Date(2026, 10, 25)

describe('normalizeDescription', () => {
  it('removes changing references and digits', () => {
    expect(normalizeDescription('GUSTO Payroll REF: 839201')).toBe('gusto payroll')
  })
})

describe('recurring detection', () => {
  it('finds a stable biweekly item', () => {
    const transactions: Transaction[] = [0, 14, 28, 42].map((offset, index) => ({
      id: `${index}`,
      date: addDays(day, -offset),
      description: `Payroll ref ${100 + index}`,
      amount: -9000,
    }))
    const found = detectRecurring(transactions)
    expect(found).toHaveLength(1)
    expect(found[0]).toMatchObject({ cadenceDays: 14, isPayroll: true, amount: -9000 })
  })

  it('rejects an irregular item', () => {
    const transactions: Transaction[] = [0, 4, 23, 61].map((offset, index) => ({
      id: `${index}`,
      date: addDays(day, -offset),
      description: 'One off supplier',
      amount: -500,
    }))
    expect(detectRecurring(transactions)).toHaveLength(0)
  })
})

describe('customer profiles', () => {
  it('uses portfolio stats when a customer has fewer than 3 paid invoices', () => {
    const invoices: Invoice[] = [
      ...[2, 4, 6].map((late, index) => ({ id: `a${index}`, customer: 'A', invoiceNumber: `A-${index}`, amount: 100, issueDate: day, dueDate: day, paidDate: addDays(day, late) })),
      { id: 'b', customer: 'B', invoiceNumber: 'B-1', amount: 100, issueDate: day, dueDate: day, paidDate: addDays(day, 30) },
    ]
    const profiles = buildCustomerProfiles(invoices)
    expect(profiles.A.confidence).toBe('high')
    expect(profiles.B.confidence).toBe('low')
    expect(profiles.B.medianLateness).toBe(5)
  })
})

describe('13-week forecast', () => {
  it('shows distinct weekly outcomes for all three sample CSV scenarios', () => {
    for (const today of [day, addDays(day, 365)]) {
      const bank = Papa.parse<Record<string, string>>(sampleCsv('bank', today), { header: true, skipEmptyLines: true }).data
      const invoices = Papa.parse<Record<string, string>>(sampleCsv('invoices', today), { header: true, skipEmptyLines: true }).data
      const transactions = rowsToTransactions(bank, { date: 'date', description: 'description', amount: 'amount', balance: 'balance', debit: '', credit: '' }, 'mdy').data
      const invoiceData = rowsToInvoices(invoices, { customer: 'customer', invoiceNumber: 'invoice_number', amount: 'amount', issueDate: 'issue_date', dueDate: 'due_date', paidDate: 'paid_date' }, 'mdy').data
      const result = forecastCash({ transactions, invoices: invoiceData, openingBalance: 35_500, safetyBuffer: 9_100, today })
      const inflows = (scenario: 'optimistic' | 'expected' | 'cautious') => result.scenarios[scenario].weeks.map((week) => week.inflows)
      expect(inflows('optimistic')).not.toEqual(inflows('expected'))
      expect(inflows('expected')).not.toEqual(inflows('cautious'))
    }
  })

  it('keeps the engine deterministic and seeds an actionable demo gap', () => {
    const demo = createDemoData(day)
    const input = { ...demo, today: day }
    const first = forecastCash(input)
    const second = forecastCash(input)
    expect(first.scenarios.expected.weeks.map((week) => week.endBalance)).toEqual(second.scenarios.expected.weeks.map((week) => week.endBalance))
    expect(first.scenarios.expected.weeks).toHaveLength(13)
    expect(first.scenarios.expected.shortfall).not.toBeNull()
    expect(first.fixes.length).toBeGreaterThanOrEqual(1)
  })

  it('treats a balance exactly at the buffer as safe', () => {
    const result = forecastCash({ transactions: [], invoices: [], openingBalance: 5000, safetyBuffer: 5000, today: day })
    expect(result.scenarios.expected.shortfall).toBeNull()
  })

  it('detects a balance below the buffer immediately', () => {
    const result = forecastCash({ transactions: [], invoices: [], openingBalance: 4999, safetyBuffer: 5000, today: day })
    expect(result.scenarios.expected.shortfall?.amount).toBe(1)
  })
})
