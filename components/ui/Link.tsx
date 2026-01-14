'use client'

import NextLink from 'next/link'
import { ComponentProps } from 'react'
import { useI18n } from '@/components/providers/I18nProvider'

export default function Link({ href, ...props }: ComponentProps<typeof NextLink>) {
  const { locale } = useI18n()

  const getLocalizedHref = (href: string | any) => {
    if (typeof href !== 'string') return href
    if (href.startsWith('http') || href.startsWith('#') || href.startsWith('tel:') || href.startsWith('mailto:')) {
      return href
    }

    // Remove leading slash for consistency
    const cleanHref = href.startsWith('/') ? href.slice(1) : href

    // Check if it already starts with a locale
    if (cleanHref.startsWith('en/') || cleanHref === 'en' || cleanHref.startsWith('vi/') || cleanHref === 'vi') {
      return href
    }

    return `/${locale}/${cleanHref}`
  }

  return <NextLink href={getLocalizedHref(href)} {...props} />
}
