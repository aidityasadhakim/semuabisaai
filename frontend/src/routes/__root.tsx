import { Outlet, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Agentation } from 'agentation'

import { AuthSetup } from '@/lib/clerk'

function RootComponent() {
  return (
    <div className="min-h-screen">
      {/* Set up auth token getter for API calls */}
      <AuthSetup />

      {/* Main content */}
      <main>
        <Outlet />
      </main>

      <footer className="site-footer page-width">
        Kontak: <a href="mailto:halo@semuabisaai.id">halo@semuabisaai.id</a>
      </footer>

      {/* Dev tools (only in development) */}
      <TanStackRouterDevtools position="bottom-right" />
      <ReactQueryDevtools buttonPosition="bottom-left" />
      {import.meta.env.DEV && <Agentation />}
    </div>
  )
}

export const Route = createRootRoute({
  component: RootComponent,
})
