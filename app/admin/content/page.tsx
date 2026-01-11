'use client'

import { useEffect, useState } from 'react'
import { apiFetch } from '@/lib/api'

type ContentItem = {
  key: string
  value: string
}

export default function ContentPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [content, setContent] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  useEffect(() => {
    fetchContent()
  }, [])

  const fetchContent = async () => {
    try {
      const data = await apiFetch('/content')
      setContent(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (key: string, value: string) => {
    setEditingKey(key)
    setEditValue(value)
  }

  const handleSave = async () => {
    if (!editingKey) return

    try {
      await apiFetch(`/content/${editingKey}`, {
        method: 'PUT',
        body: JSON.stringify({ value: editValue }),
      })

      // Update local state
      setContent(prev => ({ ...prev, [editingKey]: editValue }))
      setEditingKey(null)
    } catch (err) {
      alert('Failed to save')
      console.error(err)
    }
  }

  if (loading) return <div>Loading content...</div>

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Content Management</h1>
      </div>

      <div className="rounded-xl bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700">
              <tr>
                <th className="px-6 py-3">Key</th>
                <th className="px-6 py-3">Value</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(content).map(([key, value]) => (
                <tr key={key} className="border-b bg-white hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{key}</td>
                  <td className="max-w-md truncate px-6 py-4">{String(value)}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleEdit(key, String(value))}
                      className="font-medium text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Basic Modal */}
      {editingKey && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-lg rounded-lg bg-white p-6">
            <h2 className="mb-4 text-xl font-bold">Edit {editingKey}</h2>
            <textarea
              className="w-full rounded border p-3"
              rows={5}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
            />
            <div className="mt-4 flex justify-end space-x-3">
              <button
                onClick={() => setEditingKey(null)}
                className="rounded px-4 py-2 text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
