import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { SignedIn, SignedOut, UserButton } from '@clerk/clerk-react'

import { useSetupAuth, isClerkConfigured } from '@/lib/clerk'

function RootComponent() {
  // Set up auth token getter for API calls
  if (isClerkConfigured()) {
    useSetupAuth()
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="text-xl font-bold text-gray-900 dark:text-white">
              Fastship
            </Link>
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white [&.active]:font-semibold [&.active]:text-gray-900 dark:[&.active]:text-white"
              >
                Home
              </Link>
              {/* Add more navigation links here */}
            </div>
          </div>

          {/* Auth buttons */}
          {isClerkConfigured() ? (
            <div className="flex items-center gap-4">
              <SignedOut>
                <Link
                  to="/auth/sign-in"
                  className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                >
                  Sign In
                </Link>
                <Link
                  to="/auth/sign-up"
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Sign Up
                </Link>
              </SignedOut>
              <SignedIn>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
            </div>
          ) : (
            <div className="text-sm text-gray-500">Auth disabled</div>
          )}
        </div>
      </nav>

      {/* Main content */}
      <main>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-8 dark:border-gray-800 dark:bg-gray-950">
        <div className="container text-center text-sm text-gray-500">
          Built with Fastship
        </div>
      </footer>

      {/* Dev tools (only in development) */}
      <TanStackRouterDevtools position="bottom-right" />
      <ReactQueryDevtools buttonPosition="bottom-left" />
    </div>
  )
}

export const Route = createRootRoute({
  component: RootComponent,
})
