import { useMemo } from 'react'
import { toEuros } from '../lib/currency'
import { groupMonthlySpendings } from '../lib/spendings'
import type { Account, Spending } from '../types'
import { useExchangeRates } from './useExchangeRates'

export function useEuroTotals(accounts: readonly Account[], spendings: readonly Spending[]) {
  const { rates, error, isReady, retry } = useExchangeRates([
    ...accounts.map(account => account.currency),
    ...spendings.map(spending => spending.currency)
  ])

  const totalBalance = useMemo(
    () => isReady
      ? accounts.reduce((total, account) => total + toEuros(account.balance, account.currency, rates), 0)
      : null,
    [accounts, rates, isReady]
  )

  // Memoized separately from balances; only regrouped when spendings or rates change.
  const monthlySpendings = useMemo(
    () => isReady && !error ? groupMonthlySpendings(spendings, rates) : null,
    [spendings, rates, isReady, error]
  )

  const transactions = useMemo(
    () => monthlySpendings?.flatMap(month => [...month.transactions, ...month.received]) ?? null,
    [monthlySpendings]
  )

  return useMemo(
    () => ({ totalBalance, monthlySpendings, transactions, rates, isReady, error, retry }),
    [totalBalance, monthlySpendings, transactions, rates, isReady, error, retry]
  )
}
