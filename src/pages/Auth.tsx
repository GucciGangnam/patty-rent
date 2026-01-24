import { useState, useEffect, useRef } from 'react'
import { useSearchParams, Link, useNavigate, useLocation } from 'react-router-dom'
import { Building2, Mail } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export default function Auth() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { user, loading: authLoading, setSignupInProgress } = useAuth()
  const mode = searchParams.get('mode') || 'signin'
  const isSignUp = mode === 'signup'

  // Track signup in progress to prevent redirect
  const isSigningUpRef = useRef(false)

  // Redirect if already logged in (but not during signup)
  useEffect(() => {
    if (!authLoading && user && !isSigningUpRef.current) {
      const from = (location.state as { from?: Location })?.from?.pathname || '/home'
      navigate(from, { replace: true })
    }
  }, [user, authLoading, navigate, location])

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [emailConfirmationPending, setEmailConfirmationPending] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (isSignUp) {
        // Set flags BEFORE signUp to prevent race conditions
        isSigningUpRef.current = true
        setSignupInProgress(true)

        // Create auth user with metadata (for post-confirmation profile creation)
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              first_name: firstName,
              last_name: lastName,
            }
          }
        })

        if (authError) {
          isSigningUpRef.current = false
          setSignupInProgress(false)
          setError(authError.message)
          setLoading(false)
          return
        }

        if (!authData.user) {
          isSigningUpRef.current = false
          setSignupInProgress(false)
          setError('Failed to create user')
          setLoading(false)
          return
        }

        // Create user profile FIRST (required for foreign key on org_memberships)
        const { error: profileError } = await supabase.from('users').insert({
          id: authData.user.id,
          first_name: firstName,
          last_name: lastName,
        })

        if (profileError) {
          isSigningUpRef.current = false
          setSignupInProgress(false)
          setError(profileError.message)
          setLoading(false)
          return
        }

        // Use the create_organisation function (SECURITY DEFINER) which:
        // 1. Creates the organisation
        // 2. Adds the user as owner in org_memberships
        // This bypasses RLS issues with INSERT + SELECT on organisations table
        const orgName = `${firstName}'s Organisation`
        const { data: newOrgId, error: orgError } = await supabase.rpc(
          'create_organisation',
          { org_name: orgName }
        )

        if (orgError || !newOrgId) {
          isSigningUpRef.current = false
          setSignupInProgress(false)
          setError(orgError?.message || 'Failed to create organisation')
          setLoading(false)
          return
        }

        // Set active org
        const { error: activeOrgError } = await supabase.from('user_active_org').insert({
          user_id: authData.user.id,
          organisation_id: newOrgId,
        })

        if (activeOrgError) {
          isSigningUpRef.current = false
          setSignupInProgress(false)
          setError(activeOrgError.message)
          setLoading(false)
          return
        }

        // Sign out to clear any auto-login, then show confirmation
        await supabase.auth.signOut()
        isSigningUpRef.current = false
        setSignupInProgress(false)
        setEmailConfirmationPending(true)
        setLoading(false)
      } else {
        // Sign in
        const { error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (authError) {
          setError(authError.message)
          setLoading(false)
          return
        }

        navigate('/home')
      }
    } catch (err) {
      setError('An unexpected error occurred')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Show loading while checking auth state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  // Show email confirmation pending screen
  if (emailConfirmationPending) {
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

        {/* Email Confirmation Message */}
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <div className="rounded-lg border border-border bg-card p-8 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Check your email</h1>
              <p className="text-muted-foreground mb-6">
                We've sent a confirmation link to <span className="font-medium text-foreground">{email}</span>.
                Click the link to activate your account.
              </p>
              <button
                onClick={() => {
                  setEmailConfirmationPending(false)
                  navigate('/auth?mode=signin')
                }}
                className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Login
              </button>
              <p className="mt-4 text-sm text-muted-foreground">
                Didn't receive the email? Check your spam folder or{' '}
                <button
                  onClick={() => setEmailConfirmationPending(false)}
                  className="font-medium text-primary hover:underline"
                >
                  try again
                </button>
              </p>
            </div>
          </div>
        </main>
      </div>
    )
  }

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

      {/* Auth Form */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="rounded-lg border border-border bg-card p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold">
                {isSignUp ? 'Create your account' : 'Welcome back'}
              </h1>
              <p className="mt-2 text-muted-foreground">
                {isSignUp
                  ? 'Get started with PattyRent'
                  : 'Sign in to your PattyRent account'}
              </p>
            </div>

            {error && (
              <div className="mb-4 rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              {isSignUp && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block text-sm font-medium mb-1.5"
                    >
                      First name
                    </label>
                    <input
                      id="firstName"
                      type="text"
                      placeholder="John"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="lastName"
                      className="block text-sm font-medium mb-1.5"
                    >
                      Last name
                    </label>
                    <input
                      id="lastName"
                      type="text"
                      placeholder="Doe"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium mb-1.5"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium mb-1.5"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              {isSignUp && (
                <p className="text-xs text-muted-foreground">
                  We'll create your personal organisation automatically. You can invite team members or join other organisations later.
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
              </button>
            </form>

            <div className="mt-6 text-center text-sm">
              {isSignUp ? (
                <p className="text-muted-foreground">
                  Already have an account?{' '}
                  <Link
                    to="/auth?mode=signin"
                    className="font-medium text-primary hover:underline"
                  >
                    Sign in
                  </Link>
                </p>
              ) : (
                <p className="text-muted-foreground">
                  Don't have an account?{' '}
                  <Link
                    to="/auth?mode=signup"
                    className="font-medium text-primary hover:underline"
                  >
                    Sign up
                  </Link>
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
