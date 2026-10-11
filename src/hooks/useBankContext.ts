import { useContext } from 'react'
import { BankContext } from '../context/bankContext'

export function useBankContext() {
  const context = useContext(BankContext)
  if (!context) throw new Error('useBankContext must be used inside <BankProvider>.')
  return context
}
