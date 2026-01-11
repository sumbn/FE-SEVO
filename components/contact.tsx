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
    <section className="bg-blue-600 py-16 text-white">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-4">Đăng ký tư vấn miễn phí</h2>
            <p className="text-blue-100 mb-6 text-lg">
              Để lại thông tin để nhận tư vấn chi tiết về lộ trình học và ưu đãi mới nhất từ Sevo.
            </p>
            <ul className="space-y-3 text-blue-100">
              <li className="flex items-center gap-2">✅ Kiểm tra năng lực đầu vào miễn phí</li>
              <li className="flex items-center gap-2">✅ Học thử 1 buổi trải nghiệm</li>
              <li className="flex items-center gap-2">✅ Cam kết hỗ trợ 1-1</li>
            </ul>
          </div>

          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-xl text-gray-800">
            <h3 className="text-xl font-bold mb-4 text-center">Form Đăng Ký</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Họ tên phụ huynh *</label>
                <input
                  required
                  className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.parentName}
                  onChange={e => setFormData({ ...formData, parentName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Số điện thoại *</label>
                <input
                  required
                  type="tel"
                  className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tên học viên (Tuổi)</label>
                <input
                  className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Ví dụ: Bé Bi (8 tuổi)"
                  value={formData.studentName}
                  onChange={e => setFormData({ ...formData, studentName: e.target.value })}
                />
              </div>
              <button
                disabled={loading}
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition disabled:opacity-70"
              >
                {loading ? 'Đang gửi...' : 'Gửi đăng ký ngay'}
              </button>
              {message && <p className={`text-center text-sm ${message.includes('thành công') ? 'text-green-600' : 'text-red-500'}`}>{message}</p>}
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}
