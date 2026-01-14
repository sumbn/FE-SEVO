'use client'

import { ErrorBoundary } from '@/components/ErrorBoundary'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { I18nProvider } from '@/components/providers/I18nProvider'

/**
 * Client Providers Component
 * 
 * Wraps children with client-side providers including:
 * - ErrorBoundary for UI crash handling
 * - AuthProvider for authentication state
 * - I18nProvider for translations
 */
export function ClientProviders({
  children,
  locale,
  dictionary
}: {
  children: React.ReactNode
  locale: string
  dictionary: any
}) {
  return (
    <ErrorBoundary componentName="RootLayout">
      <I18nProvider locale={locale} dictionary={dictionary}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </I18nProvider>
    </ErrorBoundary>
  )
}
