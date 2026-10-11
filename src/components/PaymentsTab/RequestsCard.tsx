import { useState, type FormEvent } from 'react'
import { HandCoins, Plus, Split } from 'lucide-react'
import { useBankContext } from '../../hooks/useBankContext'
import { formatMoney } from '../../lib/currency'
import { formatDay } from '../../lib/dates'
import { splitEvenly } from '../../lib/split'
import { AMOUNT_PATTERN } from '../../lib/transfer'
import type { MoneyRequest } from '../../types'
import { Modal } from '../Modal'

const MAX_PEOPLE = 8

function RequestModal({ onClose }: { onClose: () => void }) {
  const { accounts, recipients, createRequests } = useBankContext()
  const [mode, setMode] = useState<'request' | 'split'>('request')
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? 0)
  const [people, setPeople] = useState('')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState<string | null>(null)

  const account = accounts.find(item => item.id === accountId)
  const names = [...new Set(people.split(',').map(name => name.trim()).filter(Boolean))]
  const total = Number(amount)
  const hasAmount = Number.isFinite(total) && total > 0
  const shares = mode === 'split' && hasAmount && names.length > 0 ? splitEvenly(total, names.length + 1) : null

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!account) return
    if (names.length === 0) {
      return setError(mode === 'request' ? 'Enter who should pay you.' : 'Add at least one person to split with.')
    }
    if (mode === 'request' && names.length > 1) return setError('Requests go to one person. Use Split for groups.')
    if (names.length > MAX_PEOPLE) return setError(`You can split with up to ${MAX_PEOPLE} people.`)
    if (!hasAmount) return setError('Enter an amount greater than zero.')

    const base = { direction: 'outgoing' as const, currency: account.currency, accountId: account.id }
    const trimmedNote = note.trim()

    createRequests(
      shares
        ? names.map((person, index) => ({
            ...base,
            person,
            amount: shares[index + 1],
            note: trimmedNote ? `${trimmedNote} (split)` : 'Split bill'
          }))
        : [{ ...base, person: names[0], amount: total, note: trimmedNote || 'Payment request' }]
    )
    onClose()
  }

  return (
    <Modal closeLabel="Close request form" onClose={onClose} title="Request or split">
      <form className="stack" onSubmit={handleSubmit}>
        <div aria-label="Type" className="segmented" role="group">
          <button aria-pressed={mode === 'request'} onClick={() => setMode('request')} type="button">
            Request money
          </button>
          <button aria-pressed={mode === 'split'} onClick={() => setMode('split')} type="button">
            Split a bill
          </button>
        </div>

        <div className="field">
          <label htmlFor="request-people">{mode === 'request' ? 'From' : 'Split with (comma separated)'}</label>
          <input
            autoComplete="off"
            className="input"
            id="request-people"
            list="request-suggestions"
            onChange={event => { setPeople(event.target.value); setError(null) }}
            placeholder={mode === 'request' ? 'Marie Dubois' : 'Marie, Thomas'}
            value={people}
          />
          <datalist id="request-suggestions">
            {recipients.map(recipient => <option key={recipient.id} value={recipient.name} />)}
          </datalist>
        </div>

        <div className="form-grid">
          <div className="field">
            <label htmlFor="request-amount">
              {mode === 'request' ? 'Amount' : 'Bill total'} ({account?.currency})
            </label>
            <input
              autoComplete="off"
              className="input"
              id="request-amount"
              inputMode="decimal"
              onChange={event => {
                if (AMOUNT_PATTERN.test(event.target.value)) { setAmount(event.target.value); setError(null) }
              }}
              placeholder="0.00"
              value={amount}
            />
          </div>
          <div className="field">
            <label htmlFor="request-account">Receive in</label>
            <select
              className="input"
              id="request-account"
              onChange={event => setAccountId(Number(event.target.value))}
              value={accountId}
            >
              {accounts.map(item => <option key={item.id} value={item.id}>{item.name} ({item.currency})</option>)}
            </select>
          </div>
          <div className="field span-2">
            <label htmlFor="request-note">Note</label>
            <input
              className="input"
              id="request-note"
              maxLength={60}
              onChange={event => setNote(event.target.value)}
              placeholder="Dinner on Friday"
              value={note}
            />
          </div>
        </div>

        {shares && account && (
          <p aria-live="polite" className="split-preview">
            Your share is <strong>{formatMoney(shares[0], account.currency)}</strong>; each of the other{' '}
            {names.length} {names.length === 1 ? 'person owes' : 'people owe'} about{' '}
            <strong>{formatMoney(shares[1], account.currency)}</strong>.
          </p>
        )}
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="button button-primary" type="submit">
          {mode === 'request' ? 'Send request' : 'Send split requests'}
        </button>
      </form>
    </Modal>
  )
}

function PayRequestModal({ request, onClose }: { request: MoneyRequest; onClose: () => void }) {
  const { accounts, payRequest } = useBankContext()
  const eligible = accounts.filter(account => account.currency === request.currency)
  const [accountId, setAccountId] = useState(eligible[0]?.id ?? 0)
  const account = eligible.find(item => item.id === accountId)
  const insufficient = account !== undefined && account.balance < request.amount

  return (
    <Modal closeLabel="Close payment form" onClose={onClose} title={`Pay ${request.person}`}>
      <div className="stack">
        <p className="request-amount">{formatMoney(request.amount, request.currency)}</p>
        <p className="muted">{request.note}</p>
        {eligible.length === 0 ? (
          <p className="form-error" role="alert">
            You need a {request.currency} account to pay this request.
          </p>
        ) : (
          <div className="field">
            <label htmlFor="pay-account">Pay from</label>
            <select
              className="input"
              id="pay-account"
              onChange={event => setAccountId(Number(event.target.value))}
              value={accountId}
            >
              {eligible.map(item => (
                <option key={item.id} value={item.id}>
                  {item.name} · {formatMoney(item.balance, item.currency)}
                </option>
              ))}
            </select>
          </div>
        )}
        {insufficient && <p className="form-error" role="alert">This account has insufficient funds.</p>}
        <button
          className="button button-primary"
          disabled={!account || insufficient}
          onClick={() => {
            if (!account) return
            payRequest(request, account)
            onClose()
          }}
        >
          Pay {formatMoney(request.amount, request.currency)}
        </button>
      </div>
    </Modal>
  )
}

const STATUS_LABELS: Record<MoneyRequest['status'], string> = {
  pending: 'Pending',
  paid: 'Paid',
  declined: 'Declined',
  cancelled: 'Cancelled'
}

export function RequestsCard() {
  const { requests, declineRequest, cancelRequest, settleRequest } = useBankContext()
  const [isCreating, setIsCreating] = useState(false)
  const [paying, setPaying] = useState<MoneyRequest | null>(null)

  const sorted = [...requests].sort(
    (a, b) =>
      Number(b.status === 'pending') - Number(a.status === 'pending') ||
      b.date.localeCompare(a.date) ||
      b.id - a.id
  )

  return (
    <section className="card">
      <div className="section-head">
        <h2 className="section-title">Requests &amp; splits</h2>
        <button className="button button-small button-solid" onClick={() => setIsCreating(true)}>
          <Plus aria-hidden size={14} />
          New
        </button>
      </div>

      {sorted.length === 0 ? (
        <p className="empty-note">Ask a friend for money or split a bill in a few taps.</p>
      ) : (
        <ul className="rows">
          {sorted.map(request => {
            const incoming = request.direction === 'incoming'
            const pending = request.status === 'pending'

            return (
              <li className="row payment-row" key={request.id}>
                <span aria-hidden className="category-chip">
                  {incoming ? <HandCoins size={18} /> : <Split size={18} />}
                </span>
                <div className="row-main">
                  <h3>
                    {incoming ? `${request.person} requests` : `You requested from ${request.person}`}
                  </h3>
                  <p>{request.note} · {formatDay(request.date)}</p>
                  <p>
                    <strong>{formatMoney(request.amount, request.currency)}</strong>{' '}
                    <span className={`pill${pending ? '' : request.status === 'paid' ? ' pill-ok' : ' pill-late'}`}>
                      {STATUS_LABELS[request.status]}
                    </span>
                  </p>
                </div>
                {pending && (
                  <div className="row-actions">
                    {incoming ? (
                      <>
                        <button className="button button-small button-solid" onClick={() => setPaying(request)}>
                          Pay
                        </button>
                        <button className="button button-small" onClick={() => declineRequest(request.id)}>
                          Decline
                        </button>
                      </>
                    ) : (
                      <>
                        <button className="button button-small button-solid" onClick={() => settleRequest(request)}>
                          Mark received
                        </button>
                        <button className="button button-small" onClick={() => cancelRequest(request.id)}>
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}

      {isCreating && <RequestModal onClose={() => setIsCreating(false)} />}
      {paying && <PayRequestModal onClose={() => setPaying(null)} request={paying} />}
    </section>
  )
}
