import { memo, useCallback, useState } from 'react'
import { Bell } from 'lucide-react'
import { useEscapeKey } from '../hooks/useEscapeKey'
import type { AppNotification } from '../types'
import './NotificationsPopover.css'

type NotificationsPopoverProps = {
  notifications: readonly AppNotification[]
  hasUnread: boolean
  onOpen: () => void
}

export const NotificationsPopover = memo(function NotificationsPopover({
  notifications,
  hasUnread,
  onOpen
}: NotificationsPopoverProps) {
  const [isOpen, setIsOpen] = useState(false)
  const close = useCallback(() => setIsOpen(false), [])

  useEscapeKey(isOpen, close)

  function toggle() {
    setIsOpen(open => !open)
    onOpen()
  }

  return (
    <div className="notifications">
      <button
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label="Open notifications"
        className="icon-button"
        onClick={toggle}
      >
        <Bell size={20} />
        {hasUnread && <span aria-hidden className="notification-dot" />}
      </button>
      {isOpen && (
        <>
          <div className="popover-backdrop" onClick={close} />
          <section aria-label="Notifications" className="notification-panel" role="dialog">
            <header className="notification-header">
              <h2>Notifications</h2>
              <span className="notification-count">{notifications.length}</span>
            </header>
            {notifications.length === 0 ? (
              <p className="muted notification-empty">You're all caught up.</p>
            ) : (
              <ul className="notification-list">
                {notifications.map(notification => (
                  <li key={notification.id} className="notification">
                    <span aria-hidden className="notification-icon">
                      <Bell size={16} />
                    </span>
                    <p>{notification.message}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  )
})
