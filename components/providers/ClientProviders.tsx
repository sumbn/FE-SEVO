'use client'

import { ErrorBoundary } from '@/components/ErrorBoundary'
import { AuthProvider } from '@/components/providers/AuthProvider'

/**
 * Client Providers Component
 * 
 * Wraps children with client-side providers including:
 * - ErrorBoundary for UI crash handling
 * - AuthProvider for authentication state
 */
export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary componentName="RootLayout">
      <AuthProvider>
        {children}
      </AuthProvider>
    </ErrorBoundary>
  )
}
