import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'

import { getHealth } from '@/lib/api'
import { Button } from '@/components/ui/Button'

function HomePage() {
  // Example: Fetch health status from backend
  const { data: health, isLoading, error } = useQuery({
    queryKey: ['health'],
    queryFn: getHealth,
  })

  return (
    <div className="container py-16">
      {/* Hero Section */}
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl dark:text-white">
          Welcome to Fastship
        </h1>
        <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-400">
          A production-ready fullstack boilerplate for rapid development. Start building your next
          great idea with Go, React, and modern tooling.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Button>Get Started</Button>
          <Button variant="outline">Learn More</Button>
        </div>
      </div>

      {/* Backend Status */}
      <div className="mt-16">
        <div className="mx-auto max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Backend Status</h2>
          {isLoading ? (
            <p className="mt-2 text-sm text-gray-500">Checking backend connection...</p>
          ) : error ? (
            <div className="mt-2">
              <p className="text-sm text-red-600">Failed to connect to backend</p>
              <p className="mt-1 text-xs text-gray-500">
                Make sure the backend is running on port 8080
              </p>
            </div>
          ) : (
            <div className="mt-2 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Server</span>
                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                  {health?.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Database</span>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    health?.database === 'connected'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  }`}
                >
                  {health?.database}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Features Grid */}
      <div className="mt-16">
        <h2 className="text-center text-2xl font-bold text-gray-900 dark:text-white">
          What&apos;s Included
        </h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const features = [
  {
    title: 'Go Backend',
    description: 'High-performance API with Echo framework, SQLC for type-safe queries, and Goose for migrations.',
  },
  {
    title: 'React Frontend',
    description: 'Modern React 19 with TanStack Router, TanStack Query, and Tailwind CSS v4.',
  },
  {
    title: 'SQLite Database',
    description: 'Simple, fast, and portable. Easy to switch to PostgreSQL or MySQL when needed.',
  },
  {
    title: 'Clerk Auth',
    description: 'Optional plug-and-play authentication with social logins and user management.',
  },
  {
    title: 'Hot Reload',
    description: 'Air for backend and Vite for frontend. Instant feedback during development.',
  },
  {
    title: 'Docker Ready',
    description: 'Multi-stage Dockerfiles for development and production deployments.',
  },
]

export const Route = createFileRoute('/')({
  component: HomePage,
})
