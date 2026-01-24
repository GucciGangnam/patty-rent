import { Link } from 'react-router-dom'
import { Building2, Search, Users, Shield, CheckCircle } from 'lucide-react'

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">PattyRent</span>
            </div>
            <nav className="flex items-center gap-4">
              <Link
                to="/auth?mode=signin"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/auth?mode=signup"
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Sign Up
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              Rental Property Management
              <br />
              <span className="text-muted-foreground">for Real Estate Teams</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              Streamline your rental listings. Empower your agents.
              PattyRent helps real estate teams manage and search property
              listings within their organisation.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link
                to="/auth?mode=signup"
                className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-base font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Sign Up
              </Link>
              <Link
                to="/auth?mode=signin"
                className="inline-flex items-center justify-center rounded-md border border-input bg-background px-6 py-3 text-base font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t border-border bg-muted/50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              Everything your team needs
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              A complete solution for managing rental property listings
            </p>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<Search className="h-6 w-6" />}
              title="Powerful Search"
              description="Find the perfect property with advanced filters for price, bedrooms, location, and more."
            />
            <FeatureCard
              icon={<Users className="h-6 w-6" />}
              title="Team Collaboration"
              description="Managers, agents, and viewers - everyone has the right level of access."
            />
            <FeatureCard
              icon={<Building2 className="h-6 w-6" />}
              title="Property Wizard"
              description="Add listings with our step-by-step wizard. All fields optional, publish when ready."
            />
            <FeatureCard
              icon={<Shield className="h-6 w-6" />}
              title="Organisation Scoped"
              description="Your data stays private to your organisation with secure access controls."
            />
            <FeatureCard
              icon={<CheckCircle className="h-6 w-6" />}
              title="Join Codes"
              description="Easy team onboarding with unique organisation codes for new members."
            />
            <FeatureCard
              icon={<Building2 className="h-6 w-6" />}
              title="Mobile Ready"
              description="Designed mobile-first so your team can work from anywhere."
            />
          </div>
        </div>
      </section>

      {/* User Roles Section */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              Built for every role
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              The right permissions for the right people
            </p>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            <RoleCard
              title="Manager"
              description="Full control over properties and organisation settings"
              permissions={[
                'Create, edit, and delete properties',
                'Manage organisation settings',
                'Invite and manage team members',
              ]}
            />
            <RoleCard
              title="Agent"
              description="Access to search and view all property details"
              permissions={[
                'View all property listings',
                'Search and filter properties',
                'Access full property details',
              ]}
            />
            <RoleCard
              title="Viewer"
              description="Read-only access to property information"
              permissions={[
                'Browse property listings',
                'Search and filter properties',
                'View property details',
              ]}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border bg-muted/50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            Ready to get started?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Join your organisation or create a new one today.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              to="/auth?mode=signup"
              className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-base font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Sign Up
            </Link>
            <Link
              to="/auth?mode=signin"
              className="inline-flex items-center justify-center rounded-md border border-input bg-background px-6 py-3 text-base font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">PattyRent</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Rental property management for real estate teams
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-muted-foreground">{description}</p>
    </div>
  )
}

function RoleCard({
  title,
  description,
  permissions,
}: {
  title: string
  description: string
  permissions: string[]
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="mt-2 text-muted-foreground">{description}</p>
      <ul className="mt-4 space-y-2">
        {permissions.map((permission, index) => (
          <li key={index} className="flex items-start gap-2 text-sm">
            <CheckCircle className="mt-0.5 h-4 w-4 text-primary flex-shrink-0" />
            <span>{permission}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
