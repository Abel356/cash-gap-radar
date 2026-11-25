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

