import { memo } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { formatMoney } from '../lib/currency'
import type { Account } from '../types'

type AccountRowProps = {
  account: Account
  onSend: (accountId: number) => void
}

const AccountRow = memo(function AccountRow({ account, onSend }: AccountRowProps) {
  return (
    <li className="row">
      <span className="logo">{account.logo}</span>
      <div className="row-main">
        <h3>{account.name}</h3>
        <p>{formatMoney(account.balance, account.currency)}</p>
      </div>
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
}

export const AccountsCard = memo(function AccountsCard({ accounts, onSend }: AccountsCardProps) {
  return (
    <section className="card">
      <h2 className="section-title">Accounts</h2>
      <ul className="rows">
        {accounts.map(account => (
          <AccountRow account={account} key={account.id} onSend={onSend} />
        ))}
      </ul>
    </section>
  )
})
