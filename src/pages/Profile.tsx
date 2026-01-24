import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useInvitations } from '../hooks/useInvitations'
import { supabase } from '../lib/supabase'
import AvatarUpload from '../components/AvatarUpload'
import { Building2, Check, X, Loader2 } from 'lucide-react'

export default function Profile() {
  const { profile, refreshProfile } = useAuth()
  const { invitations, loading: loadingInvitations, processingId: processingInviteId, acceptInvitation, rejectInvitation } = useInvitations()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [bio, setBio] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name)
      setLastName(profile.last_name)
      setBio(profile.bio || '')
    }
  }, [profile])

  async function handleAvatarUpload(url: string) {
    if (!profile) return

    const { error } = await supabase
      .from('users')
      .update({ avatar_url: url })
      .eq('id', profile.id)

    if (!error) {
      await refreshProfile()
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!profile) return

    setSaving(true)

    const { error } = await supabase
      .from('users')
      .update({
        first_name: firstName,
        last_name: lastName,
        bio: bio || null,
      })
      .eq('id', profile.id)

    if (!error) {
      await refreshProfile()
    }

    setSaving(false)
  }

  function formatDate(dateString: string): string {
    const date = new Date(dateString)
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (!profile) return null

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-8">Profile Settings</h1>

      {/* Organisation Invitations Section */}
      {!loadingInvitations && invitations.length > 0 && (
        <section className="rounded-lg border border-border bg-card p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Organisation Invitations</h2>
          <div className="space-y-3">
            {invitations.map((invitation) => (
              <div
                key={invitation.id}
                className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="rounded-full bg-primary/10 p-2">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate">{invitation.organisation.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Invited {formatDate(invitation.created_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {processingInviteId === invitation.id ? (
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  ) : (
                    <>
                      <button
                        onClick={() => acceptInvitation(invitation)}
                        className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                      >
                        <Check className="h-4 w-4" />
                        Accept
                      </button>
                      <button
                        onClick={() => rejectInvitation(invitation.id)}
                        className="flex items-center gap-1.5 rounded-md border border-input px-3 py-1.5 text-sm font-medium hover:bg-muted transition-colors"
                      >
                        <X className="h-4 w-4" />
                        Decline
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Personal Info Section */}
      <section className="rounded-lg border border-border bg-card p-6 mb-6">
        <h2 className="text-lg font-semibold mb-6">Personal Information</h2>

        <div className="flex justify-center mb-6">
          <AvatarUpload
            userId={profile.id}
            firstName={profile.first_name}
            lastName={profile.last_name}
            avatarUrl={profile.avatar_url}
            onUpload={handleAvatarUpload}
          />
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium mb-1.5">
                First name
              </label>
              <input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium mb-1.5">
                Last name
              </label>
              <input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div>
            <label htmlFor="bio" className="block text-sm font-medium mb-1.5">
              Bio
            </label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              placeholder="Tell us a bit about yourself..."
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </section>
    </div>
  )
}
