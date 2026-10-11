import type { Recipient } from '../types'

// Digits with an optional single decimal separator.
export const AMOUNT_PATTERN = /^\d*\.?\d*$/

export const roundMoney = (amount: number) => Math.round(amount * 100) / 100

type TransferValidation =
  | { ok: true; recipient: Recipient; amount: number }
  | { ok: false; error: string }

export function validateTransfer(
  recipient: Recipient | undefined,
  amountInput: string,
  balance: number
): TransferValidation {
  if (!recipient) return { ok: false, error: 'Select a recipient.' }

  const amount = Number(amountInput)
  if (!amountInput || !Number.isFinite(amount) || amount <= 0) {
    return { ok: false, error: 'Enter a valid amount.' }
  }

  if (amount > balance) {
    return { ok: false, error: 'Insufficient balance for this transfer.' }
  }

  return { ok: true, recipient, amount }
}
