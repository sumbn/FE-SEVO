'use client'

import { useState } from 'react'
import { apiFetch } from '@/lib/api'
import { useTranslation } from './providers/I18nProvider'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function Contact({ content }: { content: any }) {
  const { t } = useTranslation()
  const [formData, setFormData] = useState({ parentName: '', phone: '', studentName: '', note: '' })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      await apiFetch('/leads', {
        method: 'POST',
        body: JSON.stringify(formData),
      })
      setMessage(t('contact.success'))
      setFormData({ parentName: '', phone: '', studentName: '', note: '' })
    } catch (err) {
      console.error(err)
      setMessage(t('contact.error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="py-10 md:py-12 my-4 md:my-6 mx-4 md:mx-8 lg:mx-16 bg-slate-900/40 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/10">
      <div className="container mx-auto px-4 md:px-6 max-w-5xl">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Left side - Text content */}
          <div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4 text-white">
              {t('contact.title')}
            </h2>
            <p className="text-white/80 mb-5 md:mb-6 text-sm md:text-base lg:text-lg leading-relaxed">
              {t('contact.subtitle')}
            </p>
            <ul className="space-y-3 md:space-y-4 text-white/90 text-sm md:text-base">
              <li className="flex items-center gap-3">
                <span className="w-5 h-5 md:w-6 md:h-6 bg-green-500/20 rounded-full flex items-center justify-center text-green-400 text-sm">✓</span>
                {t('contact.benefit_test')}
              </li>
              <li className="flex items-center gap-3">
                <span className="w-5 h-5 md:w-6 md:h-6 bg-green-500/20 rounded-full flex items-center justify-center text-green-400 text-sm">✓</span>
                {t('contact.benefit_trial')}
              </li>
              <li className="flex items-center gap-3">
                <span className="w-5 h-5 md:w-6 md:h-6 bg-green-500/20 rounded-full flex items-center justify-center text-green-400 text-sm">✓</span>
                {t('contact.benefit_support')}
              </li>
            </ul>
          </div>

          {/* Right side - Form */}
          <form onSubmit={handleSubmit} className="bg-black/20 backdrop-blur-md p-6 md:p-8 rounded-2xl shadow-xl border border-white/10">
            <h3 className="text-lg md:text-xl font-bold mb-5 md:mb-6 text-center text-white">{t('contact.form_title')}</h3>
            <div className="space-y-4 md:space-y-5">
              <div>
                <label className="block text-xs md:text-sm font-medium mb-2 text-blue-100">{t('contact.parent_name')}</label>
                <input
                  required
                  className="w-full border border-white/20 rounded-xl p-3 md:p-3.5 text-sm md:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white/5 text-white placeholder-white/30 transition-all hover:bg-white/10"
                  placeholder={t('contact.parent_name_placeholder')}
                  value={formData.parentName}
                  onChange={e => setFormData({ ...formData, parentName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs md:text-sm font-medium mb-2 text-blue-100">{t('contact.phone')}</label>
                <input
                  required
                  type="tel"
                  className="w-full border border-white/20 rounded-xl p-3 md:p-3.5 text-sm md:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white/5 text-white placeholder-white/30 transition-all hover:bg-white/10"
                  placeholder={t('contact.phone_placeholder')}
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs md:text-sm font-medium mb-2 text-blue-100">{t('contact.student_name')}</label>
                <input
                  className="w-full border border-white/20 rounded-xl p-3 md:p-3.5 text-sm md:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white/5 text-white placeholder-white/30 transition-all hover:bg-white/10"
                  placeholder={t('contact.student_name_placeholder')}
                  value={formData.studentName}
                  onChange={e => setFormData({ ...formData, studentName: e.target.value })}
                />
              </div>
              <button
                disabled={loading}
                className="w-full bg-gradient-to-r from-[var(--color-neon-purple)] to-[var(--color-neon-pink)] text-white font-bold py-3.5 md:py-4 text-sm md:text-base rounded-xl hover:shadow-[0_0_20px_rgba(188,19,254,0.5)] transition-all shadow-lg hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed border border-white/10"
              >
                {loading ? t('contact.submitting') : t('contact.submit')}
              </button>
              {message && (
                <p className={`text-center text-xs md:text-sm font-medium ${message.includes('thành công') ? 'text-green-400' : 'text-red-400'}`}>
                  {message}
                </p>
              )}
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}

