import { createContext, useContext, useEffect, useState, useRef, type ReactNode } from 'react'

// Debug counter to track mounts
let mountCount = 0
import { supabase } from '../lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

interface UserProfile {
  id: string
  first_name: string
  last_name: string
  bio: string | null
  avatar_url: string | null
}

interface Organisation {
  id: string
  name: string
  created_at: string
  avatar_url: string | null
  currency_code: string
}

interface Membership {
  id: string
  organisation_id: string
  role: 'owner' | 'manager' | 'agent' | 'viewer'
  is_owner: boolean
  organisation: Organisation
}

interface ActiveOrgContext {
  organisation: Organisation
  role: 'owner' | 'manager' | 'agent' | 'viewer'
  is_owner: boolean
}

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  session: Session | null
  loading: boolean
  initialLoadComplete: boolean
  memberships: Membership[]
  activeOrg: ActiveOrgContext | null
  pendingInvitationCount: number
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  refreshMemberships: () => Promise<void>
  refreshInvitations: () => Promise<void>
  refreshAll: (userId?: string) => Promise<void>
  switchOrg: (organisationId: string) => Promise<void>
  setSignupInProgress: (inProgress: boolean) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const mountId = useRef(++mountCount)
  console.log(`[Auth #${mountId.current}] AuthProvider RENDER`)

  // Track when signup is in progress to prevent race condition with loadUserData
  const signupInProgressRef = useRef(false)

  const setSignupInProgress = (inProgress: boolean) => {
    console.log('[Auth] setSignupInProgress:', inProgress)
    signupInProgressRef.current = inProgress
  }

  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [initialLoadComplete, setInitialLoadComplete] = useState(false)
  const [memberships, setMemberships] = useState<Membership[]>([])
  const [activeOrg, setActiveOrg] = useState<ActiveOrgContext | null>(null)
  const [pendingInvitationCount, setPendingInvitationCount] = useState(0)

  // Log loading state changes
  useEffect(() => {
    console.log(`[Auth #${mountId.current}] loading changed to:`, loading)
  }, [loading])

  useEffect(() => {
    console.log(`[Auth #${mountId.current}] MOUNT - useEffect running`)
    // Get initial session
    console.log(`[Auth #${mountId.current}] Getting session...`)
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('[Auth] Got session:', session ? 'valid' : 'null')
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        loadUserData(session.user.id, session.user.email)
      } else {
        setLoading(false)
        setInitialLoadComplete(true)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('[Auth] onAuthStateChange:', event)
        setSession(session)
        setUser(session?.user ?? null)

        if (event === 'SIGNED_OUT') {
          setProfile(null)
          setMemberships([])
          setActiveOrg(null)
          setPendingInvitationCount(0)
          setLoading(false)
        } else if (event === 'SIGNED_IN' && session?.user) {
          // Skip loadUserData during signup - Auth.tsx will handle it after DB operations
          if (signupInProgressRef.current) {
            console.log('[Auth] Signup in progress, skipping loadUserData')
          } else {
            // Load user data on sign in (handles login and email confirmation)
            loadUserData(session.user.id, session.user.email)
          }
        }
        // TOKEN_REFRESHED: no need to reload data
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  async function loadUserData(userId: string, userEmail?: string) {
    console.log('[Auth] loadUserData called, setting loading=true')
    setLoading(true)

    try {
      // Fetch profile, memberships, active org, and invitation count in parallel
      const [profileResult, membershipsResult, activeOrgResult, invitationCountResult] = await Promise.all([
        supabase
          .from('users')
          .select('id, first_name, last_name, bio, avatar_url')
          .eq('id', userId)
          .single(),
        supabase
          .from('org_memberships')
          .select(`
            id,
            organisation_id,
            role,
            is_owner,
            organisation:organisations(id, name, created_at, avatar_url, currency_code)
          `)
          .eq('user_id', userId),
        supabase
          .from('user_active_org')
          .select('organisation_id')
          .eq('user_id', userId)
          .single(),
        userEmail
          ? supabase
              .from('org_invitations')
              .select('id', { count: 'exact', head: true })
              .eq('email', userEmail)
              .eq('status', 'pending')
          : Promise.resolve({ count: 0 })
      ])

      if (profileResult.data) {
        setProfile(profileResult.data)
      }

      // Set pending invitation count
      setPendingInvitationCount(invitationCountResult.count ?? 0)

      if (membershipsResult.data) {
        // Transform the data to flatten the organisation object
        const transformedMemberships = membershipsResult.data.map((m: any) => ({
          id: m.id,
          organisation_id: m.organisation_id,
          role: m.role,
          is_owner: m.is_owner,
          organisation: m.organisation
        })) as Membership[]

        setMemberships(transformedMemberships)

        // Set active org context
        if (transformedMemberships.length > 0) {
          let activeOrgId = activeOrgResult.data?.organisation_id

          // If no active org set, or it's not in memberships, use first membership
          const activeMembership = transformedMemberships.find(
            m => m.organisation_id === activeOrgId
          ) || transformedMemberships[0]

          if (activeMembership) {
            setActiveOrg({
              organisation: activeMembership.organisation,
              role: activeMembership.role,
              is_owner: activeMembership.is_owner
            })

            // Update active org in DB if it wasn't set or was invalid
            if (!activeOrgResult.data || activeOrgResult.data.organisation_id !== activeMembership.organisation_id) {
              await supabase
                .from('user_active_org')
                .upsert({
                  user_id: userId,
                  organisation_id: activeMembership.organisation_id,
                  updated_at: new Date().toISOString()
                })
            }
          }
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      console.log('[Auth] loadUserData complete, setting loading=false')
      setLoading(false)
      setInitialLoadComplete(true)
    }
  }

  async function fetchProfile(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('id, first_name, last_name, bio, avatar_url')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching profile:', error)
    } else {
      setProfile(data)
    }
  }

  async function fetchMemberships(userId: string) {
    const { data, error } = await supabase
      .from('org_memberships')
      .select(`
        id,
        organisation_id,
        role,
        is_owner,
        organisation:organisations(id, name, created_at, avatar_url, currency_code)
      `)
      .eq('user_id', userId)

    if (error) {
      console.error('Error fetching memberships:', error)
    } else if (data) {
      const transformedMemberships = data.map((m: any) => ({
        id: m.id,
        organisation_id: m.organisation_id,
        role: m.role,
        is_owner: m.is_owner,
        organisation: m.organisation
      })) as Membership[]

      setMemberships(transformedMemberships)

      // Update activeOrg if the current one is still valid
      if (activeOrg) {
        const currentMembership = transformedMemberships.find(
          m => m.organisation_id === activeOrg.organisation.id
        )
        if (currentMembership) {
          // Only update if something actually changed to prevent unnecessary re-renders
          const hasChanges =
            activeOrg.organisation.id !== currentMembership.organisation.id ||
            activeOrg.organisation.name !== currentMembership.organisation.name ||
            activeOrg.organisation.currency_code !== currentMembership.organisation.currency_code ||
            activeOrg.role !== currentMembership.role ||
            activeOrg.is_owner !== currentMembership.is_owner

          if (hasChanges) {
            setActiveOrg({
              organisation: currentMembership.organisation,
              role: currentMembership.role,
              is_owner: currentMembership.is_owner
            })
          }
        } else if (transformedMemberships.length > 0) {
          // Active org no longer valid, switch to first available
          const firstMembership = transformedMemberships[0]
          setActiveOrg({
            organisation: firstMembership.organisation,
            role: firstMembership.role,
            is_owner: firstMembership.is_owner
          })
        } else {
          setActiveOrg(null)
        }
      }
    }
  }

  async function signOut() {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    setSession(null)
    setMemberships([])
    setActiveOrg(null)
    setPendingInvitationCount(0)
  }

  async function refreshProfile() {
    if (user) {
      await fetchProfile(user.id)
    }
  }

  async function refreshMemberships() {
    if (user) {
      await fetchMemberships(user.id)
    }
  }

  async function refreshInvitations() {
    if (!user) return

    const { count } = await supabase
      .from('org_invitations')
      .select('id', { count: 'exact', head: true })
      .eq('email', user.email)
      .eq('status', 'pending')

    setPendingInvitationCount(count ?? 0)
  }

  async function refreshAll(userId?: string) {
    const id = userId || user?.id
    if (id) {
      await loadUserData(id, user?.email ?? undefined)
    }
  }

  async function switchOrg(organisationId: string) {
    if (!user) return

    const membership = memberships.find(m => m.organisation_id === organisationId)
    if (!membership) {
      console.error('User is not a member of this organisation')
      return
    }

    // Update in database
    const { error } = await supabase
      .from('user_active_org')
      .upsert({
        user_id: user.id,
        organisation_id: organisationId,
        updated_at: new Date().toISOString()
      })

    if (error) {
      console.error('Error switching organisation:', error)
      return
    }

    // Update local state
    setActiveOrg({
      organisation: membership.organisation,
      role: membership.role,
      is_owner: membership.is_owner
    })
  }

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      session,
      loading,
      initialLoadComplete,
      memberships,
      activeOrg,
      pendingInvitationCount,
      signOut,
      refreshProfile,
      refreshMemberships,
      refreshInvitations,
      refreshAll,
      switchOrg,
      setSignupInProgress
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
