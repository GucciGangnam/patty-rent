import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

export interface PendingInvitation {
  id: string
  organisation_id: string
  organisation: {
    name: string
  }
  created_at: string
}

export function useInvitations() {
  const { user, refreshMemberships, refreshInvitations } = useAuth()
  const [invitations, setInvitations] = useState<PendingInvitation[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)

  const fetchInvitations = useCallback(async () => {
    if (!user) return

    setLoading(true)
    const { data, error } = await supabase
      .from('org_invitations')
      .select(`
        id,
        organisation_id,
        created_at,
        organisation:organisations(name)
      `)
      .eq('status', 'pending')

    if (error) {
      console.error('Error fetching invitations:', error)
    } else {
      const transformedData = (data || []).map((inv: any) => ({
        id: inv.id,
        organisation_id: inv.organisation_id,
        created_at: inv.created_at,
        organisation: inv.organisation
      }))
      setInvitations(transformedData)
    }
    setLoading(false)
  }, [user])

  useEffect(() => {
    if (user) {
      fetchInvitations()
    }
  }, [user, fetchInvitations])

  async function acceptInvitation(invitation: PendingInvitation) {
    if (!user) return

    setProcessingId(invitation.id)

    // Update invitation status
    const { error: updateError } = await supabase
      .from('org_invitations')
      .update({
        status: 'accepted',
        responded_at: new Date().toISOString()
      })
      .eq('id', invitation.id)

    if (updateError) {
      console.error('Error accepting invitation:', updateError)
      setProcessingId(null)
      return
    }

    // Create membership as viewer
    const { error: membershipError } = await supabase
      .from('org_memberships')
      .insert({
        organisation_id: invitation.organisation_id,
        user_id: user.id,
        role: 'viewer',
        is_owner: false
      })

    if (membershipError) {
      console.error('Error creating membership:', membershipError)
      // Try to revert the invitation status
      await supabase
        .from('org_invitations')
        .update({ status: 'pending', responded_at: null })
        .eq('id', invitation.id)
      setProcessingId(null)
      return
    }

    // Remove from local state
    setInvitations(prev => prev.filter(inv => inv.id !== invitation.id))
    setProcessingId(null)

    // Refresh memberships to include the new org and update invitation count
    await refreshMemberships()
    await refreshInvitations()
  }

  async function rejectInvitation(invitationId: string) {
    setProcessingId(invitationId)

    const { error } = await supabase
      .from('org_invitations')
      .delete()
      .eq('id', invitationId)

    if (error) {
      console.error('Error rejecting invitation:', error)
    } else {
      setInvitations(prev => prev.filter(inv => inv.id !== invitationId))
      await refreshInvitations()
    }

    setProcessingId(null)
  }

  return {
    invitations,
    loading,
    processingId,
    acceptInvitation,
    rejectInvitation,
    refetch: fetchInvitations
  }
}
