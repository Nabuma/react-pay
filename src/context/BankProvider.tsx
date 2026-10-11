import { useMemo, type ReactNode } from 'react'
import { useBank } from '../hooks/useBank'
import { useEuroTotals } from '../hooks/useEuroTotals'
import type { DemoUser } from '../types'
import { BankContext } from './bankContext'

export function BankProvider({ children, user }: { children: ReactNode; user: DemoUser }) {
  const bank = useBank(user)
  const totals = useEuroTotals(bank.accounts, bank.spendings)
  const value = useMemo(() => ({ ...bank, ...totals }), [bank, totals])

  return <BankContext.Provider value={value}>{children}</BankContext.Provider>
}
