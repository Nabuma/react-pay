import type { ReactNode } from 'react'
import { recipients } from '../data'
import { useBank } from '../hooks/useBank'
import { useEuroTotals } from '../hooks/useEuroTotals'
import type { DemoUser } from '../types'
import { BankContext } from './bankContext'

export function BankProvider({ children, user }: { children: ReactNode; user: DemoUser }) {
  const bank = useBank({
    userId: user.id,
    accounts: user.accounts,
    spendings: user.spendings,
    notifications: user.notifications
  })
  const totals = useEuroTotals(bank.accounts, bank.spendings)

  return (
    <BankContext.Provider value={{ ...bank, ...totals, recipients }}>
      {children}
    </BankContext.Provider>
  )
}
