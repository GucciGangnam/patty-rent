import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Building2, Shield, Briefcase, Eye, Check, X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

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

export default function JoinInvite() {
  const { inviteCode } = useParams<{ inviteCode: string }>()
  const navigate = useNavigate()
  const { user, memberships, refreshMemberships, switchOrg, loading: authLoading } = useAuth()

  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [inviteDetails, setInviteDetails] = useState<InviteDetails | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!authLoading && inviteCode) {
      validateInvite()
    }
  }, [authLoading, inviteCode])

  async function validateInvite() {
    if (!inviteCode) return

    setLoading(true)
    setError(null)

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
        .eq('invite_code', inviteCode.toUpperCase())
        .single()

      if (inviteError || !invite) {
        setError('Invalid invite code')
        setLoading(false)
        return
      }

      // Check if expired
      if (new Date(invite.expires_at) < new Date()) {
        setError('This invite has expired')
        setLoading(false)
        return
      }

      // Check if max uses reached
      if (invite.use_count >= invite.max_uses) {
        setError('This invite has reached its maximum uses')
        setLoading(false)
        return
      }

      // Check if user is already a member (only if logged in)
      if (user) {
        const alreadyMember = memberships.some(
          m => m.organisation_id === invite.organisation_id
        )
        if (alreadyMember) {
          setError('You are already a member of this organisation')
          setLoading(false)
          return
        }
      }

      setInviteDetails(invite as unknown as InviteDetails)
    } catch (err) {
      setError('Failed to validate invite code')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleJoin() {
    if (!user || !inviteDetails) return

    setJoining(true)
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
        setJoining(false)
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

      setSuccess(true)
    } catch (err) {
      setError('An unexpected error occurred')
      console.error(err)
    } finally {
      setJoining(false)
    }
  }

  // Show loading state
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  const RoleIcon = inviteDetails ? roleIcons[inviteDetails.role] : null

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center">
            <Link to="/" className="flex items-center gap-2">
              <Building2 className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">PattyRent</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="rounded-lg border border-border bg-card p-8">
            {success ? (
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                  <Check className="h-6 w-6 text-green-600" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Welcome!</h1>
                <p className="text-muted-foreground mb-6">
                  You've successfully joined {inviteDetails?.organisation.name}
                </p>
                <button
                  onClick={() => navigate('/home')}
                  className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Go to Dashboard
                </button>
              </div>
            ) : error ? (
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                  <X className="h-6 w-6 text-destructive" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Invalid Invite</h1>
                <p className="text-muted-foreground mb-6">{error}</p>
                {!user ? (
                  <div className="space-y-2">
                    <Link
                      to="/auth?mode=signin"
                      className="block w-full rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors text-center"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/auth?mode=signup"
                      className="block w-full rounded-md border border-input px-4 py-2.5 text-sm font-medium hover:bg-muted transition-colors text-center"
                    >
                      Create Account
                    </Link>
                  </div>
                ) : (
                  <button
                    onClick={() => navigate('/home')}
                    className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    Go to Dashboard
                  </button>
                )}
              </div>
            ) : inviteDetails ? (
              <div>
                <div className="text-center mb-6">
                  <h1 className="text-2xl font-bold mb-2">Join Organisation</h1>
                  <p className="text-muted-foreground">
                    You've been invited to join an organisation
                  </p>
                </div>

                <div className="rounded-lg border border-border bg-muted/30 p-4 mb-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Building2 className="h-5 w-5 text-primary" />
                    <span className="font-semibold text-lg">{inviteDetails.organisation.name}</span>
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

                {user ? (
                  <button
                    onClick={handleJoin}
                    disabled={joining}
                    className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {joining ? 'Joining...' : 'Join Organisation'}
                  </button>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground text-center">
                      Sign in or create an account to join this organisation
                    </p>
                    <Link
                      to={`/auth?mode=signin&redirect=/join/${inviteCode}`}
                      className="block w-full rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors text-center"
                    >
                      Sign In
                    </Link>
                    <Link
                      to={`/auth?mode=signup&redirect=/join/${inviteCode}`}
                      className="block w-full rounded-md border border-input px-4 py-2.5 text-sm font-medium hover:bg-muted transition-colors text-center"
                    >
                      Create Account
                    </Link>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  )
}
