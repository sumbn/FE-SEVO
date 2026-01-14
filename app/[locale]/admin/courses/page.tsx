'use client'

import { useState, useEffect } from 'react'
import { apiFetch } from '@/lib/api'
import Link from 'next/link'
import { useAuth } from '@/components/providers/AuthProvider'

export default function CoursesPage() {
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { user } = useAuth()

  useEffect(() => {
    async function fetchCourses() {
      try {
        // Use the admin endpoint to see all courses (including drafts)
        const data = await apiFetch('/courses/admin', { requiresAuth: true })
        setCourses(data)
      } catch (err: any) {
        setError(err.message || 'Failed to fetch courses')
      } finally {
        setLoading(false)
      }
    }
    fetchCourses()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa khóa học này?')) return

    try {
      await apiFetch(`/courses/${id}`, {
        method: 'DELETE',
        requiresAuth: true
      })
      setCourses(courses.filter(c => c.id !== id))
    } catch (err: any) {
      alert(err.message || 'Xóa thất bại')
    }
  }

  if (loading) return <div className="p-8 text-center text-gray-900">Đang tải...</div>

  return (
    <div className="p-8 text-gray-900">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Quản lý Khóa học</h1>
        <Link
          href="/admin/courses/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition-colors"
        >
          + Thêm khóa học
        </Link>
      </div>

      {error && <div className="mb-4 rounded-lg bg-red-100 p-4 text-red-700">{error}</div>}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <div key={course.id} className="group relative rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
            <div className="mb-4 flex items-start justify-between">
              <span className={`rounded-full px-2 py-1 text-xs font-medium ${course.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                {course.status}
              </span>
              <div className="flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                <Link href={`/admin/courses/${course.id}`} className="text-gray-400 hover:text-blue-600">
                  ✏️
                </Link>
                <button onClick={() => handleDelete(course.id)} className="text-gray-400 hover:text-red-600">
                  🗑️
                </button>
              </div>
            </div>
            <h2 className="mb-2 text-xl font-bold">{course.title}</h2>
            <p className="mb-4 text-sm text-gray-500 line-clamp-2">{course.description}</p>
            <div className="flex flex-wrap gap-2 text-xs text-gray-400">
              <span className="rounded bg-gray-50 px-2 py-1">👥 {course.ageRange}</span>
              <span className="rounded bg-gray-50 px-2 py-1">⏱️ {course.duration}</span>
              <span className="rounded bg-gray-50 px-2 py-1">🔗 /{course.slug}</span>
            </div>
          </div>
        ))}
      </div>

      {courses.length === 0 && !error && (
        <div className="py-12 text-center text-gray-400 border-2 border-dashed border-gray-100 rounded-xl">
          Chưa có khóa học nào. Hãy bắt đầu tạo mới!
        </div>
      )}
    </div>
  )
}
