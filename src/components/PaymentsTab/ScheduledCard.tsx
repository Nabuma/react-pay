import { useState, type CSSProperties, type FormEvent } from 'react'
import { CalendarClock, Pause, Play, Plus, Trash2 } from 'lucide-react'
import { useBankContext } from '../../hooks/useBankContext'
import { CATEGORIES, SPENDING_CATEGORY_IDS } from '../../lib/categories'
import { formatMoney } from '../../lib/currency'
import { formatDay, toDateKey } from '../../lib/dates'
import { FREQUENCY_LABELS, describeDue } from '../../lib/schedule'
import { AMOUNT_PATTERN } from '../../lib/transfer'
import type { CategoryId, Frequency } from '../../types'
import { Modal } from '../Modal'

function ScheduledModal({ onClose }: { onClose: () => void }) {
  const { accounts, addScheduled } = useBankContext()
  const [payee, setPayee] = useState('')
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? 0)
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState<CategoryId>('utilities')
  const [frequency, setFrequency] = useState<Frequency>('monthly')
  const today = toDateKey(new Date())
  const [nextDate, setNextDate] = useState(today)
  const [error, setError] = useState<string | null>(null)

  const account = accounts.find(item => item.id === accountId)

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const value = Number(amount)
    if (!payee.trim()) return setError('Enter who you are paying.')
    if (!Number.isFinite(value) || value <= 0) return setError('Enter an amount greater than zero.')
    if (!nextDate || nextDate < today) return setError('Choose a start date from today onwards.')

    addScheduled({ payee: payee.trim(), accountId, amount: value, category, frequency, nextDate })
    onClose()
  }

  return (
    <Modal closeLabel="Close scheduled payment form" onClose={onClose} title="New scheduled payment">
      <form className="stack" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="scheduled-payee">Payee</label>
          <input
            autoComplete="off"
            className="input"
            id="scheduled-payee"
            maxLength={40}
            onChange={event => { setPayee(event.target.value); setError(null) }}
            placeholder="Gym membership"
            value={payee}
          />
        </div>
        <div className="form-grid">
          <div className="field">
            <label htmlFor="scheduled-amount">Amount ({account?.currency})</label>
            <input
              autoComplete="off"
              className="input"
              id="scheduled-amount"
              inputMode="decimal"
              onChange={event => {
                if (AMOUNT_PATTERN.test(event.target.value)) { setAmount(event.target.value); setError(null) }
              }}
              placeholder="0.00"
              value={amount}
            />
          </div>
          <div className="field">
            <label htmlFor="scheduled-account">Pay from</label>
            <select
              className="input"
              id="scheduled-account"
              onChange={event => setAccountId(Number(event.target.value))}
              value={accountId}
            >
              {accounts.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="scheduled-category">Category</label>
            <select
              className="input"
              id="scheduled-category"
              onChange={event => setCategory(event.target.value as CategoryId)}
              value={category}
            >
              {SPENDING_CATEGORY_IDS.map(id => <option key={id} value={id}>{CATEGORIES[id].label}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="scheduled-frequency">Repeats</label>
            <select
              className="input"
              id="scheduled-frequency"
              onChange={event => setFrequency(event.target.value as Frequency)}
              value={frequency}
            >
              {(Object.keys(FREQUENCY_LABELS) as Frequency[]).map(id => (
                <option key={id} value={id}>{FREQUENCY_LABELS[id]}</option>
              ))}
            </select>
          </div>
          <div className="field span-2">
            <label htmlFor="scheduled-date">First payment</label>
            <input
              className="input"
              id="scheduled-date"
              min={today}
              onChange={event => { setNextDate(event.target.value); setError(null) }}
              type="date"
              value={nextDate}
            />
          </div>
        </div>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="button button-primary" type="submit">Schedule payment</button>
      </form>
    </Modal>
  )
}

export function ScheduledCard() {
  const { accounts, scheduled, runScheduled, toggleScheduled, removeScheduled } = useBankContext()
  const [isCreating, setIsCreating] = useState(false)
  const today = toDateKey(new Date())

  const sorted = [...scheduled].sort(
    (a, b) => Number(b.active) - Number(a.active) || a.nextDate.localeCompare(b.nextDate)
  )

  return (
    <section className="card">
      <div className="section-head">
        <h2 className="section-title">Scheduled payments</h2>
        <button className="button button-small button-solid" onClick={() => setIsCreating(true)}>
          <Plus aria-hidden size={14} />
          Add
        </button>
      </div>

      {sorted.length === 0 ? (
        <p className="empty-note">Automate rent, subscriptions and other recurring bills.</p>
      ) : (
        <ul className="rows">
          {sorted.map(payment => {
            const account = accounts.find(item => item.id === payment.accountId)
            const due = describeDue(payment.nextDate, today)
            const Icon = CATEGORIES[payment.category].icon
            const canAfford = account !== undefined && account.balance >= payment.amount

            return (
              <li className="row payment-row" key={payment.id}>
                <span aria-hidden className="category-chip" style={{ '--chip': CATEGORIES[payment.category].color } as CSSProperties}>
                  <Icon size={18} />
                </span>
                <div className="row-main">
                  <h3>{payment.payee}</h3>
                  <p>
                    {formatMoney(payment.amount, account?.currency)} · {FREQUENCY_LABELS[payment.frequency]}
                    {account ? ` · ${account.name}` : ''}
                  </p>
                  <p>
                    {payment.active
                      ? <><span className={`pill pill-${due.tone === 'later' ? 'muted' : due.tone}`}>{due.label}</span> {formatDay(payment.nextDate)}</>
                      : <span className="pill">Paused</span>}
                  </p>
                </div>
                <div className="row-actions">
                  <button
                    className="button button-small"
                    disabled={!payment.active || !canAfford}
                    onClick={() => runScheduled(payment)}
                    title={canAfford ? 'Pay now' : 'Insufficient funds'}
                  >
                    <CalendarClock aria-hidden size={14} />
                    Run now
                  </button>
                  <button
                    aria-label={payment.active ? `Pause ${payment.payee}` : `Resume ${payment.payee}`}
                    className="icon-button icon-button-small"
                    onClick={() => toggleScheduled(payment.id)}
                  >
                    {payment.active ? <Pause size={15} /> : <Play size={15} />}
                  </button>
                  <button
                    aria-label={`Delete ${payment.payee}`}
                    className="icon-button icon-button-small"
                    onClick={() => removeScheduled(payment.id)}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {isCreating && <ScheduledModal onClose={() => setIsCreating(false)} />}
    </section>
  )
}
