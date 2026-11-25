import { describe, expect, it } from 'vitest'
import { parseDateValue, parseMoney, rowsToTransactions } from './csv'

describe('CSV parsing', () => {
  it('parses currency and accounting negatives', () => {
    expect(parseMoney('$1,234.50')).toBe(1234.5)
    expect(parseMoney('($840.00)')).toBe(-840)
  })

  it('supports ISO, month-first, and day-first dates', () => {
    expect(parseDateValue('2026-11-25', 'mdy').getMonth()).toBe(10)
    expect(parseDateValue('11/25/2026', 'mdy').getDate()).toBe(25)
    expect(parseDateValue('25/11/2026', 'dmy').getDate()).toBe(25)
  })

  it('combines separate debit and credit columns', () => {
    const mapping = { date: 'Date', description: 'Memo', amount: '', debit: 'Debit', credit: 'Credit', balance: '' }
    const result = rowsToTransactions([
      { Date: '11/25/2026', Memo: 'Rent', Debit: '3000', Credit: '' },
      { Date: '11/26/2026', Memo: 'Deposit', Debit: '', Credit: '4200' },
    ], mapping, 'mdy')
    expect(result.data.map((item) => item.amount)).toEqual([-3000, 4200])
  })
})
