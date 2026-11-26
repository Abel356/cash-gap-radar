/// <reference types="vite/client" />
import { addDays, differenceInCalendarDays, format, parseISO } from 'date-fns'
import bankTemplate from '../public/sample-bank.csv?raw'
import invoiceTemplate from '../public/sample-invoices.csv?raw'

const sampleAnchor = new Date(2026, 10, 25)

export function sampleCsv(kind: 'bank' | 'invoices', today = new Date()): string {
  const days = differenceInCalendarDays(today, sampleAnchor)
  const template = kind === 'bank' ? bankTemplate : invoiceTemplate
  return template.replace(/\b2026-\d{2}-\d{2}\b/g, (value) =>
    format(addDays(parseISO(value), days), 'yyyy-MM-dd'),
  )
}

export function downloadSampleCsv(kind: 'bank' | 'invoices'): void {
  const url = URL.createObjectURL(new Blob([sampleCsv(kind)], { type: 'text/csv;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = kind === 'bank' ? 'sample-bank.csv' : 'sample-invoices.csv'
  link.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}
