import { describe, expect, it } from 'vitest'
import { AMOUNT_PATTERN, roundMoney, validateTransfer } from './transfer'

const recipient = { id: 1, bank: 'HSBC', name: 'Netflix', iban: 'FR76' }

describe('validateTransfer', () => {
  it('requires a recipient', () => {
    expect(validateTransfer(undefined, '10', 100)).toEqual({ ok: false, error: 'Select a recipient.' })
  })

  it.each(['', '0', '.', '0.0'])('rejects the invalid amount "%s"', amount => {
    expect(validateTransfer(recipient, amount, 100)).toEqual({
      ok: false,
      error: 'Enter a valid amount.'
    })
  })

  it('rejects amounts above the balance', () => {
    expect(validateTransfer(recipient, '100.01', 100)).toEqual({
      ok: false,
      error: 'Insufficient balance for this transfer.'
    })
  })

  it('accepts a valid amount, including the full balance', () => {
    expect(validateTransfer(recipient, '100', 100)).toEqual({ ok: true, recipient, amount: 100 })
  })
})

describe('AMOUNT_PATTERN', () => {
  it.each(['', '12', '12.', '.5', '12.50'])('allows "%s"', value => {
    expect(AMOUNT_PATTERN.test(value)).toBe(true)
  })

  it.each(['a', '-1', '1.2.3', '1,5', '1e3'])('rejects "%s"', value => {
    expect(AMOUNT_PATTERN.test(value)).toBe(false)
  })
})

describe('roundMoney', () => {
  it('removes floating-point drift', () => {
    expect(roundMoney(0.1 + 0.2)).toBe(0.3)
  })
})
