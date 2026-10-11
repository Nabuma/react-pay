import { useMemo, type CSSProperties, type ReactNode } from 'react'
import { Globe, Lock, Nfc, Snowflake, Wifi } from 'lucide-react'
import { useBankContext } from '../../hooks/useBankContext'
import { getCategoryId, isIncome } from '../../lib/categories'
import { formatMoney } from '../../lib/currency'
import { toDateKey } from '../../lib/dates'
import { budgetProgress } from '../../lib/insights'
import type { PaymentCard } from '../../types'
import './CardsTab.css'

function Toggle({
  checked,
  description,
  icon,
  label,
  onChange
}: {
  checked: boolean
  description: string
  icon: ReactNode
  label: string
  onChange: (checked: boolean) => void
}) {
  return (
    <li className="card-toggle">
      <span aria-hidden className="category-chip">{icon}</span>
      <div className="row-main">
        <h4>{label}</h4>
        <p>{description}</p>
      </div>
      <button
        aria-checked={checked}
        aria-label={label}
        className="switch"
        onClick={() => onChange(!checked)}
        role="switch"
        type="button"
      />
    </li>
  )
}

function CardPanel({ card, spent }: { card: PaymentCard; spent: number }) {
  const { accounts, updateCard } = useBankContext()
  const account = accounts.find(item => item.id === card.accountId)
  const progress = budgetProgress(spent, card.limit)
  const sliderId = `limit-${card.id}`

  return (
    <article className="card card-panel">
      <div
        className={`bank-card bank-card-${card.network.toLowerCase()}${card.frozen ? ' bank-card-frozen' : ''}`}
      >
        <div className="bank-card-top">
          <span>{account?.name ?? 'Toss'}</span>
          <Wifi aria-hidden className="bank-card-nfc" size={20} />
        </div>
        <span aria-hidden className="bank-card-chip" />
        <p className="bank-card-number">•••• •••• •••• {card.last4}</p>
        <div className="bank-card-bottom">
          <div>
            <p className="bank-card-label">Card holder</p>
            <p>{card.holder}</p>
          </div>
          <div>
            <p className="bank-card-label">Expires</p>
            <p>{card.expiry}</p>
          </div>
          <strong className="bank-card-network">{card.network}</strong>
        </div>
        {card.frozen && (
          <span className="bank-card-badge">
            <Snowflake aria-hidden size={14} />
            Frozen
          </span>
        )}
      </div>

      <ul className="card-toggles">
        <Toggle
          checked={card.frozen}
          description={card.frozen ? 'All payments are blocked' : 'Temporarily block every payment'}
          icon={<Lock size={17} />}
          label="Freeze card"
          onChange={frozen => updateCard(card.id, { frozen })}
        />
        <Toggle
          checked={card.online}
          description="Pay on websites and in apps"
          icon={<Globe size={17} />}
          label="Online payments"
          onChange={online => updateCard(card.id, { online })}
        />
        <Toggle
          checked={card.contactless}
          description="Tap to pay in shops"
          icon={<Nfc size={17} />}
          label="Contactless"
          onChange={contactless => updateCard(card.id, { contactless })}
        />
      </ul>

      <div className="card-limit">
        <div className="section-head">
          <label className="card-limit-label" htmlFor={sliderId}>Monthly limit</label>
          <strong>{formatMoney(card.limit)}</strong>
        </div>
        <input
          className="card-slider"
          id={sliderId}
          max={5000}
          min={100}
          onChange={event => updateCard(card.id, { limit: Number(event.target.value) })}
          step={50}
          type="range"
          value={card.limit}
        />
        <div
          aria-label="Monthly limit used"
          aria-valuemax={100}
          aria-valuemin={0}
          aria-valuenow={Math.min(Math.round(progress.ratio * 100), 100)}
          className={`progress progress-${progress.status}`}
          role="progressbar"
          style={{ '--ratio': progress.ratio } as CSSProperties}
        >
          <span className="progress-bar" />
        </div>
        <p className="field-hint">
          {formatMoney(spent)} spent this month ·{' '}
          {progress.status === 'over'
            ? `${formatMoney(-progress.remaining)} over the limit`
            : `${formatMoney(progress.remaining)} remaining`}
        </p>
      </div>
    </article>
  )
}

export function CardsTab() {
  const { cards, transactions } = useBankContext()
  const month = toDateKey(new Date()).slice(0, 7)

  // Card spend excludes transfers, which are bank payments rather than card payments.
  const spentByAccount = useMemo(() => {
    const totals = new Map<number, number>()
    for (const transaction of transactions ?? []) {
      if (!transaction.date.startsWith(month) || transaction.accountId === undefined) continue
      if (isIncome(transaction) || getCategoryId(transaction) === 'transfer') continue
      totals.set(transaction.accountId, (totals.get(transaction.accountId) ?? 0) + transaction.totalInEuros)
    }
    return totals
  }, [transactions, month])

  if (cards.length === 0) return <p className="card empty-note">No cards linked to your accounts yet.</p>

  return (
    <div className="split-grid">
      {cards.map(card => (
        <CardPanel card={card} key={card.id} spent={spentByAccount.get(card.accountId) ?? 0} />
      ))}
    </div>
  )
}
