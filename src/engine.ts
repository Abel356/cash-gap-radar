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
