import { lazy, Suspense, useCallback, useState } from 'react'
import { Landmark, LogOut } from 'lucide-react'
import { BankProvider } from './context/BankProvider'
import { demoUsers } from './data'
import { useBankContext } from './hooks/useBankContext'
import { usePersistentState } from './hooks/usePersistentState'
import type { DemoUser } from './types'
import { AccountsCard } from './components/AccountsCard'
import { BalanceHero } from './components/BalanceHero'
import { LoginPage } from './components/LoginPage'
import { NotificationsPopover } from './components/NotificationsPopover'
import { SpendingsCard } from './components/SpendingsCard'

const SpendingsModal = lazy(() =>
  import('./components/SpendingsModal').then(module => ({ default: module.SpendingsModal }))
)
const TransferModal = lazy(() =>
  import('./components/TransferModal').then(module => ({ default: module.TransferModal }))
)

const isDemoUserId = (value: unknown): value is string =>
  typeof value === 'string' && demoUsers.some(user => user.id === value)

function App() {
  const [activeUserId, setActiveUserId] = usePersistentState<string | null>(
    'toss:v1:active-user',
    null,
    (value): value is string | null => value === null || isDemoUserId(value)
  )
  const activeUser = demoUsers.find(user => user.id === activeUserId)

  if (!activeUser) {
    return <LoginPage onLogin={user => setActiveUserId(user.id)} />
  }

  return (
    <BankProvider key={activeUser.id} user={activeUser}>
      <Dashboard user={activeUser} onLogout={() => setActiveUserId(null)} />
    </BankProvider>
  )
}

function Dashboard({ user, onLogout }: { user: DemoUser; onLogout: () => void }) {
  const {
    accounts,
    notifications,
    hasUnreadNotifications,
    totalBalance,
    monthlySpendings,
    error,
    recipients,
    retry,
    sendMoney,
    markNotificationsRead
  } = useBankContext()
  const [isSpendingsOpen, setIsSpendingsOpen] = useState(false)
  const [transferAccountId, setTransferAccountId] = useState<number | null>(null)

  const transferAccount = accounts.find(account => account.id === transferAccountId)

  const openSpendings = useCallback(() => setIsSpendingsOpen(true), [])
  const closeSpendings = useCallback(() => setIsSpendingsOpen(false), [])
  const closeTransfer = useCallback(() => setTransferAccountId(null), [])

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

        <BalanceHero
          accountCount={accounts.length}
          error={error}
          onRetry={retry}
          totalBalance={totalBalance}
        />
        <div className="dashboard-grid">
          <AccountsCard accounts={accounts} onSend={setTransferAccountId} />
          <SpendingsCard error={error} monthlySpendings={monthlySpendings} onViewAll={openSpendings} />
        </div>
      </main>

      <Suspense fallback={null}>
        {isSpendingsOpen && (
          <SpendingsModal error={error} monthlySpendings={monthlySpendings} onClose={closeSpendings} />
        )}

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

export default App
