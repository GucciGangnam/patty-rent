import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { LogOut, Building2, Plus, UserPlus, Check, ChevronRight, Package, Settings } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import Avatar from './Avatar'

interface UserDropdownProps {
  onCreateOrg: () => void
  onJoinOrg: () => void
}

export default function UserDropdown({ onCreateOrg, onJoinOrg }: UserDropdownProps) {
  const { profile, memberships, activeOrg, switchOrg, signOut } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [showOrgList, setShowOrgList] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setShowOrgList(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!profile) return null

  const handleSwitchOrg = async (orgId: string) => {
    await switchOrg(orgId)
    setShowOrgList(false)
    setIsOpen(false)
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-amber-500/10 text-amber-600'
      case 'manager':
        return 'bg-primary/10 text-primary'
      case 'agent':
        return 'bg-blue-500/10 text-blue-600'
      case 'viewer':
        return 'bg-muted text-muted-foreground'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => {
          setIsOpen(!isOpen)
          setShowOrgList(false)
        }}
        className="rounded-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        <Avatar
          firstName={profile.first_name}
          lastName={profile.last_name}
          avatarUrl={profile.avatar_url}
          size="sm"
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-md border border-border bg-card shadow-lg z-50">
          {!showOrgList ? (
            <>
              {/* User info with View Profile */}
              <div className="px-4 py-3 border-b border-border">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{profile.first_name} {profile.last_name}</p>
                  <Link
                    to="/profile"
                    onClick={() => setIsOpen(false)}
                    className="text-xs text-primary hover:text-primary/80 transition-colors"
                  >
                    View Profile
                  </Link>
                </div>
              </div>

              {/* Organisation switcher */}
              <div className="py-1 border-b border-border">
                <button
                  onClick={() => setShowOrgList(true)}
                  className="flex items-center justify-between w-full px-4 py-2 text-sm text-left hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span>Switch organisation</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>

              {/* Current organisation with management links */}
              {activeOrg && (
                <div className="py-1 border-b border-border">
                  <div className="px-4 py-2">
                    <p className="text-sm font-medium">{activeOrg.organisation.name}</p>
                  </div>
                  <Link
                    to="/assets"
                    onClick={() => setIsOpen(false)}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  >
                    <Package className="h-4 w-4" />
                    Manage assets
                  </Link>
                  <Link
                    to="/organisation"
                    onClick={() => setIsOpen(false)}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  >
                    <Settings className="h-4 w-4" />
                    Organisation management
                  </Link>
                </div>
              )}

              {/* Sign out */}
              <div className="border-t border-border py-1">
                <button
                  onClick={() => {
                    setIsOpen(false)
                    signOut()
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Org list header */}
              <div className="px-4 py-2 border-b border-border">
                <button
                  onClick={() => setShowOrgList(false)}
                  className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  &larr; Back
                </button>
              </div>

              {/* Org list */}
              <div className="max-h-64 overflow-y-auto py-1">
                {memberships.map((membership) => (
                  <button
                    key={membership.id}
                    onClick={() => handleSwitchOrg(membership.organisation_id)}
                    className="flex w-full items-center justify-between px-4 py-2 text-sm hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="truncate">{membership.organisation.name}</span>
                      {membership.is_owner && (
                        <span className="text-xs text-muted-foreground">(Owner)</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`rounded px-1.5 py-0.5 text-xs font-medium capitalize ${getRoleBadgeColor(membership.role)}`}>
                        {membership.role}
                      </span>
                      {activeOrg && membership.organisation_id === activeOrg.organisation.id && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {/* Create/Join actions */}
              <div className="border-t border-border py-1">
                <button
                  onClick={() => {
                    setIsOpen(false)
                    setShowOrgList(false)
                    onCreateOrg()
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Create new organisation
                </button>
                <button
                  onClick={() => {
                    setIsOpen(false)
                    setShowOrgList(false)
                    onJoinOrg()
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  <UserPlus className="h-4 w-4" />
                  Join organisation
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
