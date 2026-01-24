import { useState } from 'react'
import { X, UserPlus, Building2, Shield, Briefcase, Eye } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

interface JoinOrgModalProps {
  isOpen: boolean
  onClose: () => void
  initialCode?: string
}

interface InviteDetails {
  id: string
  organisation_id: string
  invite_code: string
  role: 'manager' | 'agent' | 'viewer'
  expires_at: string
  max_uses: number
  use_count: number
  organisation: {
    id: string
    name: string
  }
}

const roleIcons = {
  manager: Shield,
  agent: Briefcase,
  viewer: Eye,
}

const roleDescriptions = {
  manager: 'Full access to all features',
  agent: 'Can manage properties and enquiries',
  viewer: 'Read-only access',
}

export default function JoinOrgModal({ isOpen, onClose, initialCode = '' }: JoinOrgModalProps) {
  const { user, memberships, refreshMemberships, switchOrg } = useAuth()
  const [inviteCode, setInviteCode] = useState(initialCode)
  const [loading, setLoading] = useState(false)
  const [validating, setValidating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [inviteDetails, setInviteDetails] = useState<InviteDetails | null>(null)

  if (!isOpen) return null

  const validateCode = async () => {
    if (!inviteCode.trim()) return

    setValidating(true)
    setError(null)
    setInviteDetails(null)

    try {
      const { data: invite, error: inviteError } = await supabase
        .from('invitations')
        .select(`
          id,
          organisation_id,
          invite_code,
          role,
          expires_at,
          max_uses,
          use_count,
          organisation:organisations(id, name)
        `)
        .eq('invite_code', inviteCode.trim().toUpperCase())
        .single()

      if (inviteError || !invite) {
        setError('Invalid invite code')
        setValidating(false)
        return
      }

      // Check if expired
      if (new Date(invite.expires_at) < new Date()) {
        setError('This invite has expired')
        setValidating(false)
        return
      }

      // Check if max uses reached
      if (invite.use_count >= invite.max_uses) {
        setError('This invite has reached its maximum uses')
        setValidating(false)
        return
      }

      // Check if already a member
      const alreadyMember = memberships.some(
        m => m.organisation_id === invite.organisation_id
      )
      if (alreadyMember) {
        setError('You are already a member of this organisation')
        setValidating(false)
        return
      }

      setInviteDetails(invite as unknown as InviteDetails)
    } catch (err) {
      setError('Failed to validate invite code')
      console.error(err)
    } finally {
      setValidating(false)
    }
  }

  const handleJoin = async () => {
    if (!user || !inviteDetails) return

    setLoading(true)
    setError(null)

    try {
      // Create membership
      const { error: membershipError } = await supabase.from('org_memberships').insert({
        user_id: user.id,
        organisation_id: inviteDetails.organisation_id,
        role: inviteDetails.role,
        is_owner: false,
      })

      if (membershipError) {
        setError(membershipError.message)
        setLoading(false)
        return
      }

      // Increment invite use count
      await supabase
        .from('invitations')
        .update({ use_count: inviteDetails.use_count + 1 })
        .eq('id', inviteDetails.id)

      // Refresh memberships and switch to new org
      await refreshMemberships()
      await switchOrg(inviteDetails.organisation_id)

      // Close modal and reset form
      handleClose()
    } catch (err) {
      setError('An unexpected error occurred')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setInviteCode('')
    setError(null)
    setInviteDetails(null)
    onClose()
  }

  const RoleIcon = inviteDetails ? roleIcons[inviteDetails.role] : null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={handleClose} />
      <div className="relative z-50 w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-lg">
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <UserPlus className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-semibold">Join Organisation</h2>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {!inviteDetails ? (
          <div className="space-y-4">
            <div>
              <label htmlFor="inviteCode" className="block text-sm font-medium mb-1.5">
                Invite code
              </label>
              <input
                id="inviteCode"
                type="text"
                placeholder="Enter invite code"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <p className="mt-1.5 text-xs text-muted-foreground">
                Ask your organisation manager for an invite code
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 rounded-md border border-input px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={validateCode}
                disabled={validating || !inviteCode.trim()}
                className="flex-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {validating ? 'Validating...' : 'Continue'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <div className="flex items-center gap-3 mb-3">
                <Building2 className="h-5 w-5 text-primary" />
                <span className="font-medium">{inviteDetails.organisation.name}</span>
              </div>
              <div className="flex items-center gap-2">
                {RoleIcon && <RoleIcon className="h-4 w-4 text-muted-foreground" />}
                <span className="text-sm">
                  You'll join as <span className="font-medium capitalize">{inviteDetails.role}</span>
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1 ml-6">
                {roleDescriptions[inviteDetails.role]}
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setInviteDetails(null)}
                className="flex-1 rounded-md border border-input px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleJoin}
                disabled={loading}
                className="flex-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Joining...' : 'Join Organisation'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
