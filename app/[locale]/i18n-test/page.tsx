'use client'

import { useEffect, useState } from 'react'
import { apiFetch } from '@/lib/api'
import { useI18n } from '@/components/providers/I18nProvider'

export default function I18nTestPage() {
  const { locale } = useI18n()
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      // Calling content API which uses @I18nLang() in backend
      const result = await apiFetch('/content/global')
      setData(result)
    } catch (err: any) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  const triggerError = async () => {
    setLoading(true)
    setError(null)
    try {
      // Calling a non-existent endpoint to trigger 404 or backend validation error
      // Let's try to trigger a real validation error if possible, or just look at generic error
      await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: 'invalid', password: 'short' })
      })
    } catch (err: any) {
      setError({
        message: err.message,
        statusCode: err.statusCode,
        errorCode: err.errorCode
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [locale])

  return (
    <div className="container mx-auto p-8 pt-32 text-white">
      <h1 className="text-3xl font-bold mb-6">Language Sync Test</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass-panel p-6 border border-white/10 rounded-2xl">
          <h2 className="text-xl font-semibold mb-4 text-blue-400">Current State</h2>
          <div className="space-y-2">
            <p><span className="text-gray-400">Browser Locale (from URL):</span> <span className="font-mono bg-white/10 px-2 py-1 rounded">{locale}</span></p>
            <p><span className="text-gray-400">API Header sent:</span> <span className="font-mono text-green-400">Accept-Language: {locale}</span></p>
          </div>

          <div className="mt-6 flex flex-wrap gap-4">
            <button
              onClick={fetchData}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
            >
              Fetch Content
            </button>
            <button
              onClick={triggerError}
              disabled={loading}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
            >
              Trigger API Error
            </button>
          </div>
        </div>

        <div className="glass-panel p-6 border border-white/10 rounded-2xl min-h-[200px]">
          <h2 className="text-xl font-semibold mb-4 text-pink-400">Response / Error</h2>
          {loading && <p className="animate-pulse text-gray-500">Loading...</p>}

          {data && !loading && (
            <div className="space-y-2">
              <p className="text-green-400 font-bold">Success!</p>
              <pre className="bg-black/50 p-4 rounded text-xs overflow-auto max-h-[300px]">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          )}

          {error && !loading && (
            <div className="space-y-2">
              <p className="text-red-400 font-bold">Error Received:</p>
              <div className="bg-red-900/20 border border-red-500/30 p-4 rounded">
                <p className="text-sm"><span className="text-gray-400 font-bold">Status:</span> {error.statusCode}</p>
                <p className="text-sm"><span className="text-gray-400 font-bold">Message:</span> <span className="text-white">{error.message}</span></p>
                <p className="text-xs mt-2 text-gray-500 italic">This message should change when you switch language if the backend supports it for this error.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
