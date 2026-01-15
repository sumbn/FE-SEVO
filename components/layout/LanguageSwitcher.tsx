'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useI18n } from '@/components/providers/I18nProvider'

export function LanguageSwitcher() {
  const pathname = usePathname()
  const router = useRouter()
  const { locale } = useI18n()

  const toggleLanguage = () => {
    const newLocale = locale === 'vi' ? 'en' : 'vi'

    // Replace the locale prefix in the pathname
    const newPathname = pathname.replace(`/${locale}`, `/${newLocale}`)

    router.push(newPathname)
  }

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-white/10 rounded-md border border-white/20"
      aria-label="Switch language"
    >
      <span className={locale === 'en' ? 'text-blue-400' : 'text-gray-400'}>EN</span>
      <span className="text-gray-500">|</span>
      <span className={locale === 'vi' ? 'text-red-400' : 'text-gray-400'}>VI</span>
    </button>
  )
}
