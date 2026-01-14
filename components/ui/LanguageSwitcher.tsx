'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

const locales = [
  { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'en', label: 'English', flag: '🇺🇸' }
]

export default function LanguageSwitcher() {
  const pathname = usePathname()
  const router = useRouter()
  const [currentLocale, setCurrentLocale] = useState('vi')
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const segments = pathname.split('/')
    const locale = locales.find(l => l.code === segments[1])
    if (locale) {
      setCurrentLocale(locale.code)
    }
  }, [pathname])

  const toggleLanguage = (newLocale: string) => {
    if (newLocale === currentLocale) {
      setIsOpen(false)
      return
    }

    const segments = pathname.split('/')
    segments[1] = newLocale
    const newPath = segments.join('/')

    router.push(newPath)
    setIsOpen(false)
  }

  const activeLocale = locales.find(l => l.code === currentLocale) || locales[0]

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-panel hover:bg-white/10 transition-all duration-300 text-sm font-medium text-white border border-white/10"
      >
        <span>{activeLocale.flag}</span>
        <span className="uppercase">{activeLocale.code}</span>
        <svg
          className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-40 rounded-xl glass-panel border border-white/20 bg-black/60 backdrop-blur-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
            {locales.map((locale) => (
              <button
                key={locale.code}
                onClick={() => toggleLanguage(locale.code)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors duration-200 hover:bg-white/10 ${currentLocale === locale.code ? 'text-blue-400 bg-white/5' : 'text-white'
                  }`}
              >
                <span className="text-lg">{locale.flag}</span>
                <span className="text-sm font-medium">{locale.label}</span>
                {currentLocale === locale.code && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
