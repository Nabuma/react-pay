import { useCallback, useMemo } from 'react'
import { categorize } from '../lib/categories'
import { formatMoney } from '../lib/currency'
import { toDateKey } from '../lib/dates'
import { nextRunAfter } from '../lib/schedule'
import { roundMoney } from '../lib/transfer'
import type {
  Account,
  AppNotification,
  Budget,
  CategoryId,
  DemoUser,
  MoneyRequest,
  PaymentCard,
  Recipient,
  SavingsGoal,
  ScheduledPayment,
  Spending
} from '../types'
import { usePersistentState } from './usePersistentState'

const isArray = <T,>(value: unknown): value is T[] => Array.isArray(value)
const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean'

const nextId = (items: readonly { id: number }[]) =>
  items.reduce((maxId, item) => Math.max(maxId, item.id), 0) + 1

const storageKey = (userId: string, section: string) => `toss:v3:${userId}:${section}`

export type NewRecipient = Omit<Recipient, 'id'>
export type NewScheduledPayment = Omit<ScheduledPayment, 'id' | 'active'>
export type NewMoneyRequest = Omit<MoneyRequest, 'id' | 'date' | 'status'>

export function useBank(seed: DemoUser) {
  const key = (section: string) => storageKey(seed.id, section)

  const [accounts, setAccounts] = usePersistentState(key('accounts'), seed.accounts, isArray<Account>)
  const [spendings, setSpendings] = usePersistentState(key('spendings'), seed.spendings, isArray<Spending>)
  const [notifications, setNotifications] = usePersistentState(
    key('notifications'),
    seed.notifications,
    isArray<AppNotification>
  )
  const [hasUnreadNotifications, setHasUnreadNotifications] = usePersistentState(
    key('unread'),
    seed.notifications.length > 0,
    isBoolean
  )
  const [recipients, setRecipients] = usePersistentState(key('recipients'), seed.recipients, isArray<Recipient>)
  const [budgets, setBudgets] = usePersistentState(key('budgets'), seed.budgets, isArray<Budget>)
  const [goals, setGoals] = usePersistentState(key('goals'), seed.goals, isArray<SavingsGoal>)
  const [scheduled, setScheduled] = usePersistentState(key('scheduled'), seed.scheduled, isArray<ScheduledPayment>)
  const [requests, setRequests] = usePersistentState(key('requests'), seed.requests, isArray<MoneyRequest>)
  const [cards, setCards] = usePersistentState(key('cards'), seed.cards, isArray<PaymentCard>)

  const notify = useCallback((message: string) => {
    setNotifications(current => [{ id: nextId(current), message }, ...current])
    setHasUnreadNotifications(true)
  }, [setNotifications, setHasUnreadNotifications])

  const adjustBalance = useCallback((accountId: number, delta: number) => {
    setAccounts(current => current.map(account =>
      account.id === accountId
        ? { ...account, balance: roundMoney(account.balance + delta) }
        : account
    ))
  }, [setAccounts])

  const recordSpending = useCallback((
    account: Account,
    details: { description: string; amount: number; category?: CategoryId }
  ) => {
    adjustBalance(account.id, -details.amount)
    setSpendings(current => [
      {
        id: nextId(current),
        date: toDateKey(new Date()),
        description: details.description,
        amount: details.amount,
        currency: account.currency,
        accountId: account.id,
        category: details.category ?? categorize(details.description)
      },
      ...current
    ])
  }, [adjustBalance, setSpendings])

  // Credits an account and records the money received in the activity history.
  const recordIncome = useCallback((
    accountId: number,
    details: { description: string; amount: number; currency: string; category: CategoryId }
  ) => {
    adjustBalance(accountId, details.amount)
    setSpendings(current => [
      {
        id: nextId(current),
        date: toDateKey(new Date()),
        description: details.description,
        amount: details.amount,
        currency: details.currency,
        accountId,
        category: details.category,
        kind: 'income' as const
      },
      ...current
    ])
  }, [adjustBalance, setSpendings])

  const sendMoney = useCallback((from: Account, recipient: Recipient, amount: number) => {
    recordSpending(from, {
      description: `Transfer to ${recipient.name}`,
      amount,
      category: 'transfer'
    })
    notify(`You sent ${formatMoney(amount, from.currency)} to ${recipient.name}.`)
  }, [recordSpending, notify])

  const markNotificationsRead = useCallback(
    () => setHasUnreadNotifications(false),
    [setHasUnreadNotifications]
  )

  const addRecipient = useCallback((recipient: NewRecipient) => {
    setRecipients(current => [...current, { ...recipient, id: nextId(current) }])
  }, [setRecipients])

  const updateRecipient = useCallback((id: number, changes: Partial<NewRecipient>) => {
    setRecipients(current => current.map(item => item.id === id ? { ...item, ...changes } : item))
  }, [setRecipients])

  const removeRecipient = useCallback((id: number) => {
    setRecipients(current => current.filter(item => item.id !== id))
  }, [setRecipients])

  const setBudget = useCallback((category: CategoryId, limit: number) => {
    setBudgets(current => [...current.filter(budget => budget.category !== category), { category, limit }])
  }, [setBudgets])

  const removeBudget = useCallback((category: CategoryId) => {
    setBudgets(current => current.filter(budget => budget.category !== category))
  }, [setBudgets])

  const addGoal = useCallback((name: string, target: number) => {
    setGoals(current => [...current, { id: nextId(current), name, target, saved: 0 }])
  }, [setGoals])

  const removeGoal = useCallback((id: number) => {
    setGoals(current => current.filter(goal => goal.id !== id))
  }, [setGoals])

  // Positive values add to the goal, negative values withdraw; saved never goes below zero.
  const adjustGoal = useCallback((id: number, delta: number) => {
    setGoals(current => current.map(goal =>
      goal.id === id ? { ...goal, saved: Math.max(0, roundMoney(goal.saved + delta)) } : goal
    ))
  }, [setGoals])

  const addScheduled = useCallback((payment: NewScheduledPayment) => {
    setScheduled(current => [...current, { ...payment, id: nextId(current), active: true }])
  }, [setScheduled])

  const removeScheduled = useCallback((id: number) => {
    setScheduled(current => current.filter(payment => payment.id !== id))
  }, [setScheduled])

  const toggleScheduled = useCallback((id: number) => {
    setScheduled(current => current.map(payment =>
      payment.id === id ? { ...payment, active: !payment.active } : payment
    ))
  }, [setScheduled])

  const runScheduled = useCallback((payment: ScheduledPayment) => {
    const account = accounts.find(item => item.id === payment.accountId)
    if (!account) return

    recordSpending(account, {
      description: payment.payee,
      amount: payment.amount,
      category: payment.category
    })
    setScheduled(current => current.map(item =>
      item.id === payment.id
        ? { ...item, nextDate: nextRunAfter(item.nextDate, item.frequency, toDateKey(new Date())) }
        : item
    ))
    notify(`${payment.payee} paid: ${formatMoney(payment.amount, account.currency)}.`)
  }, [accounts, recordSpending, setScheduled, notify])

  const createRequests = useCallback((items: readonly NewMoneyRequest[]) => {
    const date = toDateKey(new Date())
    setRequests(current => {
      let id = nextId(current)
      return [
        ...items.map(item => ({ ...item, id: id++, date, status: 'pending' as const })),
        ...current
      ]
    })
    const total = items.reduce((sum, item) => sum + item.amount, 0)
    if (items.length > 0) {
      notify(
        items.length === 1
          ? `Request of ${formatMoney(total, items[0].currency)} sent to ${items[0].person}.`
          : `${items.length} requests sent, ${formatMoney(total, items[0].currency)} in total.`
      )
    }
  }, [setRequests, notify])

  const setRequestStatus = useCallback((id: number, status: MoneyRequest['status']) => {
    setRequests(current => current.map(item => item.id === id ? { ...item, status } : item))
  }, [setRequests])

  const payRequest = useCallback((request: MoneyRequest, account: Account) => {
    recordSpending(account, {
      description: `Payment to ${request.person}`,
      amount: request.amount,
      category: 'transfer'
    })
    setRequestStatus(request.id, 'paid')
    notify(`You paid ${request.person} ${formatMoney(request.amount, account.currency)}.`)
  }, [recordSpending, setRequestStatus, notify])

  const declineRequest = useCallback((id: number) => setRequestStatus(id, 'declined'), [setRequestStatus])
  const cancelRequest = useCallback((id: number) => setRequestStatus(id, 'cancelled'), [setRequestStatus])

  // Marks an outgoing request as received and credits the account it was addressed to.
  const settleRequest = useCallback((request: MoneyRequest) => {
    if (request.accountId !== undefined) {
      recordIncome(request.accountId, {
        description: `Payment from ${request.person}`,
        amount: request.amount,
        currency: request.currency,
        category: 'income'
      })
    }
    setRequestStatus(request.id, 'paid')
    notify(`${request.person} paid you ${formatMoney(request.amount, request.currency)}.`)
  }, [recordIncome, setRequestStatus, notify])

  const updateCard = useCallback((id: number, changes: Partial<PaymentCard>) => {
    setCards(current => current.map(card => card.id === id ? { ...card, ...changes } : card))
  }, [setCards])

  return useMemo(() => ({
    accounts,
    spendings,
    notifications,
    hasUnreadNotifications,
    recipients,
    budgets,
    goals,
    scheduled,
    requests,
    cards,
    sendMoney,
    markNotificationsRead,
    addRecipient,
    updateRecipient,
    removeRecipient,
    setBudget,
    removeBudget,
    addGoal,
    removeGoal,
    adjustGoal,
    addScheduled,
    removeScheduled,
    toggleScheduled,
    runScheduled,
    createRequests,
    payRequest,
    declineRequest,
    cancelRequest,
    settleRequest,
    updateCard
  }), [
    accounts, spendings, notifications, hasUnreadNotifications, recipients, budgets, goals, scheduled,
    requests, cards, sendMoney, markNotificationsRead, addRecipient, updateRecipient, removeRecipient,
    setBudget, removeBudget, addGoal, removeGoal, adjustGoal, addScheduled, removeScheduled,
    toggleScheduled, runScheduled, createRequests, payRequest, declineRequest, cancelRequest,
    settleRequest, updateCard
  ])
}
