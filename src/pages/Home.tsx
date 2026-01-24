import { useAuth } from '../contexts/AuthContext'

export default function Home() {
  const { profile, activeOrg } = useAuth()

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold">Hello, {profile?.first_name}!</h1>
      <p className="mt-2 text-lg text-muted-foreground">Welcome to search</p>
      {activeOrg && (
        <p className="mt-4 text-sm text-muted-foreground">
          Currently viewing: <span className="font-medium text-foreground">{activeOrg.organisation.name}</span>
        </p>
      )}
    </div>
  )
}
