import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, initialLoadComplete } = useAuth()
  const location = useLocation()

  // Only show loading screen before initial auth check completes
  // After that, keep children mounted even during background refreshes
  if (!initialLoadComplete) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/auth?mode=signin" state={{ from: location }} replace />
  }

  return <>{children}</>
}
