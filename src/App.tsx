import { useMemo, useRef, useState } from 'react'
import { format } from 'date-fns'
import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { createDemoData } from './demoData'
import { forecastCash } from './engine'
import {
  guessBankMapping,
  guessInvoiceMapping,
  readCsv,
  rowsToInvoices,
  rowsToTransactions,
  type BankMapping,
  type CsvRow,
  type DateOrder,
  type InvoiceMapping,
  type ParsedCsv,
} from './csv'
import type { Fix, ForecastResult, Invoice, Scenario, Transaction } from './types'

type Screen = 'landing' | 'upload' | 'setup' | 'radar'

interface SessionData {
  businessName: string
  transactions: Transaction[]
  invoices: Invoice[]
  openingBalance: number
  safetyBuffer: number
  isDemo: boolean
  skippedRows?: string[]
}

const CAD = new Intl.NumberFormat('en-CA', {
  style: 'currency',
  currency: 'CAD',
  maximumFractionDigits: 0,
})

function Icon({ name, size = 18 }: { name: string; size?: number }) {
