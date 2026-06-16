import { describe, it, expect } from 'vitest'
import { formatCurrency, formatDate, formatDateTime, formatNumber } from '@/lib/format'

describe('formatCurrency', () => {
  it('formats zero', () => {
    const result = formatCurrency(0)
    expect(result).toContain('$')
    expect(result).toContain('0')
  })

  it('formats whole number', () => {
    const result = formatCurrency(1500000)
    expect(result).toContain('$')
    expect(result).toContain('1')
  })

  it('formats negative value', () => {
    const result = formatCurrency(-500)
    expect(result).toContain('-')
  })
})

describe('formatDate', () => {
  it('formats a Date object', () => {
    const date = new Date(2025, 0, 15)
    expect(formatDate(date)).toMatch(/\d{2}\/\d{2}\/\d{4}/)
  })

  it('formats an ISO string', () => {
    const result = formatDate('2025-06-15T10:00:00Z')
    expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/)
  })
})

describe('formatDateTime', () => {
  it('includes time component', () => {
    const result = formatDateTime(new Date(2025, 0, 15, 14, 30))
    expect(result).toContain(':')
  })

  it('formats string input', () => {
    const result = formatDateTime('2025-06-15T14:30:00Z')
    expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/)
  })
})

describe('formatNumber', () => {
  it('formats integer with locale separators', () => {
    const result = formatNumber(1234567)
    expect(result).toContain('1')
    expect(result).toContain('.')
  })

  it('formats zero', () => {
    expect(formatNumber(0)).toBe('0')
  })
})
