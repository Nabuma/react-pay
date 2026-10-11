import { useState, type FormEvent } from 'react'
import { ArrowDown, CheckCircle2 } from 'lucide-react'
import { formatMoney } from '../lib/currency'
import { AMOUNT_PATTERN, validateTransfer } from '../lib/transfer'
import type { Account, Recipient } from '../types'
import { Modal } from './Modal'
import './TransferModal.css'

type TransferModalProps = {
  account: Account
  recipients: readonly Recipient[]
  onClose: () => void
  onSubmit: (recipient: Recipient, amount: number) => void
}

type PendingTransfer = { recipient: Recipient; amount: number }
type Step = 'form' | 'review' | 'done'

function AccountSummary({ account }: { account: Account }) {
  return (
    <div className="transfer-party">
      <span className="logo">{account.logo}</span>
      <div className="row-main">
        <h3>{account.name}</h3>
        <p className="muted">{formatMoney(account.balance, account.currency)} available</p>
      </div>
    </div>
  )
}

export function TransferModal({ account, recipients, onClose, onSubmit }: TransferModalProps) {
  const [step, setStep] = useState<Step>('form')
  const [pending, setPending] = useState<PendingTransfer | null>(null)
  const [recipientId, setRecipientId] = useState<number | null>(null)
  const [amountInput, setAmountInput] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handleAmountChange(value: string) {
    if (!AMOUNT_PATTERN.test(value)) return
    setAmountInput(value)
    setError(null)
  }

  function handleReview(event: FormEvent) {
    event.preventDefault()

    const result = validateTransfer(
      recipients.find(recipient => recipient.id === recipientId),
      amountInput,
      account.balance
    )

    if (!result.ok) {
      setError(result.error)
      return
    }

    setPending({ recipient: result.recipient, amount: result.amount })
    setStep('review')
  }

  function handleConfirm() {
    if (!pending) return
    onSubmit(pending.recipient, pending.amount)
    setStep('done')
  }

  return (
    <Modal closeLabel="Close transfer" onClose={onClose} title="Send money">
      {step === 'form' && (
        <form className="transfer-form" onSubmit={handleReview}>
          <AccountSummary account={account} />

          <div className="transfer-arrow">
            <ArrowDown aria-hidden size={18} />
          </div>

          <fieldset className="transfer-recipients">
            <legend>Transfer to</legend>
            <ul className="rows">
              {[...recipients]
                .sort((a, b) => Number(b.favourite ?? false) - Number(a.favourite ?? false))
                .map(recipient => (
                <li className="row" key={recipient.id}>
                  <label className="recipient-option">
                    <input
                      checked={recipientId === recipient.id}
                      name="recipient"
                      onChange={() => {
                        setRecipientId(recipient.id)
                        setError(null)
                      }}
                      type="radio"
                      value={recipient.id}
                    />
                    <div className="row-main">
                      <h4>{recipient.name}</h4>
                      <p className="muted">{recipient.bank} · {recipient.iban}</p>
                    </div>
                  </label>
                </li>
              ))}
            </ul>
          </fieldset>

          <div className="transfer-amount-field">
            <label htmlFor="transfer-amount">Amount ({account.currency})</label>
            <input
              autoComplete="off"
              id="transfer-amount"
              inputMode="decimal"
              onChange={event => handleAmountChange(event.target.value)}
              placeholder="0.00"
              value={amountInput}
            />
          </div>

          {error && <p className="transfer-error" role="alert">{error}</p>}

          <button className="button button-primary" type="submit">
            Review transfer
          </button>
        </form>
      )}

      {step === 'review' && pending && (
        <div className="transfer-form">
          <AccountSummary account={account} />

          <div className="transfer-arrow">
            <ArrowDown aria-hidden size={18} />
          </div>

          <div className="transfer-party">
            <span className="logo">{pending.recipient.name.slice(0, 2).toUpperCase()}</span>
            <div className="row-main">
              <h3>{pending.recipient.name}</h3>
              <p className="muted">{pending.recipient.bank} · {pending.recipient.iban}</p>
            </div>
          </div>

          <p className="transfer-review-amount">{formatMoney(pending.amount, account.currency)}</p>
          <p className="muted transfer-review-note">
            Send {formatMoney(pending.amount, account.currency)} to {pending.recipient.name}?
          </p>

          <button autoFocus className="button button-primary" onClick={handleConfirm}>
            Confirm and send
          </button>
          <button className="button button-secondary" onClick={() => setStep('form')}>
            Back
          </button>
        </div>
      )}

      {step === 'done' && pending && (
        <div aria-live="polite" className="transfer-success">
          <CheckCircle2 aria-hidden size={48} />
          <h3>Transfer sent</h3>
          <p className="muted">
            {formatMoney(pending.amount, account.currency)} was sent to {pending.recipient.name}.
          </p>
          <button autoFocus className="button button-primary" onClick={onClose}>
            Done
          </button>
        </div>
      )}
    </Modal>
  )
}
