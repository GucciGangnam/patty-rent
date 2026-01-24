import { useState, useEffect } from 'react'
import { Trash2, Plus, Mail, Loader2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

interface Invitation {
  id: string
  email: string
  status: 'pending' | 'accepted' | 'rejected'
  created_at: string
}

export default function InviteManager() {
  const { user, activeOrg } = useAuth()
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (activeOrg) {
      fetchInvitations()
    }
  }, [activeOrg])

  async function fetchInvitations() {
    if (!activeOrg) return

    setLoading(true)
    const { data, error } = await supabase
      .from('org_invitations')
      .select('id, email, status, created_at')
      .eq('organisation_id', activeOrg.organisation.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching invitations:', error)
    } else {
      setInvitations(data || [])
    }
    setLoading(false)
  }

  async function sendInvite(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !activeOrg) return

    setError(null)
    const trimmedEmail = email.trim().toLowerCase()

    // Client-side validation
    if (!trimmedEmail) {
      setError('Please enter an email address')
      return
    }

    // Get current user's email
    const { data: authData } = await supabase.auth.getUser()
    const currentUserEmail = authData?.user?.email?.toLowerCase()

    // Check self-invitation
    if (currentUserEmail && trimmedEmail === currentUserEmail) {
      setError('You cannot invite yourself')
      return
    }

    // Check if already a member
    const { data: isMember } = await supabase.rpc('is_email_org_member', {
      org_id: activeOrg.organisation.id,
      check_email: trimmedEmail
    })

    if (isMember) {
      setError('This email is already a member of the organisation')
      return
    }

    setSending(true)

    const { data, error: insertError } = await supabase
      .from('org_invitations')
      .insert({
        organisation_id: activeOrg.organisation.id,
        email: trimmedEmail,
        invited_by: user.id,
      })
      .select()
      .single()

    if (insertError) {
      if (insertError.code === '23505') {
        setError('An invitation has already been sent to this email')
      } else {
        console.error('Error creating invitation:', insertError)
        setError('Failed to send invitation. Please try again.')
      }
    } else if (data) {
      setInvitations([data, ...invitations])
      setEmail('')
    }

    setSending(false)
  }

  async function cancelInvite(id: string) {
    const { error } = await supabase
      .from('org_invitations')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error cancelling invitation:', error)
    } else {
      setInvitations(invitations.filter(inv => inv.id !== id))
    }
  }

  function formatDate(dateString: string): string {
    const date = new Date(dateString)
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (loading) {
    return <div className="text-muted-foreground">Loading invitations...</div>
  }

  return (
    <div className="space-y-4">
      <h3 className="font-medium">Invite Team Members</h3>

      <form onSubmit={sendInvite} className="flex gap-2">
        <div className="relative flex-1">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              setError(null)
            }}
            placeholder="Enter email address"
            className="w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            required
          />
        </div>
        <button
          type="submit"
          disabled={sending || !email.trim()}
          className="flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          Invite
        </button>
      </form>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <p className="text-sm text-muted-foreground">
        Invited users will be added as viewers and can accept or decline in their profile.
      </p>

      {invitations.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Pending Invitations</h4>
          <div className="divide-y divide-border rounded-lg border border-border">
            {invitations.map((invite) => (
              <div
                key={invite.id}
                className="flex items-center justify-between p-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm truncate">{invite.email}</span>
                  <span className="text-xs text-muted-foreground shrink-0">
                    Sent {formatDate(invite.created_at)}
                  </span>
                </div>
                <button
                  onClick={() => cancelInvite(invite.id)}
                  className="rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors shrink-0"
                  title="Cancel invitation"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
