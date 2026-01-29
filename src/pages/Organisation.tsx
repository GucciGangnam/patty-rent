import { useState, useEffect } from 'react'
import { Users, Shield, Eye, Briefcase, Crown, Settings, Pencil, LogOut } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { CURRENCIES, getCurrency } from '../lib/currency'
import Avatar from '../components/Avatar'
import OrganisationAvatar from '../components/OrganisationAvatar'
import OrganisationAvatarUpload from '../components/OrganisationAvatarUpload'
import InviteManager from '../components/InviteManager'

interface Member {
  id: string
  user_id: string
  role: 'owner' | 'manager' | 'agent' | 'viewer'
  is_owner: boolean
  user: {
    id: string
    first_name: string
    last_name: string
    avatar_url: string | null
  }
}

const rolePermissions = [
  {
    role: 'owner',
    label: 'Owner',
    icon: Crown,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    description: 'Full permission to manage the organisation, assets, and members.',
  },
  {
    role: 'manager',
    label: 'Manager',
    icon: Shield,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    description: 'Full permission to manage assets.',
  },
  {
    role: 'agent',
    label: 'Agent',
    icon: Briefcase,
    color: 'text-blue-600',
    bgColor: 'bg-blue-500/10',
    description: 'Permission to view assets and make requests.',
  },
  {
    role: 'viewer',
    label: 'Viewer',
    icon: Eye,
    color: 'text-muted-foreground',
    bgColor: 'bg-muted',
    description: 'Read only permissions for assets.',
  },
]

export default function Organisation() {
  const { user, activeOrg, refreshMemberships } = useAuth()
  const [members, setMembers] = useState<Member[]>([])
  const [loadedOrgId, setLoadedOrgId] = useState<string | null>(null)
  const [removingMember, setRemovingMember] = useState<string | null>(null)
  const [pendingRoleChanges, setPendingRoleChanges] = useState<Record<string, 'manager' | 'agent' | 'viewer'>>({})
  const [savingRoleChanges, setSavingRoleChanges] = useState(false)

  // Editing org info state
  const [isEditingOrg, setIsEditingOrg] = useState(false)
  const [orgName, setOrgName] = useState('')
  const [orgCurrency, setOrgCurrency] = useState('AUD')
  const [savingOrg, setSavingOrg] = useState(false)

  const isOwner = activeOrg?.role === 'owner'
  const canManage = activeOrg?.role === 'owner' || activeOrg?.role === 'manager'

  // Extract org ID for stable dependency - only refetch when org actually changes
  const orgId = activeOrg?.organisation.id

  useEffect(() => {
    if (orgId) {
      fetchMembers()
    }
  }, [orgId])

  // Sync org details separately when they change (e.g., after editing)
  useEffect(() => {
    if (activeOrg?.organisation.name) {
      setOrgName(activeOrg.organisation.name)
    }
    if (activeOrg?.organisation.currency_code) {
      setOrgCurrency(activeOrg.organisation.currency_code)
    }
  }, [activeOrg?.organisation.name, activeOrg?.organisation.currency_code])

  async function fetchMembers() {
    if (!activeOrg) return

    const { data, error } = await supabase
      .from('org_memberships')
      .select(`
        id,
        user_id,
        role,
        is_owner,
        user:users(id, first_name, last_name, avatar_url)
      `)
      .eq('organisation_id', activeOrg.organisation.id)
      .order('is_owner', { ascending: false })
      .order('role')

    if (error) {
      console.error('Error fetching members:', error)
    } else if (data) {
      setMembers(data as unknown as Member[])
      setLoadedOrgId(activeOrg.organisation.id)
    }
  }

  function handleRoleChange(membershipId: string, newRole: 'manager' | 'agent' | 'viewer') {
    const member = members.find(m => m.id === membershipId)
    if (!member) return

    // If the new role is the same as the original, remove from pending changes
    if (member.role === newRole) {
      const { [membershipId]: _, ...rest } = pendingRoleChanges
      setPendingRoleChanges(rest)
    } else {
      setPendingRoleChanges(prev => ({ ...prev, [membershipId]: newRole }))
    }
  }

  async function saveRoleChanges() {
    const changeEntries = Object.entries(pendingRoleChanges)
    if (changeEntries.length === 0) return

    setSavingRoleChanges(true)

    // Update all pending changes in parallel
    const updates = changeEntries.map(([membershipId, newRole]) =>
      supabase
        .from('org_memberships')
        .update({ role: newRole })
        .eq('id', membershipId)
    )

    const results = await Promise.all(updates)
    const hasErrors = results.some(r => r.error)

    if (!hasErrors) {
      // Update local state with all changes
      setMembers(members.map(m =>
        pendingRoleChanges[m.id] ? { ...m, role: pendingRoleChanges[m.id] } : m
      ))
      setPendingRoleChanges({})
      await refreshMemberships()
    }

    setSavingRoleChanges(false)
  }

  const hasPendingChanges = Object.keys(pendingRoleChanges).length > 0

  async function removeMember(membershipId: string) {
    setRemovingMember(membershipId)

    const { error } = await supabase
      .from('org_memberships')
      .delete()
      .eq('id', membershipId)

    if (!error) {
      setMembers(members.filter(m => m.id !== membershipId))
    }

    setRemovingMember(null)
  }

  async function saveOrgDetails() {
    if (!activeOrg || !orgName.trim()) return

    setSavingOrg(true)

    const { error } = await supabase
      .from('organisations')
      .update({
        name: orgName.trim(),
        currency_code: orgCurrency
      })
      .eq('id', activeOrg.organisation.id)

    if (!error) {
      await refreshMemberships()
      setIsEditingOrg(false)
    }

    setSavingOrg(false)
  }

  async function handleAvatarUpload(url: string) {
    if (!activeOrg) return

    const { error } = await supabase
      .from('organisations')
      .update({ avatar_url: url })
      .eq('id', activeOrg.organisation.id)

    if (!error) {
      await refreshMemberships()
    }
  }

  if (!activeOrg) return null

  // Only show loading on initial load or when switching orgs
  const isLoading = loadedOrgId !== activeOrg.organisation.id

  if (isLoading && members.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Settings className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Organisation Management</h1>
      </div>

      {/* Organisation Info Section - Editable by Owner */}
      <section className="rounded-lg border border-border bg-card p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Organisation Details</h2>
          {isOwner && !isEditingOrg && (
            <button
              onClick={() => setIsEditingOrg(true)}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Pencil className="h-4 w-4" />
              Edit
            </button>
          )}
        </div>

        {isEditingOrg ? (
          <div className="space-y-4">
            <div className="flex justify-center">
              <OrganisationAvatarUpload
                organisationId={activeOrg.organisation.id}
                name={activeOrg.organisation.name}
                avatarUrl={activeOrg.organisation.avatar_url}
                onUpload={handleAvatarUpload}
              />
            </div>
            <div>
              <label htmlFor="orgName" className="block text-sm font-medium mb-1.5">
                Organisation name
              </label>
              <input
                id="orgName"
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label htmlFor="orgCurrency" className="block text-sm font-medium mb-1.5">
                Currency
              </label>
              <select
                id="orgCurrency"
                value={orgCurrency}
                onChange={(e) => setOrgCurrency(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {CURRENCIES.map((currency) => (
                  <option key={currency.code} value={currency.code}>
                    {currency.code} - {currency.name} ({currency.symbol})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setOrgName(activeOrg.organisation.name)
                  setOrgCurrency(activeOrg.organisation.currency_code)
                  setIsEditingOrg(false)
                }}
                className="rounded-md border border-input px-3 py-1.5 text-sm font-medium hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveOrgDetails}
                disabled={savingOrg || !orgName.trim()}
                className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {savingOrg ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex justify-center mb-4">
              {isOwner ? (
                <OrganisationAvatarUpload
                  organisationId={activeOrg.organisation.id}
                  name={activeOrg.organisation.name}
                  avatarUrl={activeOrg.organisation.avatar_url}
                  onUpload={handleAvatarUpload}
                />
              ) : (
                <OrganisationAvatar
                  name={activeOrg.organisation.name}
                  avatarUrl={activeOrg.organisation.avatar_url}
                  size="lg"
                />
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">{activeOrg.organisation.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Currency</p>
              <p className="font-medium">
                {(() => {
                  const currency = getCurrency(activeOrg.organisation.currency_code)
                  return currency
                    ? `${currency.code} - ${currency.name} (${currency.symbol})`
                    : activeOrg.organisation.currency_code
                })()}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Your role</p>
              <p className="font-medium capitalize flex items-center gap-1.5">
                {activeOrg.role === 'owner' && <Crown className="h-4 w-4 text-amber-500" />}
                {activeOrg.role}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Members</p>
              <p className="font-medium">{members.length}</p>
            </div>
          </div>
        )}
      </section>

      {/* Role Permissions Section - Visible to All */}
      <section className="rounded-lg border border-border bg-card p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Role Permissions</h2>
        <div className="grid gap-3">
          {rolePermissions.map(({ role, label, icon: Icon, color, bgColor, description }) => (
            <div
              key={role}
              className="flex items-start gap-3 p-3 rounded-lg bg-muted/30"
            >
              <div className={`rounded-md p-2 ${bgColor}`}>
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
              <div>
                <h3 className="font-medium">{label}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Members List */}
      <section className="rounded-lg border border-border bg-card p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">
          <Users className="h-5 w-5 inline-block mr-2 text-muted-foreground" />
          Team Members ({members.length})
        </h2>
        <div className="divide-y divide-border">
          {members.map((member) => {
            const isCurrentUser = member.user_id === user?.id
            // For current user, use activeOrg.role as source of truth (stays in sync with server)
            const displayRole = isCurrentUser ? activeOrg?.role : member.role
            const isOwnerMember = displayRole === 'owner' || member.is_owner
            // Only owners can edit member roles (not managers)
            const canEditMember = isOwner && !isCurrentUser && !isOwnerMember

            return (
              <div
                key={member.id}
                className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
              >
                <div className="flex items-center gap-3">
                  <Avatar
                    firstName={member.user.first_name}
                    lastName={member.user.last_name}
                    avatarUrl={member.user.avatar_url}
                    size="sm"
                  />
                  <div>
                    <p className="font-medium flex items-center gap-2">
                      {member.user.first_name} {member.user.last_name}
                      {member.user_id === user?.id && (
                        <span className="text-xs text-muted-foreground">(you)</span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {canEditMember ? (
                    <>
                      <select
                        value={pendingRoleChanges[member.id] ?? member.role}
                        onChange={(e) => handleRoleChange(member.id, e.target.value as 'manager' | 'agent' | 'viewer')}
                        disabled={savingRoleChanges}
                        className="rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                      >
                        <option value="manager">Manager</option>
                        <option value="agent">Agent</option>
                        <option value="viewer">Viewer</option>
                      </select>
                      <button
                        onClick={() => removeMember(member.id)}
                        disabled={removingMember === member.id}
                        className="rounded-md border border-input px-3 py-1.5 text-sm text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
                      >
                        Remove
                      </button>
                    </>
                  ) : (
                    <span className={`text-sm capitalize flex items-center gap-1.5 ${isOwnerMember ? 'text-amber-600 font-medium' : 'text-muted-foreground'}`}>
                      {isOwnerMember && <Crown className="h-3.5 w-3.5" />}
                      {displayRole}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
        {isOwner && (
          <div className="mt-4 pt-4 border-t border-border flex justify-end">
            <button
              onClick={saveRoleChanges}
              disabled={!hasPendingChanges || savingRoleChanges}
              className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {savingRoleChanges ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </section>

      {/* Invite Team Members - Owner/Manager only */}
      {canManage && (
        <section className="rounded-lg border border-border bg-card p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Invite Team Members</h2>
          <InviteManager />
        </section>
      )}

      {/* Danger Zone - Non-owners only */}
      {!isOwner && (
        <section className="rounded-lg border border-destructive/50 bg-destructive/5 p-6">
          <h2 className="text-lg font-semibold text-destructive mb-2">Danger Zone</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Once you leave this organisation, you will lose access to all its assets and data.
          </p>
          <button
            onClick={() => alert('Feature coming soon - We need to determine what implications this will have later on')}
            className="flex items-center gap-2 rounded-md border border-destructive bg-destructive/10 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/20 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Leave Organisation
          </button>
        </section>
      )}
    </div>
  )
}
