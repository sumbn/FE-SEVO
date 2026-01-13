'use client'

import { useState, useEffect } from 'react'
import { apiFetch } from '@/lib/api'

export default function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchLeads() {
      try {
        const data = await apiFetch('/leads', { requiresAuth: true })
        setLeads(data)
      } catch (err: any) {
        setError(err.message || 'Failed to fetch leads')
      } finally {
        setLoading(false)
      }
    }
    fetchLeads()
  }, [])

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await apiFetch(`/leads/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
        requiresAuth: true,
      })
      setLeads(leads.map(l => l.id === id ? { ...l, status: newStatus } : l))
    } catch (err: any) {
      alert(err.message || 'Cập nhật thất bại')
    }
  }

  if (loading) return <div className="p-8 text-center text-gray-900">Đang tải...</div>

  return (
    <div className="p-8 text-gray-900">
      <h1 className="mb-8 text-3xl font-bold">Quản lý Đăng ký (Leads)</h1>

      {error && <div className="mb-4 rounded-lg bg-red-100 p-4 text-red-700">{error}</div>}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Khách hàng</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Thông tin học viên</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Khóa học quan tâm</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Trạng thái</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Ngày đăng ký</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {leads.map((lead) => (
              <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold">{lead.parentName}</div>
                  <div className="text-sm text-blue-600 font-medium">📞 {lead.phone}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium">{lead.studentName || 'N/A'}</div>
                  <div className="text-xs text-gray-400">{lead.studentAge ? `${lead.studentAge} tuổi` : ''}</div>
                </td>
                <td className="px-6 py-4 text-sm">
                  {lead.courseId || 'Tư vấn chung'}
                </td>
                <td className="px-6 py-4">
                  <select
                    className={`rounded-full px-3 py-1 text-xs font-bold outline-none border-2 appearance-none cursor-pointer ${lead.status === 'new' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                        lead.status === 'contacted' ? 'bg-yellow-50 text-yellow-600 border-yellow-200' :
                          lead.status === 'converted' ? 'bg-green-50 text-green-600 border-green-200' :
                            'bg-gray-50 text-gray-600 border-gray-200'
                      }`}
                    value={lead.status}
                    onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                  >
                    <option value="new">MỚI</option>
                    <option value="contacted">ĐÃ LIÊN HỆ</option>
                    <option value="converted">THÀNH CÔNG</option>
                    <option value="closed">ĐÓNG</option>
                  </select>
                </td>
                <td className="px-6 py-4 text-sm text-gray-400">
                  {new Date(lead.createdAt).toLocaleDateString('vi-VN')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {leads.length === 0 && !error && (
          <div className="py-20 text-center text-gray-400">
            Chưa có khách hàng đăng ký nào.
          </div>
        )}
      </div>
    </div>
  )
}
