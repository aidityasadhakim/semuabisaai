/**
 * Clerk configuration and utilities
 * This file provides helpers for working with Clerk authentication
 */

import { useAuth } from '@clerk/clerk-react'
import { useEffect } from 'react'
import { setAuthTokenGetter } from './api'

/**
 * Check if Clerk is configured
 */
export function isClerkConfigured(): boolean {
  return !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
}

/**
 * Internal hook that sets up auth token getter
 * Only use this when wrapped by ClerkProvider
 */
function useSetupAuthInternal() {
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
 * Component that sets up auth when Clerk is configured
 * Use this in your root component instead of calling a hook conditionally
 */
export function AuthSetup() {
  if (!isClerkConfigured()) {
    return null
  }
  // When Clerk is configured, render the internal setup component
  return <AuthSetupInternal />
}

/**
 * Internal component that uses the auth hook
 * This is only rendered when Clerk is configured
 */
function AuthSetupInternal() {
  useSetupAuthInternal()
  return null
}
