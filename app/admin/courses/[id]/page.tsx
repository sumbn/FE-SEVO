'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { apiFetch } from '@/lib/api'
import Link from 'next/link'

export default function CourseEditorPage() {
  const { id } = useParams()
  const router = useRouter()
  const isNew = id === 'new'

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    ageRange: '',
    duration: '',
    status: 'DRAFT',
  })
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isNew) {
      async function fetchCourse() {
        try {
          // Note: Backend findOne uses slug, but we might want to find by ID in admin
          // For now, let's assume we can fetch by ID or slug. 
          // If our backend only has findBySlug, we'll need to use that.
          // Let's assume we implement GET /courses/admin/:id
          const courses = await apiFetch('/courses/admin', { requiresAuth: true })
          const course = courses.find((c: any) => c.id === id)
          if (course) {
            setFormData({
              title: course.title,
              slug: course.slug,
              description: course.description || '',
              ageRange: course.ageRange || '',
              duration: course.duration || '',
              status: course.status,
            })
          } else {
            setError('Không tìm thấy khóa học')
          }
        } catch (err: any) {
          setError(err.message || 'Lỗi tải dữ liệu')
        } finally {
          setLoading(false)
        }
      }
      fetchCourse()
    }
  }, [id, isNew])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      if (isNew) {
        await apiFetch('/courses', {
          method: 'POST',
          body: JSON.stringify(formData),
          requiresAuth: true,
        })
      } else {
        await apiFetch(`/courses/${id}`, {
          method: 'PUT',
          body: JSON.stringify(formData),
          requiresAuth: true,
        })
      }
      router.push('/admin/courses')
    } catch (err: any) {
      setError(err.message || 'Lỗi lưu dữ liệu')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-8 text-center text-gray-900">Đang tải...</div>

  return (
    <div className="max-w-4xl p-8 text-gray-900">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Link href="/admin/courses" className="text-sm text-blue-600 hover:underline">← Quay lại danh sách</Link>
          <h1 className="mt-2 text-3xl font-bold">{isNew ? 'Thêm khóa học mới' : 'Chỉnh sửa khóa học'}</h1>
        </div>
      </div>

      {error && <div className="mb-6 rounded-lg bg-red-100 p-4 text-red-700">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-semibold">Tên khóa học</label>
            <input
              type="text"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ví dụ: Lập trình Scratch cơ bản"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold">Slug (Đường dẫn)</label>
            <input
              type="text"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/ /g, '-') })}
              placeholder="scratch-co-ban"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold">Mô tả khóa học</label>
          <textarea
            rows={4}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Mô tả nội dung khóa học, kiến thức đạt được..."
          />
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="space-y-2">
            <label className="text-sm font-semibold">Độ tuổi</label>
            <input
              type="text"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
              value={formData.ageRange}
              onChange={(e) => setFormData({ ...formData, ageRange: e.target.value })}
              placeholder="6-12 tuổi"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold">Thời lượng</label>
            <input
              type="text"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              placeholder="12 buổi"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold">Trạng thái</label>
            <select
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="DRAFT">Draft (Nháp)</option>
              <option value="PUBLISHED">Published (Công khai)</option>
              <option value="ARCHIVED">Archived (Lưu trữ)</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <Link
            href="/admin/courses"
            className="rounded-lg px-6 py-2 font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Hủy
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-blue-600 px-8 py-2 font-bold text-white shadow-md hover:bg-blue-700 disabled:bg-gray-400 transition-all active:scale-95"
          >
            {saving ? 'Đang lưu...' : 'Lưu khóa học'}
          </button>
        </div>
      </form>
    </div>
  )
}
