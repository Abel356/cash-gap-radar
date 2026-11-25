import Papa from 'papaparse'
import { isValid, parse } from 'date-fns'
import type { Invoice, Transaction } from './types'

export type CsvRow = Record<string, string>
export type DateOrder = 'mdy' | 'dmy'

export interface ParsedCsv {
  headers: string[]
  rows: CsvRow[]
  errors: string[]
}

export interface BankMapping {
  date: string
  description: string
  amount: string
  debit: string
  credit: string
  balance: string
}

export interface InvoiceMapping {
  customer: string
  invoiceNumber: string
  amount: string
  issueDate: string
  dueDate: string
  paidDate: string
}

const MAX_BYTES = 5 * 1024 * 1024

export async function readCsv(file: File): Promise<ParsedCsv> {
  if (file.size > MAX_BYTES) throw new Error(`${file.name} is over the 5 MB limit.`)
  return new Promise((resolve, reject) => {
    Papa.parse<CsvRow>(file, {
      header: true,
      skipEmptyLines: 'greedy',
      transformHeader: (header) => header.trim(),
      complete: (result) => resolve({
        headers: result.meta.fields ?? [],
        rows: result.data,
        errors: result.errors.map((error) => `Row ${(error.row ?? 0) + 2}: ${error.message}`),
      }),
      error: (error) => reject(error),
    })
  })
}

function findHeader(headers: string[], candidates: string[]): string {
  const normalized = headers.map((header) => header.toLowerCase().replace(/[^a-z0-9]/g, ''))
  const index = normalized.findIndex((header) => candidates.some((candidate) => header.includes(candidate)))
  return index >= 0 ? headers[index] : ''
}

export function guessBankMapping(headers: string[]): BankMapping {
  return {
    date: findHeader(headers, ['date', 'posted']),
    description: findHeader(headers, ['description', 'merchant', 'memo', 'details', 'name']),
    amount: findHeader(headers, ['amount', 'value']),
    debit: findHeader(headers, ['debit', 'withdrawal', 'moneyout']),
    credit: findHeader(headers, ['credit', 'deposit', 'moneyin']),
    balance: findHeader(headers, ['balance', 'runningbalance']),
  }
}

export function guessInvoiceMapping(headers: string[]): InvoiceMapping {
  return {
    customer: findHeader(headers, ['customer', 'client', 'company', 'name']),
    invoiceNumber: findHeader(headers, ['invoicenumber', 'invoiceid', 'number', 'invoice']),
    amount: findHeader(headers, ['amount', 'total', 'value']),
    issueDate: findHeader(headers, ['issuedate', 'createddate', 'invoicecreated', 'issued']),
    dueDate: findHeader(headers, ['duedate', 'due']),
    paidDate: findHeader(headers, ['paiddate', 'paymentdate', 'paid']),
  }
}

export function parseMoney(value: string | undefined): number {
  if (!value) return 0
  const negative = /^\s*\(.*\)\s*$/.test(value)
  const cleaned = value.replace(/[()$£€¥,\s]/g, '')
  const number = Number(cleaned)
  if (!Number.isFinite(number)) throw new Error(`"${value}" is not a valid amount`)
  return negative ? -Math.abs(number) : number
}

export function parseDateValue(value: string, dateOrder: DateOrder): Date {
  const trimmed = value?.trim()
  if (!trimmed) throw new Error('date is blank')
  const formats = trimmed.match(/^\d{4}-\d{1,2}-\d{1,2}$/)
    ? ['yyyy-M-d']
    : dateOrder === 'dmy'
      ? ['d/M/yyyy', 'd-M-yyyy', 'd MMM yyyy']
      : ['M/d/yyyy', 'M-d-yyyy', 'MMM d yyyy']
  for (const format of formats) {
    const parsed = parse(trimmed, format, new Date(2000, 0, 1))
    if (isValid(parsed)) return parsed
  }
  throw new Error(`"${value}" is not a recognized date`)
}

export function rowsToTransactions(
  rows: CsvRow[],
  mapping: BankMapping,
  dateOrder: DateOrder,
  skipBadRows = false,
): { data: Transaction[]; skipped: string[] } {
  if (!mapping.date || !mapping.description || (!mapping.amount && !mapping.debit && !mapping.credit)) {
    throw new Error('Map a date, description, and either amount or debit/credit columns.')
  }
  const data: Transaction[] = []
  const skipped: string[] = []
  rows.forEach((row, index) => {
    try {
      const amount = mapping.amount
        ? parseMoney(row[mapping.amount])
        : parseMoney(row[mapping.credit]) - Math.abs(parseMoney(row[mapping.debit]))
      data.push({
        id: `bank-${index}`,
        date: parseDateValue(row[mapping.date], dateOrder),
        description: row[mapping.description]?.trim() || 'Unlabelled transaction',
        amount,
        balance: mapping.balance && row[mapping.balance] ? parseMoney(row[mapping.balance]) : undefined,
      })
    } catch (error) {
      const message = `Bank row ${index + 2}: ${(error as Error).message}`
      if (!skipBadRows) throw new Error(message)
      skipped.push(message)
    }
  })
  return { data, skipped }
}

export function rowsToInvoices(
  rows: CsvRow[],
  mapping: InvoiceMapping,
  dateOrder: DateOrder,
  skipBadRows = false,
): { data: Invoice[]; skipped: string[] } {
  const required = [mapping.customer, mapping.invoiceNumber, mapping.amount, mapping.issueDate, mapping.dueDate]
  if (required.some((field) => !field)) {
    throw new Error('Map customer, invoice number, amount, issue date, and due date columns.')
  }
  const data: Invoice[] = []
  const skipped: string[] = []
  rows.forEach((row, index) => {
    try {
      data.push({
        id: `invoice-${index}`,
        customer: row[mapping.customer].trim(),
        invoiceNumber: row[mapping.invoiceNumber].trim(),
        amount: Math.abs(parseMoney(row[mapping.amount])),
        issueDate: parseDateValue(row[mapping.issueDate], dateOrder),
        dueDate: parseDateValue(row[mapping.dueDate], dateOrder),
        paidDate: mapping.paidDate && row[mapping.paidDate]?.trim()
          ? parseDateValue(row[mapping.paidDate], dateOrder)
          : undefined,
      })
    } catch (error) {
      const message = `Invoice row ${index + 2}: ${(error as Error).message}`
      if (!skipBadRows) throw new Error(message)
      skipped.push(message)
    }
  })
  return { data, skipped }
}
