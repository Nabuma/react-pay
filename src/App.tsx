import { BankProvider } from './context/BankProvider'
import { demoUsers } from './data'
import { usePersistentState } from './hooks/usePersistentState'
import { Dashboard } from './components/Dashboard'
import { LoginPage } from './components/LoginPage'

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

export default App
