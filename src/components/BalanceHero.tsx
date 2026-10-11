import { memo } from 'react'
import { RefreshCw } from 'lucide-react'
import { formatMoney, TOTAL_CURRENCY } from '../lib/currency'
import './BalanceHero.css'

type BalanceHeroProps = {
  totalBalance: number | null
  error: string | null
  accountCount: number
  onRetry: () => void
}

export const BalanceHero = memo(function BalanceHero({
  totalBalance,
  error,
  accountCount,
  onRetry
}: BalanceHeroProps) {
  return (
    <section aria-busy={!error && totalBalance === null} className="hero">
      <p className="hero-label">Total balance</p>
      {error ? (
        <div className="hero-error" role="alert">
          <p>{error}</p>
          <button className="hero-retry" onClick={onRetry}>
            <RefreshCw aria-hidden size={14} />
            Retry
          </button>
        </div>
      ) : totalBalance === null ? (
        <>
          <span className="skeleton hero-skeleton" />
          <span className="sr-only">Loading exchange rates</span>
        </>
      ) : (
        <p className="hero-amount">{formatMoney(totalBalance)}</p>
      )}
      <p className="hero-caption">
        Across {accountCount} accounts · converted to {TOTAL_CURRENCY}
      </p>
      <HeroArt />
    </section>
  )
})

function HeroArt() {
  return (
    <svg aria-hidden className="hero-art" fill="none" viewBox="0 0 360 260">
      <defs>
        <linearGradient id="hero-card-back" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.1" />
          <stop offset="1" stopColor="#fff" stopOpacity="0.03" />
        </linearGradient>
        <linearGradient id="hero-card-front" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.26" />
          <stop offset="1" stopColor="#9db9e8" stopOpacity="0.08" />
        </linearGradient>
      </defs>

      <g stroke="#fff" strokeOpacity="0.08">
        <circle cx="250" cy="130" r="70" />
        <circle cx="250" cy="130" r="110" />
        <circle cx="250" cy="130" r="150" />
      </g>

      <g transform="rotate(-10 200 120)">
        <rect fill="url(#hero-card-back)" height="132" rx="16" stroke="#fff" strokeOpacity="0.16" width="212" x="104" y="44" />
        <rect fill="#fff" fillOpacity="0.12" height="20" width="212" x="104" y="68" />
      </g>

      <g transform="rotate(6 230 150)">
        <rect fill="url(#hero-card-front)" height="136" rx="16" stroke="#fff" strokeOpacity="0.32" width="216" x="122" y="92" />
        <rect fill="#fff" fillOpacity="0.4" height="24" rx="5" stroke="#fff" strokeOpacity="0.5" width="34" x="142" y="116" />
        <path d="M159 116v24M142 128h34" stroke="#fff" strokeOpacity="0.35" />
        <g stroke="#fff" strokeLinecap="round" strokeOpacity="0.55" strokeWidth="2.5">
          <path d="M296 122c5 5 5 13 0 18" />
          <path d="M303 117c9 9 9 24 0 33" />
          <path d="M310 112c13 13 13 35 0 48" />
        </g>
        <rect fill="#fff" fillOpacity="0.5" height="6" rx="3" width="92" x="142" y="190" />
        <rect fill="#fff" fillOpacity="0.3" height="6" rx="3" width="48" x="142" y="204" />
        <circle cx="300" cy="200" fill="#fff" fillOpacity="0.38" r="11" />
        <circle cx="316" cy="200" fill="#9db9e8" fillOpacity="0.5" r="11" />
      </g>
    </svg>
  )
}
