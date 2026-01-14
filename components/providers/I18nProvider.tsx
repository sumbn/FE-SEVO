'use client'

import React, { createContext, useContext } from 'react'

type Dictionary = { [key: string]: any }

interface I18nContextType {
  locale: string
  dictionary: Dictionary
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

export function I18nProvider({
  children,
  locale,
  dictionary
}: {
  children: React.ReactNode
  locale: string
  dictionary: Dictionary
}) {
  return (
    <I18nContext.Provider value={{ locale, dictionary }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}

/**
 * Helper to get a nested value from the dictionary using a dot-notated key
 * e.g., t('header.training')
 */
export function useTranslation() {
  const { dictionary } = useI18n()

  const t = (key: string, variables?: { [key: string]: string | number }) => {
    const keys = key.split('.')
    let value = dictionary

    for (const k of keys) {
      value = value?.[k]
    }

    if (typeof value !== 'string') {
      return key
    }

    if (variables) {
      Object.entries(variables).forEach(([name, val]) => {
        value = (value as unknown as string).replace(`{${name}}`, String(val)) as any
      })
    }

    return value as string
  }

  return { t }
}
