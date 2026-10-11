import { useState, type FormEvent } from 'react'
import { Pencil, Plus, Star, Trash2 } from 'lucide-react'
import { useBankContext } from '../../hooks/useBankContext'
import { formatIban, isValidIban, normalizeIban } from '../../lib/iban'
import type { Recipient } from '../../types'
import { Modal } from '../Modal'

function RecipientModal({
  initial,
  onClose,
  onSave
}: {
  initial?: Recipient
  onClose: () => void
  onSave: (values: { name: string; bank: string; iban: string }) => void
}) {
  const [name, setName] = useState(initial?.name ?? '')
  const [bank, setBank] = useState(initial?.bank ?? '')
  const [iban, setIban] = useState(initial?.iban ?? '')
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!name.trim()) return setError('Enter the recipient name.')
    if (!bank.trim()) return setError('Enter the bank name.')
    if (!isValidIban(iban)) return setError('This IBAN is not valid. Check the number and try again.')
    onSave({ name: name.trim(), bank: bank.trim(), iban: formatIban(iban) })
    onClose()
  }

  const ibanState = iban.trim() === '' ? null : isValidIban(iban)

  return (
    <Modal
      closeLabel="Close recipient form"
      onClose={onClose}
      title={initial ? 'Edit recipient' : 'New recipient'}
    >
      <form className="stack" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="recipient-name">Name</label>
          <input
            autoComplete="off"
            className="input"
            id="recipient-name"
            maxLength={50}
            onChange={event => { setName(event.target.value); setError(null) }}
            value={name}
          />
        </div>
        <div className="field">
          <label htmlFor="recipient-bank">Bank</label>
          <input
            autoComplete="off"
            className="input"
            id="recipient-bank"
            maxLength={50}
            onChange={event => { setBank(event.target.value); setError(null) }}
            value={bank}
          />
        </div>
        <div className="field">
          <label htmlFor="recipient-iban">IBAN</label>
          <input
            aria-describedby="recipient-iban-hint"
            autoCapitalize="characters"
            autoComplete="off"
            className="input"
            id="recipient-iban"
            onChange={event => { setIban(event.target.value); setError(null) }}
            placeholder="FR76 3000 6000 0112 3456 7890 189"
            value={iban}
          />
          <p className="field-hint" id="recipient-iban-hint">
            {ibanState === null
              ? 'We check the format and checksum.'
              : ibanState
                ? `Valid IBAN · ${normalizeIban(iban).slice(0, 2)}`
                : 'This IBAN looks incomplete or invalid.'}
          </p>
        </div>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="button button-primary" type="submit">Save recipient</button>
      </form>
    </Modal>
  )
}

export function RecipientsCard() {
  const { recipients, addRecipient, updateRecipient, removeRecipient } = useBankContext()
  const [editing, setEditing] = useState<Recipient | 'new' | null>(null)

  const sorted = [...recipients].sort(
    (a, b) => Number(b.favourite ?? false) - Number(a.favourite ?? false) || a.name.localeCompare(b.name)
  )

  return (
    <section className="card">
      <div className="section-head">
        <h2 className="section-title">Saved recipients</h2>
        <button className="button button-small button-solid" onClick={() => setEditing('new')}>
          <Plus aria-hidden size={14} />
          Add
        </button>
      </div>

      {sorted.length === 0 ? (
        <p className="empty-note">Saved recipients make future transfers faster.</p>
      ) : (
        <ul className="rows">
          {sorted.map(recipient => (
            <li className="row" key={recipient.id}>
              <span aria-hidden className="logo">{recipient.name.slice(0, 2).toUpperCase()}</span>
              <div className="row-main">
                <h3>{recipient.name}</h3>
                <p>{recipient.bank} · {recipient.iban}</p>
              </div>
              <div className="row-actions">
                <button
                  aria-label={recipient.favourite ? `Remove ${recipient.name} from favourites` : `Add ${recipient.name} to favourites`}
                  aria-pressed={Boolean(recipient.favourite)}
                  className="icon-button icon-button-small"
                  onClick={() => updateRecipient(recipient.id, { favourite: !recipient.favourite })}
                >
                  <Star fill={recipient.favourite ? 'currentColor' : 'none'} size={15} />
                </button>
                <button
                  aria-label={`Edit ${recipient.name}`}
                  className="icon-button icon-button-small"
                  onClick={() => setEditing(recipient)}
                >
                  <Pencil size={15} />
                </button>
                <button
                  aria-label={`Delete ${recipient.name}`}
                  className="icon-button icon-button-small"
                  onClick={() => removeRecipient(recipient.id)}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {editing && (
        <RecipientModal
          initial={editing === 'new' ? undefined : editing}
          onClose={() => setEditing(null)}
          onSave={values =>
            editing === 'new'
              ? addRecipient(values)
              : updateRecipient(editing.id, values)
          }
        />
      )}
    </section>
  )
}
