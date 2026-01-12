'use client'

import { useState } from 'react'
import { apiFetch } from '@/lib/api'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function Contact({ content }: { content: any }) {
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
      setMessage('Đăng ký thành công! Chúng tôi sẽ liên hệ lại sớm.')
      setFormData({ parentName: '', phone: '', studentName: '', note: '' })
    } catch (err) {
      console.error(err)
      setMessage('Có lỗi xảy ra, vui lòng thử lại sau.')
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
              Đăng ký tư vấn miễn phí
            </h2>
            <p className="text-white/80 mb-5 md:mb-6 text-sm md:text-base lg:text-lg leading-relaxed">
              Để lại thông tin để nhận tư vấn chi tiết về lộ trình học và ưu đãi mới nhất từ Sevo.
            </p>
            <ul className="space-y-3 md:space-y-4 text-white/90 text-sm md:text-base">
              <li className="flex items-center gap-3">
                <span className="w-5 h-5 md:w-6 md:h-6 bg-green-500/20 rounded-full flex items-center justify-center text-green-400 text-sm">✓</span>
                Kiểm tra năng lực đầu vào miễn phí
              </li>
              <li className="flex items-center gap-3">
                <span className="w-5 h-5 md:w-6 md:h-6 bg-green-500/20 rounded-full flex items-center justify-center text-green-400 text-sm">✓</span>
                Học thử 1 buổi trải nghiệm
              </li>
              <li className="flex items-center gap-3">
                <span className="w-5 h-5 md:w-6 md:h-6 bg-green-500/20 rounded-full flex items-center justify-center text-green-400 text-sm">✓</span>
                Cam kết hỗ trợ 1-1
              </li>
            </ul>
          </div>

          {/* Right side - Form */}
          <form onSubmit={handleSubmit} className="bg-black/20 backdrop-blur-md p-6 md:p-8 rounded-2xl shadow-xl border border-white/10">
            <h3 className="text-lg md:text-xl font-bold mb-5 md:mb-6 text-center text-white">Form Đăng Ký</h3>
            <div className="space-y-4 md:space-y-5">
              <div>
                <label className="block text-xs md:text-sm font-medium mb-2 text-blue-100">Họ tên phụ huynh *</label>
                <input
                  required
                  className="w-full border border-white/20 rounded-xl p-3 md:p-3.5 text-sm md:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white/5 text-white placeholder-white/30 transition-all hover:bg-white/10"
                  placeholder="Nhập họ tên"
                  value={formData.parentName}
                  onChange={e => setFormData({ ...formData, parentName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs md:text-sm font-medium mb-2 text-blue-100">Số điện thoại *</label>
                <input
                  required
                  type="tel"
                  className="w-full border border-white/20 rounded-xl p-3 md:p-3.5 text-sm md:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white/5 text-white placeholder-white/30 transition-all hover:bg-white/10"
                  placeholder="0xxx xxx xxx"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs md:text-sm font-medium mb-2 text-blue-100">Tên học viên (Tuổi)</label>
                <input
                  className="w-full border border-white/20 rounded-xl p-3 md:p-3.5 text-sm md:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white/5 text-white placeholder-white/30 transition-all hover:bg-white/10"
                  placeholder="Ví dụ: Bé Bi (8 tuổi)"
                  value={formData.studentName}
                  onChange={e => setFormData({ ...formData, studentName: e.target.value })}
                />
              </div>
              <button
                disabled={loading}
                className="w-full bg-gradient-to-r from-[var(--color-neon-purple)] to-[var(--color-neon-pink)] text-white font-bold py-3.5 md:py-4 text-sm md:text-base rounded-xl hover:shadow-[0_0_20px_rgba(188,19,254,0.5)] transition-all shadow-lg hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed border border-white/10"
              >
                {loading ? 'Đang gửi...' : 'Gửi đăng ký ngay'}
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

