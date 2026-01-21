import { Outlet, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import { AuthSetup } from '@/lib/clerk'

function RootComponent() {
  return (
    <div className="min-h-screen bg-black">
      {/* Set up auth token getter for API calls */}
      <AuthSetup />

      {/* Main content */}
      <main>
        <Outlet />
      </main>

      {/* Dev tools (only in development) */}
      <TanStackRouterDevtools position="bottom-right" />
      <ReactQueryDevtools buttonPosition="bottom-left" />
    </div>
  )
}

export const Route = createRootRoute({
  component: RootComponent,
})
