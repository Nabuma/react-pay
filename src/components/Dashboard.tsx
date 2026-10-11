import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { Landmark, LogOut } from 'lucide-react'
import { useBankContext } from '../hooks/useBankContext'
import { EMPTY_FILTERS, type ActivityFilters } from '../lib/activity'
import { toDateKey } from '../lib/dates'
import { budgetProgress, monthSpendByCategory } from '../lib/insights'
import type { DemoUser } from '../types'
import { AccountsCard } from './AccountsCard'
import { BalanceHero } from './BalanceHero'
import { NotificationsPopover } from './NotificationsPopover'
import { SpendingsCard } from './SpendingsCard'
import { UpcomingPayments } from './UpcomingPayments'

const loadTransferModal = () => import('./TransferModal')
const loaders = {
  activity: () => import('./ActivityTab'),
  insights: () => import('./InsightsTab'),
  budgets: () => import('./BudgetsTab'),
  payments: () => import('./PaymentsTab'),
  cards: () => import('./CardsTab')
}

const TransferModal = lazy(() => loadTransferModal().then(module => ({ default: module.TransferModal })))
const ActivityTab = lazy(() => loaders.activity().then(module => ({ default: module.ActivityTab })))
const InsightsTab = lazy(() => loaders.insights().then(module => ({ default: module.InsightsTab })))
const BudgetsTab = lazy(() => loaders.budgets().then(module => ({ default: module.BudgetsTab })))
const PaymentsTab = lazy(() => loaders.payments().then(module => ({ default: module.PaymentsTab })))
const CardsTab = lazy(() => loaders.cards().then(module => ({ default: module.CardsTab })))

// Warm the chunks once the browser is idle so the first tab switch has no loading flash.
function prefetchTabs() {
  Object.values(loaders).forEach(load => void load())
  void loadTransferModal()
}

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'activity', label: 'Activity' },
  { id: 'insights', label: 'Insights' },
  { id: 'budgets', label: 'Budgets' },
  { id: 'payments', label: 'Payments' },
  { id: 'cards', label: 'Cards' }
] as const

type TabId = (typeof TABS)[number]['id']

export function Dashboard({ user, onLogout }: { user: DemoUser; onLogout: () => void }) {
  const {
    accounts,
    notifications,
    hasUnreadNotifications,
    totalBalance,
    monthlySpendings,
    transactions,
    budgets,
    error,
    recipients,
    retry,
    sendMoney,
    markNotificationsRead
  } = useBankContext()
  const [tab, setTab] = useState<TabId>('overview')
  const [filters, setFilters] = useState<ActivityFilters>(EMPTY_FILTERS)
  const [transferAccountId, setTransferAccountId] = useState<number | null>(null)
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({})

  useEffect(() => {
    if (typeof window.requestIdleCallback === 'function') {
      const handle = window.requestIdleCallback(prefetchTabs, { timeout: 3000 })
      return () => window.cancelIdleCallback(handle)
    }
    const timer = window.setTimeout(prefetchTabs, 1500)
    return () => window.clearTimeout(timer)
  }, [])

  const transferAccount = accounts.find(account => account.id === transferAccountId)

  const hasBudgetAlert = useMemo(() => {
    if (!transactions) return false
    const spent = monthSpendByCategory(transactions, toDateKey(new Date()).slice(0, 7))
    return budgets.some(budget => budgetProgress(spent.get(budget.category) ?? 0, budget.limit).status === 'over')
  }, [transactions, budgets])

  const showAllActivity = useCallback(() => {
    setFilters(EMPTY_FILTERS)
    setTab('activity')
  }, [])
  const closeTransfer = useCallback(() => setTransferAccountId(null), [])
  const showHistory = useCallback((accountId: number) => {
    setFilters({ ...EMPTY_FILTERS, accountId })
    setTab('activity')
  }, [])
  const showPayments = useCallback(() => setTab('payments'), [])

  function handleTabKeys(event: KeyboardEvent) {
    const index = TABS.findIndex(item => item.id === tab)
    const next =
      event.key === 'ArrowRight' ? (index + 1) % TABS.length
      : event.key === 'ArrowLeft' ? (index - 1 + TABS.length) % TABS.length
      : event.key === 'Home' ? 0
      : event.key === 'End' ? TABS.length - 1
      : -1
    if (next < 0) return

    event.preventDefault()
    setTab(TABS[next].id)
    tabRefs.current[TABS[next].id]?.focus()
  }

  return (
    <div className="App">
      <main className="page">
        <header className="topbar">
          <h1 className="brand">
            <Landmark aria-hidden />Toss
          </h1>
          <div className="header-actions">
            <NotificationsPopover
              hasUnread={hasUnreadNotifications}
              notifications={notifications}
              onOpen={markNotificationsRead}
            />
            <span aria-hidden className="profile-avatar">
              {user.name.split(' ').map(part => part[0]).join('')}
            </span>
            <span className="profile-name">{user.name}</span>
            <button className="icon-button signout-button" onClick={onLogout} title="Sign out">
              <LogOut aria-hidden size={18} />
              <span className="sr-only">Sign out</span>
            </button>
          </div>
        </header>

        <div aria-label="Sections" className="tabs" onKeyDown={handleTabKeys} role="tablist">
          {TABS.map(item => (
            <button
              aria-controls={`panel-${item.id}`}
              aria-selected={tab === item.id}
              className="tab"
              id={`tab-${item.id}`}
              key={item.id}
              onClick={() => setTab(item.id)}
              ref={element => { tabRefs.current[item.id] = element }}
              role="tab"
              tabIndex={tab === item.id ? 0 : -1}
            >
              {item.label}
              {item.id === 'budgets' && hasBudgetAlert && (
                <>
                  <span aria-hidden className="tab-dot" />
                  <span className="sr-only">(over budget)</span>
                </>
              )}
            </button>
          ))}
        </div>

        <div aria-labelledby={`tab-${tab}`} id={`panel-${tab}`} role="tabpanel">
          {tab === 'overview' && (
            <div className="tab-panel">
              <BalanceHero
                accountCount={accounts.length}
                error={error}
                onRetry={retry}
                totalBalance={totalBalance}
              />
              <div className="dashboard-grid">
                <div className="stack">
                  <AccountsCard accounts={accounts} onHistory={showHistory} onSend={setTransferAccountId} />
                  <UpcomingPayments onManage={showPayments} />
                </div>
                <SpendingsCard error={error} monthlySpendings={monthlySpendings} onViewAll={showAllActivity} />
              </div>
            </div>
          )}

          <Suspense fallback={<div aria-busy className="card"><span className="skeleton" style={{ height: '8rem' }} /></div>}>
            {tab === 'activity' && (
              <ActivityTab
                accounts={accounts}
                error={error}
                filters={filters}
                onFiltersChange={setFilters}
                transactions={transactions}
              />
            )}
            {tab === 'insights' && <InsightsTab error={error} monthlySpendings={monthlySpendings} />}
            {tab === 'budgets' && <BudgetsTab />}
            {tab === 'payments' && <PaymentsTab />}
            {tab === 'cards' && <CardsTab />}
          </Suspense>
        </div>
      </main>

      <Suspense fallback={null}>
        {transferAccount && (
          <TransferModal
            account={transferAccount}
            onClose={closeTransfer}
            onSubmit={(recipient, amount) => sendMoney(transferAccount, recipient, amount)}
            recipients={recipients}
          />
        )}
      </Suspense>
    </div>
  )
}
