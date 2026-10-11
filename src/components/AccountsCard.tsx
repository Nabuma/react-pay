import { memo } from 'react'
import { ArrowUpRight, History } from 'lucide-react'
import { formatMoney } from '../lib/currency'
import type { Account } from '../types'

type AccountRowProps = {
  account: Account
  onSend: (accountId: number) => void
  onHistory: (accountId: number) => void
}

const AccountRow = memo(function AccountRow({ account, onSend, onHistory }: AccountRowProps) {
  return (
    <li className="row">
      <span className="logo">{account.logo}</span>
      <div className="row-main">
        <h3>{account.name}</h3>
        <p>{formatMoney(account.balance, account.currency)}</p>
      </div>
      <button
        aria-label={`View ${account.name} history`}
        className="icon-button icon-button-small"
        onClick={() => onHistory(account.id)}
        title="History"
      >
        <History aria-hidden size={16} />
      </button>
      <button className="button" onClick={() => onSend(account.id)}>
        Send
        <ArrowUpRight size={16} />
      </button>
    </li>
  )
})

type AccountsCardProps = {
  accounts: readonly Account[]
  onSend: (accountId: number) => void
  onHistory: (accountId: number) => void
}

export const AccountsCard = memo(function AccountsCard({ accounts, onSend, onHistory }: AccountsCardProps) {
  return (
    <section className="card">
      <h2 className="section-title">Accounts</h2>
      <ul className="rows">
        {accounts.map(account => (
          <AccountRow account={account} key={account.id} onHistory={onHistory} onSend={onSend} />
        ))}
      </ul>
    </section>
  )
})
