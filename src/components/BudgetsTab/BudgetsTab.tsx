import { useState, type CSSProperties, type FormEvent } from 'react'
import { Minus, PiggyBank, Plus, Target, Trash2 } from 'lucide-react'
import { useBankContext } from '../../hooks/useBankContext'
import { CATEGORIES, SPENDING_CATEGORY_IDS } from '../../lib/categories'
import { formatMoney } from '../../lib/currency'
import { toDateKey } from '../../lib/dates'
import { budgetProgress, monthSpendByCategory } from '../../lib/insights'
import { AMOUNT_PATTERN } from '../../lib/transfer'
import type { CategoryId, SavingsGoal } from '../../types'
import { Modal } from '../Modal'
import './BudgetsTab.css'

const parseAmount = (value: string) => {
  const amount = Number(value)
  return Number.isFinite(amount) && amount > 0 ? amount : null
}

function AmountField({
  id,
  label,
  value,
  onChange
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input
        autoComplete="off"
        className="input"
        id={id}
        inputMode="decimal"
        onChange={event => AMOUNT_PATTERN.test(event.target.value) && onChange(event.target.value)}
        placeholder="0.00"
        value={value}
      />
    </div>
  )
}

function BudgetModal({
  available,
  initial,
  onClose,
  onSave
}: {
  available: readonly CategoryId[]
  initial?: { category: CategoryId; limit: number }
  onClose: () => void
  onSave: (category: CategoryId, limit: number) => void
}) {
  const [category, setCategory] = useState<CategoryId>(initial?.category ?? available[0])
  const [limit, setLimit] = useState(initial ? String(initial.limit) : '')
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const amount = parseAmount(limit)
    if (amount === null) return setError('Enter a monthly limit greater than zero.')
    onSave(category, amount)
    onClose()
  }

  return (
    <Modal closeLabel="Close budget form" onClose={onClose} title={initial ? 'Edit budget' : 'New budget'}>
      <form className="stack" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="budget-category">Category</label>
          <select
            className="input"
            disabled={Boolean(initial)}
            id="budget-category"
            onChange={event => setCategory(event.target.value as CategoryId)}
            value={category}
          >
            {(initial ? [initial.category] : available).map(id => (
              <option key={id} value={id}>{CATEGORIES[id].label}</option>
            ))}
          </select>
        </div>
        <AmountField
          id="budget-limit"
          label="Monthly limit (€)"
          onChange={value => { setLimit(value); setError(null) }}
          value={limit}
        />
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="button button-primary" type="submit">Save budget</button>
      </form>
    </Modal>
  )
}

function GoalModal({ onClose, onSave }: { onClose: () => void; onSave: (name: string, target: number) => void }) {
  const [name, setName] = useState('')
  const [target, setTarget] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const amount = parseAmount(target)
    if (!name.trim()) return setError('Give your goal a name.')
    if (amount === null) return setError('Enter a target greater than zero.')
    onSave(name.trim(), amount)
    onClose()
  }

  return (
    <Modal closeLabel="Close goal form" onClose={onClose} title="New savings goal">
      <form className="stack" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="goal-name">Goal name</label>
          <input
            autoComplete="off"
            className="input"
            id="goal-name"
            maxLength={40}
            onChange={event => { setName(event.target.value); setError(null) }}
            placeholder="Summer holiday"
            value={name}
          />
        </div>
        <AmountField
          id="goal-target"
          label="Target (€)"
          onChange={value => { setTarget(value); setError(null) }}
          value={target}
        />
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="button button-primary" type="submit">Create goal</button>
      </form>
    </Modal>
  )
}

function GoalAmountModal({
  goal,
  mode,
  onClose,
  onSubmit
}: {
  goal: SavingsGoal
  mode: 'add' | 'withdraw'
  onClose: () => void
  onSubmit: (delta: number) => void
}) {
  const [amount, setAmount] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const value = parseAmount(amount)
    if (value === null) return setError('Enter an amount greater than zero.')
    if (mode === 'withdraw' && value > goal.saved) {
      return setError(`You only have ${formatMoney(goal.saved)} saved in this goal.`)
    }
    onSubmit(mode === 'add' ? value : -value)
    onClose()
  }

  return (
    <Modal
      closeLabel="Close goal form"
      onClose={onClose}
      title={mode === 'add' ? `Add to ${goal.name}` : `Withdraw from ${goal.name}`}
    >
      <form className="stack" onSubmit={handleSubmit}>
        <p className="muted">
          {formatMoney(goal.saved)} saved of {formatMoney(goal.target)}
        </p>
        <AmountField
          id="goal-amount"
          label="Amount (€)"
          onChange={value => { setAmount(value); setError(null) }}
          value={amount}
        />
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="button button-primary" type="submit">
          {mode === 'add' ? 'Add funds' : 'Withdraw funds'}
        </button>
      </form>
    </Modal>
  )
}

type Dialog =
  | { type: 'budget'; category?: CategoryId }
  | { type: 'goal' }
  | { type: 'goal-amount'; goalId: number; mode: 'add' | 'withdraw' }
  | null

export function BudgetsTab() {
  const { budgets, goals, transactions, setBudget, removeBudget, addGoal, removeGoal, adjustGoal } =
    useBankContext()
  const [dialog, setDialog] = useState<Dialog>(null)
  const close = () => setDialog(null)

  const month = toDateKey(new Date()).slice(0, 7)
  const spent = transactions ? monthSpendByCategory(transactions, month) : null
  const unbudgeted = SPENDING_CATEGORY_IDS.filter(id => !budgets.some(budget => budget.category === id))
  const editing = dialog?.type === 'budget' && dialog.category
    ? budgets.find(budget => budget.category === dialog.category)
    : undefined
  const goal = dialog?.type === 'goal-amount' ? goals.find(item => item.id === dialog.goalId) : undefined

  return (
    <div className="split-grid">
      <section className="card">
        <div className="section-head">
          <h2 className="section-title">Monthly budgets</h2>
          <button
            className="button button-small button-solid"
            disabled={unbudgeted.length === 0}
            onClick={() => setDialog({ type: 'budget' })}
          >
            <Plus aria-hidden size={14} />
            Add
          </button>
        </div>

        {budgets.length === 0 ? (
          <p className="empty-note">Set a limit for a category to track it every month.</p>
        ) : (
          <ul className="rows">
            {budgets.map(budget => {
              const category = CATEGORIES[budget.category]
              const Icon = category.icon
              const amount = spent?.get(budget.category) ?? 0
              const progress = budgetProgress(amount, budget.limit)

              return (
                <li className="row budget-row" key={budget.category}>
                  <span aria-hidden className="category-chip" style={{ '--chip': category.color } as CSSProperties}>
                    <Icon size={18} />
                  </span>
                  <div className="row-main">
                    <h3>{category.label}</h3>
                    <div
                      aria-label={`${category.label} budget used`}
                      aria-valuemax={100}
                      aria-valuemin={0}
                      aria-valuenow={Math.round(progress.ratio * 100)}
                      className={`progress progress-${progress.status}`}
                      role="progressbar"
                      style={{ '--ratio': progress.ratio } as CSSProperties}
                    >
                      <span className="progress-bar" />
                    </div>
                    <p>
                      {spent === null ? 'Loading…' : formatMoney(amount)} of {formatMoney(budget.limit)} ·{' '}
                      {progress.status === 'over'
                        ? <strong className="over-text">{formatMoney(-progress.remaining)} over</strong>
                        : `${formatMoney(progress.remaining)} left`}
                    </p>
                  </div>
                  <div className="row-actions">
                    <button
                      className="button button-small"
                      onClick={() => setDialog({ type: 'budget', category: budget.category })}
                    >
                      Edit
                    </button>
                    <button
                      aria-label={`Delete ${category.label} budget`}
                      className="icon-button icon-button-small"
                      onClick={() => removeBudget(budget.category)}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <section className="card">
        <div className="section-head">
          <h2 className="section-title">Savings goals</h2>
          <button className="button button-small button-solid" onClick={() => setDialog({ type: 'goal' })}>
            <Plus aria-hidden size={14} />
            New goal
          </button>
        </div>

        {goals.length === 0 ? (
          <p className="empty-note">Create a goal and put money aside for it.</p>
        ) : (
          <ul className="rows">
            {goals.map(item => {
              const ratio = item.target > 0 ? item.saved / item.target : 0
              const reached = ratio >= 1

              return (
                <li className="row goal-row" key={item.id}>
                  <span aria-hidden className="category-chip">
                    {reached ? <Target size={18} /> : <PiggyBank size={18} />}
                  </span>
                  <div className="row-main">
                    <h3>
                      {item.name} {reached && <span className="pill pill-ok">Reached</span>}
                    </h3>
                    <div
                      aria-label={`${item.name} progress`}
                      aria-valuemax={100}
                      aria-valuemin={0}
                      aria-valuenow={Math.round(ratio * 100)}
                      className="progress"
                      role="progressbar"
                      style={{ '--ratio': ratio } as CSSProperties}
                    >
                      <span className="progress-bar" />
                    </div>
                    <p>{formatMoney(item.saved)} of {formatMoney(item.target)}</p>
                  </div>
                  <div className="row-actions">
                    <button
                      aria-label={`Add to ${item.name}`}
                      className="icon-button icon-button-small"
                      onClick={() => setDialog({ type: 'goal-amount', goalId: item.id, mode: 'add' })}
                    >
                      <Plus size={15} />
                    </button>
                    <button
                      aria-label={`Withdraw from ${item.name}`}
                      className="icon-button icon-button-small"
                      disabled={item.saved <= 0}
                      onClick={() => setDialog({ type: 'goal-amount', goalId: item.id, mode: 'withdraw' })}
                    >
                      <Minus size={15} />
                    </button>
                    <button
                      aria-label={`Delete ${item.name}`}
                      className="icon-button icon-button-small"
                      onClick={() => removeGoal(item.id)}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
        <p className="field-hint goal-note">Goal savings are tracked separately from your account balances.</p>
      </section>

      {dialog?.type === 'budget' && (dialog.category ? editing : unbudgeted.length > 0) && (
        <BudgetModal
          available={unbudgeted}
          initial={editing}
          onClose={close}
          onSave={setBudget}
        />
      )}
      {dialog?.type === 'goal' && <GoalModal onClose={close} onSave={addGoal} />}
      {dialog?.type === 'goal-amount' && goal && (
        <GoalAmountModal
          goal={goal}
          mode={dialog.mode}
          onClose={close}
          onSubmit={delta => adjustGoal(goal.id, delta)}
        />
      )}
    </div>
  )
}
