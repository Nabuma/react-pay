import { useCallback } from 'react'
import { formatMoney } from '../lib/currency'
import { toDateKey } from '../lib/dates'
import { roundMoney } from '../lib/transfer'
import type { Account, AppNotification, Recipient, Spending } from '../types'
import { usePersistentState } from './usePersistentState'

const isArray = <T,>(value: unknown): value is T[] => Array.isArray(value)
const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean'

const nextId = (items: readonly { id: number }[]) =>
  items.reduce((maxId, item) => Math.max(maxId, item.id), 0) + 1

// Keep existing single-user data with Maya; all additional profiles get isolated keys.
const storageKey = (userId: string, section: string) =>
  userId === 'maya-chen'
    ? `toss:v1:${section}`
    : `toss:v1:${userId}:${section}`

type BankSeed = {
  userId: string
  accounts: Account[]
  spendings: Spending[]
  notifications: AppNotification[]
}

export function useBank(seed: BankSeed) {
  const [accounts, setAccounts] = usePersistentState(
    storageKey(seed.userId, 'accounts'),
    seed.accounts,
    isArray<Account>
  )
  const [spendings, setSpendings] = usePersistentState(
    storageKey(seed.userId, 'spendings'),
    seed.spendings,
    isArray<Spending>
  )
  const [notifications, setNotifications] = usePersistentState(
    storageKey(seed.userId, 'notifications'),
    seed.notifications,
    isArray<AppNotification>
  )
  const [hasUnreadNotifications, setHasUnreadNotifications] = usePersistentState(
    storageKey(seed.userId, 'unread'),
    seed.notifications.length > 0,
    isBoolean
  )

  const sendMoney = useCallback((from: Account, recipient: Recipient, amount: number) => {
    setAccounts(current => current.map(account =>
      account.id === from.id
        ? { ...account, balance: roundMoney(account.balance - amount) }
        : account
    ))
    setSpendings(current => [
      {
        id: nextId(current),
        date: toDateKey(new Date()),
        description: `Transfer to ${recipient.name}`,
        amount,
        currency: from.currency
      },
      ...current
    ])
    setNotifications(current => [
      {
        id: nextId(current),
        message: `You sent ${formatMoney(amount, from.currency)} to ${recipient.name}.`
      },
      ...current
    ])
    setHasUnreadNotifications(true)
  }, [setAccounts, setSpendings, setNotifications, setHasUnreadNotifications])

  const markNotificationsRead = useCallback(
    () => setHasUnreadNotifications(false),
    [setHasUnreadNotifications]
  )

  return {
    accounts,
    spendings,
    notifications,
    hasUnreadNotifications,
    sendMoney,
    markNotificationsRead
  }
}
