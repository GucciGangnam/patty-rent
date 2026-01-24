import { useState, useRef, useEffect } from 'react'
import { Bell, Building2, Check, X, Loader2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useInvitations } from '../hooks/useInvitations'

export default function NotificationBell() {
  const { pendingInvitationCount } = useAuth()
  const { invitations, loading, processingId, acceptInvitation, rejectInvitation } = useInvitations()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const prevInvitationCount = useRef(invitations.length)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Auto-close when last invitation is handled (count transitions from >0 to 0)
  useEffect(() => {
    if (prevInvitationCount.current > 0 && invitations.length === 0 && isOpen) {
      setIsOpen(false)
    }
    prevInvitationCount.current = invitations.length
  }, [invitations.length, isOpen])

  function formatDate(dateString: string): string {
    const date = new Date(dateString)
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-full p-2 hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5 text-muted-foreground" />
        {pendingInvitationCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
            {pendingInvitationCount > 9 ? '9+' : pendingInvitationCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 rounded-md border border-border bg-card shadow-lg z-50">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-sm font-medium">Organisation Invitations</p>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : invitations.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm text-muted-foreground">No pending invitations</p>
              </div>
            ) : (
              <div className="py-2">
                {invitations.map((invitation) => (
                  <div
                    key={invitation.id}
                    className="px-4 py-3 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="rounded-full bg-primary/10 p-2 shrink-0">
                        <Building2 className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{invitation.organisation.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Invited {formatDate(invitation.created_at)}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          {processingId === invitation.id ? (
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                          ) : (
                            <>
                              <button
                                onClick={() => acceptInvitation(invitation)}
                                className="flex items-center gap-1 rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                              >
                                <Check className="h-3 w-3" />
                                Accept
                              </button>
                              <button
                                onClick={() => rejectInvitation(invitation.id)}
                                className="flex items-center gap-1 rounded-md border border-input px-2.5 py-1 text-xs font-medium hover:bg-muted transition-colors"
                              >
                                <X className="h-3 w-3" />
                                Decline
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
