/**
 * Clerk configuration and utilities
 * This file provides helpers for working with Clerk authentication
 */

import { useAuth } from '@clerk/clerk-react'
import { useEffect } from 'react'
import { setAuthTokenGetter } from './api'

/**
 * Hook to set up the API auth token getter
 * Call this in your root component to enable authenticated API calls
 */
export function useSetupAuth() {
  const { getToken } = useAuth()

  useEffect(() => {
    setAuthTokenGetter(async () => {
      try {
        return await getToken()
      } catch {
        return null
      }
    })
  }, [getToken])
}

/**
 * Check if Clerk is configured
 */
export function isClerkConfigured(): boolean {
  return !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
}
