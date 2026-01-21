import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useAuth, useUser, SignedIn, SignedOut } from '@clerk/clerk-react'

import { getHealth } from '@/lib/api'
import { isClerkConfigured } from '@/lib/clerk'
import { Button } from '@/components/ui/Button'

function HomePage() {
  const { data: health, isLoading, error } = useQuery({
    queryKey: ['health'],
    queryFn: getHealth,
  })

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      {/* Decorative Elements */}
      <DecorativeCorner position="top-left" />
      <DecorativeCorner position="top-right" />
      <DecorativeCorner position="bottom-left" />
      <DecorativeCorner position="bottom-right" />

      {/* Scattered Terminal Labels */}
      <TerminalLabel className="absolute top-8 left-8" prefix="/">
        POSITION REQUIRED/
      </TerminalLabel>
      <TerminalLabel className="absolute top-8 right-8" prefix=">">
        LOST IN SPACE
      </TerminalLabel>
      <TerminalLabel className="absolute bottom-8 left-8" prefix="///">
        SIGNAL_TEST
      </TerminalLabel>
      <TerminalLabel className="absolute bottom-24 left-8" prefix="_!">
        ACTIVE !_
      </TerminalLabel>
      <TerminalLabel className="absolute bottom-8 right-8">
        COMPLEX PATH
      </TerminalLabel>

      {/* Main Content */}
      <div className="container relative z-10 py-24">
        {/* Hero Section */}
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-4 flex justify-center gap-4">
            <Star />
            <Star size="sm" />
            <Star />
          </div>

          <h1 className="font-mono text-5xl font-bold uppercase tracking-[0.2em] sm:text-7xl">
            FASTSHIP
          </h1>

          <div className="mt-6 flex items-center justify-center gap-4">
            <div className="h-px w-16 bg-white/30" />
            <p className="font-mono text-sm uppercase tracking-widest text-white/60">
              _FULLSTACK BOILERPLATE
            </p>
            <div className="h-px w-16 bg-white/30" />
          </div>

          <p className="mx-auto mt-8 max-w-xl font-mono text-sm leading-relaxed text-white/70">
            &gt;PRODUCTION_READY FULLSTACK BOILERPLATE FOR RAPID DEVELOPMENT.
            <br />
            &gt;GO + REACT + SQLITE + MODERN_TOOLING
          </p>

          <div className="mt-12 flex items-center justify-center gap-6">
            <Button>_LAUNCH</Button>
            <Button variant="outline">/DOCS/</Button>
          </div>
        </div>

        {/* System Status Panel */}
        <div className="mt-24">
          <div className="mx-auto max-w-md border border-white/20 bg-black p-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h2 className="font-mono text-xs uppercase tracking-widest text-white/60">
                &gt;SYSTEM_STATUS
              </h2>
              <span className="font-mono text-xs text-white/40">
                SECTOR_48
              </span>
            </div>

            {isLoading ? (
              <div className="mt-4 flex items-center gap-2">
                <div className="h-2 w-2 animate-pulse bg-white/40" />
                <p className="font-mono text-xs uppercase tracking-wider text-white/50">
                  SCANNING...
                </p>
              </div>
            ) : error ? (
              <div className="mt-4">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-white/40" />
                  <p className="font-mono text-xs uppercase tracking-wider text-white/60">
                    _! CONNECTION_FAILURE !_
                  </p>
                </div>
                <p className="mt-2 font-mono text-xs text-white/40">
                  &gt;ENSURE BACKEND RUNNING ON PORT 8080
                </p>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                <StatusRow
                  label="SERVER"
                  value={health?.status?.toUpperCase() || 'UNKNOWN'}
                  active={health?.status === 'ok'}
                />
                <StatusRow
                  label="DATABASE"
                  value={health?.database?.toUpperCase() || 'UNKNOWN'}
                  active={health?.database === 'connected'}
                />
                <AuthStatusRow />
              </div>
            )}
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-24">
          <div className="mb-8 flex items-center justify-center gap-4">
            <div className="h-px w-12 bg-white/20" />
            <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-white/60">
              MODULES_INCLUDED
            </h2>
            <div className="h-px w-12 bg-white/20" />
          </div>

          <div className="grid gap-px bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className="group bg-black p-6 transition-colors hover:bg-white/5"
              >
                <div className="flex items-start justify-between">
                  <span className="font-mono text-xs text-white/30">
                    0{i + 1}
                  </span>
                  <Star size="sm" className="opacity-30 group-hover:opacity-60" />
                </div>
                <h3 className="mt-4 font-mono text-sm font-bold uppercase tracking-wider">
                  {feature.title}
                </h3>
                <p className="mt-2 font-mono text-xs leading-relaxed text-white/50">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Terminal Info */}
        <div className="mt-24 flex items-center justify-center gap-8 font-mono text-xs text-white/30">
          <span>&gt;CODE:91F0A</span>
          <span>MARK08_N3</span>
          <span>_S23</span>
        </div>
      </div>

      {/* Vertical Line Decoration */}
      <div className="absolute right-24 top-1/3 hidden h-32 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent lg:block">
        <div className="absolute -left-1 top-0 h-2 w-2 rounded-full border border-white/40" />
        <div className="absolute -left-1 bottom-0 h-2 w-2 rounded-full border border-white/40" />
      </div>
    </div>
  )
}

// Auth Status Row Component
function AuthStatusRow() {
  if (!isClerkConfigured()) {
    return (
      <StatusRow
        label="AUTH"
        value="DISABLED"
        active={false}
      />
    )
  }

  return (
    <>
      <SignedIn>
        <AuthStatusSignedIn />
      </SignedIn>
      <SignedOut>
        <StatusRow
          label="AUTH"
          value="SIGNED_OUT"
          active={false}
        />
      </SignedOut>
    </>
  )
}

function AuthStatusSignedIn() {
  const { user } = useUser()
  const { isLoaded } = useAuth()

  if (!isLoaded) {
    return (
      <StatusRow
        label="AUTH"
        value="LOADING..."
        active={false}
      />
    )
  }

  return (
    <StatusRow
      label="AUTH"
      value={user?.primaryEmailAddress?.emailAddress?.toUpperCase() || 'SIGNED_IN'}
      active={true}
    />
  )
}

// Decorative Components
function Star({
  size = 'md',
  className = '',
}: {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const sizeMap = { sm: 'text-xs', md: 'text-sm', lg: 'text-base' }
  return (
    <span className={`${sizeMap[size]} text-white/60 ${className}`}>+</span>
  )
}

function TerminalLabel({
  children,
  prefix = '',
  className = '',
}: {
  children: React.ReactNode
  prefix?: string
  className?: string
}) {
  return (
    <div className={`font-mono text-xs uppercase tracking-wider ${className}`}>
      {prefix && <span className="text-white/40">{prefix}</span>}
      <span className="text-white/60">{children}</span>
    </div>
  )
}

function StatusRow({
  label,
  value,
  active,
}: {
  label: string
  value: string
  active: boolean
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="font-mono text-xs text-white/50">{label}</span>
      <div className="flex items-center gap-2">
        <div
          className={`h-1.5 w-1.5 ${active ? 'bg-green-500' : 'bg-white/30'}`}
        />
        <span
          className={`font-mono text-xs ${active ? 'text-green-500' : 'text-white/40'}`}
        >
          {value}
        </span>
      </div>
    </div>
  )
}

function DecorativeCorner({ position }: { position: string }) {
  const positionClasses: Record<string, string> = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4 rotate-90',
    'bottom-left': 'bottom-4 left-4 -rotate-90',
    'bottom-right': 'bottom-4 right-4 rotate-180',
  }

  return (
    <div className={`absolute ${positionClasses[position]} text-white/20`}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M0 0 L12 0 L12 2 L2 2 L2 12 L0 12 Z" fill="currentColor" />
      </svg>
    </div>
  )
}

const features = [
  {
    title: 'GO_BACKEND',
    description:
      '>HIGH_PERFORMANCE API WITH ECHO FRAMEWORK, SQLC FOR TYPE_SAFE QUERIES',
  },
  {
    title: 'REACT_FRONTEND',
    description:
      '>REACT 19 + TANSTACK ROUTER + TANSTACK QUERY + TAILWIND CSS V4',
  },
  {
    title: 'SQLITE_DATABASE',
    description:
      '>SIMPLE, FAST, PORTABLE. ZERO_CONFIG REQUIRED FOR DEVELOPMENT',
  },
  {
    title: 'CLERK_AUTH',
    description:
      '>OPTIONAL PLUG_AND_PLAY AUTHENTICATION WITH SOCIAL_LOGINS',
  },
  {
    title: 'HOT_RELOAD',
    description:
      '>AIR FOR BACKEND, VITE FOR FRONTEND. INSTANT_FEEDBACK LOOP',
  },
  {
    title: 'DOCKER_READY',
    description:
      '>MULTI_STAGE DOCKERFILES FOR DEV AND PRODUCTION DEPLOYMENTS',
  },
]

export const Route = createFileRoute('/')(({
  component: HomePage,
}))
