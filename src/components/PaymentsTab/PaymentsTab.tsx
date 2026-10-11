import { RecipientsCard } from './RecipientsCard'
import { RequestsCard } from './RequestsCard'
import { ScheduledCard } from './ScheduledCard'
import './PaymentsTab.css'

export function PaymentsTab() {
  return (
    <div className="split-grid">
      <div className="stack">
        <ScheduledCard />
        <RequestsCard />
      </div>
      <RecipientsCard />
    </div>
  )
}
