import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Building2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useSearch } from '../contexts/SearchContext'
import InstallAppButton from './InstallAppButton'
import NotificationBell from './NotificationBell'
import UserDropdown from './UserDropdown'
import CreateOrgModal from './CreateOrgModal'
import JoinOrgModal from './JoinOrgModal'

export default function AppHeader() {
  const { activeOrg } = useAuth()
  const { resetSearch } = useSearch()
  const location = useLocation()
  const navigate = useNavigate()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)

  const handleLogoClick = () => {
    if (location.pathname === '/home') {
      resetSearch()
    } else {
      navigate('/home')
    }
  }

  return (
    <>
      <header className="border-b border-border bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <button
              type="button"
              onClick={handleLogoClick}
              className="flex items-center gap-2"
            >
              <Building2 className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">PattyRent</span>
            </button>

            <div className="flex items-center gap-4">
              {activeOrg && (
                <span className="text-sm text-muted-foreground hidden sm:block">
                  {activeOrg.organisation.name}
                </span>
              )}
              <InstallAppButton />
              <NotificationBell />
              <UserDropdown
                onCreateOrg={() => setShowCreateModal(true)}
                onJoinOrg={() => setShowJoinModal(true)}
              />
            </div>
          </div>
        </div>
      </header>

      <CreateOrgModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      <JoinOrgModal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
      />
    </>
  )
}
