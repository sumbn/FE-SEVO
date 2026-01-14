'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { useRouter } from 'next/navigation'
import { useTranslation } from '@/components/providers/I18nProvider'

export default function LoginPage() {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { login, user, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && user) {
      router.replace('/admin/content')
    }
  }, [user, isLoading, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await login(email, password)
      console.log('✅ Login successful')
      router.push('/admin/content')
    } catch (err: any) {
      console.error('❌ Login error:', err)
      setError(err.message || t('auth.login_failed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md text-gray-900">
        <h1 className="mb-6 text-center text-2xl font-bold">{t('auth.login_title')}</h1>
        {error && <div className="mb-4 rounded bg-red-100 p-3 text-red-700">{error}</div>}
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="mb-2 block text-sm font-bold text-gray-700">{t('auth.email')}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded border px-3 py-2 text-gray-900"
              required
              disabled={loading}
            />
          </div>
          <div className="mb-6">
            <label className="mb-2 block text-sm font-bold text-gray-700">{t('auth.password')}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded border px-3 py-2 text-gray-900"
              required
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            className="w-full rounded bg-blue-600 px-4 py-2 text-white font-bold hover:bg-blue-700 disabled:bg-gray-400"
            disabled={loading}
          >
            {loading ? t('auth.logging_in') : t('auth.login_button')}
          </button>
        </form>
        <div className="mt-4 text-center text-sm text-gray-600">
          <p>{t('auth.default_credentials')}</p>
          <p>Email: admin@sevo.com</p>
          <p>Password: admin123</p>
        </div>
      </div>
    </div>
  )
}
