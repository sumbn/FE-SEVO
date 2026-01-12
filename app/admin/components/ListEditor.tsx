'use client'

import { useState, useMemo, useEffect } from 'react'
import { apiFetch } from '@/lib/api'

interface ListEditorProps {
  value: string
  onChange: (value: string) => void
  template?: Record<string, any>
  folder?: string // Cloudinary folder name
}

interface ListItem {
  [key: string]: any
}

export function ListEditor({ value, onChange, template: customTemplate, folder = 'others' }: ListEditorProps) {
  // Internal state for immediate UI updates
  const [items, setItems] = useState<ListItem[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  // Sync internal state when prop value changes (e.g. initial load or parent reset)
  useEffect(() => {
    if (!value) {
      setItems([])
      setError(null)
      return
    }
    try {
      const parsed = JSON.parse(value)
      if (Array.isArray(parsed)) {
        setItems(parsed)
        setError(null)
      } else {
        setItems([])
        setError('Data is not an array.')
      }
    } catch (e) {
      // If it's not JSON, it's likely initial empty state or legacy string.
      // Default to empty array instead of showing error to the user.
      setItems([])
      setError(null)
    }
  }, [value])

  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  // Buffered state for the item currently being edited
  const [editItem, setEditItem] = useState<ListItem | null>(null)

  const updateParent = (newItems: ListItem[]) => {
    setItems(newItems)
    onChange(JSON.stringify(newItems))
  }

  const handleDeleteFromStorage = async (key: string) => {
    try {
      await apiFetch('/uploads', {
        method: 'DELETE',
        body: JSON.stringify({ key })
      })
      console.log(`[Storage] Deleted orphaned file: ${key}`)
    } catch (err) {
      console.error(`[Storage] Failed to delete orphaned file: ${key}`, err)
    }
  }

  const handleToggleVisible = (index: number) => {
    const newItems = [...items]
    const currentVis = newItems[index].visible !== false
    newItems[index] = { ...newItems[index], visible: !currentVis }
    updateParent(newItems)
  }

  const handleDelete = (index: number) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    const itemToDelete = items[index]
    Object.keys(itemToDelete).forEach(k => {
      const storageKey = itemToDelete[`${k}_key`]
      if (storageKey) {
        handleDeleteFromStorage(storageKey)
      }
    })

    const newItems = items.filter((_, i) => i !== index)
    updateParent(newItems)

    if (editingIndex === index) {
      setEditingIndex(null)
      setEditItem(null)
    }
  }

  const handleEdit = (index: number) => {
    setEditingIndex(index)
    setEditItem({ ...items[index] })
  }

  const handleAdd = () => {
    const newItem = customTemplate || { title: '', description: '' }
    setEditingIndex(items.length)
    setEditItem(newItem)
  }

  const handleClose = () => {
    // If we cancel, we must clean up any NEW images uploaded during this session
    // that are NOT in the original item.
    if (editItem && editingIndex !== null) {
      const originalItem = editingIndex < items.length ? items[editingIndex] : {}

      Object.keys(editItem).forEach(key => {
        if (key.endsWith('_key')) {
          const newKey = editItem[key]
          const oldKey = originalItem[key]
          // If this key is new (not in original), delete it
          if (newKey && newKey !== oldKey) {
            handleDeleteFromStorage(newKey)
          }
        }
      })
    }

    setEditingIndex(null)
    setEditItem(null)
  }

  const handleSaveItem = () => {
    if (editingIndex === null || !editItem) return

    // On save, we check if we replaced any OLD images.
    // If so, delete the OLD images.
    if (editingIndex < items.length) {
      const originalItem = items[editingIndex]
      Object.keys(originalItem).forEach(key => {
        if (key.endsWith('_key')) {
          const oldKey = originalItem[key]
          const newKey = editItem[key]
          // If we have a new key (or no key) and it differs from old, delete old
          if (oldKey && oldKey !== newKey) {
            handleDeleteFromStorage(oldKey)
          }
        }
      })
    }

    const newItems = [...items]
    if (editingIndex >= newItems.length) {
      newItems.push(editItem)
    } else {
      newItems[editingIndex] = editItem
    }
    updateParent(newItems)

    setEditingIndex(null)
    setEditItem(null)
  }

  const handleFieldChange = (key: string, val: string | boolean | number) => {
    if (!editItem || editingIndex === null) return

    setEditItem(prev => {
      if (!prev) return null
      const next = { ...prev, [key]: val }

      // If clearing a value that had a key, remove the storage key
      if (val === '') {
        // Set to undefined instead of delete to ensure React picks up the change
        next[`${key}_key`] = undefined as any
      }

      // Immediately sync to items array
      const newItems = [...items]
      if (editingIndex >= newItems.length) {
        newItems.push(next)
      } else {
        newItems[editingIndex] = next
      }
      updateParent(newItems)

      return next
    })
  }

  const handleFileUpload = async (key: string, file: File) => {
    if (!editItem) return

    try {
      setIsUploading(true)

      // We do NOT delete old key immediately. we wait for Save.
      // BUT if we already uploaded a NEW image in this session, we should delete THAT one.
      const currentSessionKey = editItem[`${key}_key`]
      const originalItem = editingIndex !== null && editingIndex < items.length ? items[editingIndex] : {}
      const originalKey = originalItem[`${key}_key`]

      // If the current key is NOT the original key, it means it's a temp upload. Delete it.
      if (currentSessionKey && currentSessionKey !== originalKey) {
        handleDeleteFromStorage(currentSessionKey)
      }

      const formData = new FormData()
      formData.append('file', file)

      const response = await apiFetch(`/uploads?folder=${folder}`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'undefined'
        } as any
      })

      setEditItem(prev => ({
        ...prev!,
        [key]: response.url,
        [`${key}_key`]: response.key
      }))

    } catch (err) {
      alert('Upload failed')
      console.error(err)
    } finally {
      setIsUploading(false)
    }
  }

  // Detect if field name suggests it's an image
  const isImageField = (key: string) => {
    const lowerKey = key.toLowerCase()
    return lowerKey === 'src' || lowerKey === 'logo' || lowerKey === 'url' || lowerKey === 'image' || lowerKey.includes('image') || lowerKey.includes('icon')
  }

  if (error) {
    return <div className="text-red-500 text-sm p-2 bg-red-50 rounded">{error}</div>
  }

  if (editingIndex !== null && editItem) {
    return (
      <div className="relative">
        {/* Transparent overlay to prevent clicking list view */}
        <div className="absolute inset-0 bg-transparent z-0" />

        {/* Edit Form */}
        <div className="relative z-10 border rounded-lg p-5 bg-white shadow-lg">
          <h3 className="font-bold text-lg mb-4">{editingIndex >= items.length ? 'Add New Item' : 'Edit Item'}</h3>

          <div className="grid gap-4">
            {Object.keys(editItem).map(key => {
              if (key === 'visible' || key.endsWith('_key')) return null
              const val = editItem[key]
              const isImg = isImageField(key)

              return (
                <div key={key} className="space-y-1">
                  <label className="block text-sm font-semibold capitalize">{key}</label>

                  {typeof val === 'boolean' ? (
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={val}
                        onChange={e => handleFieldChange(key, e.target.checked)}
                      />
                      {String(val)}
                    </label>
                  ) : (
                    <div className="space-y-2">
                      <input
                        className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        value={val}
                        onChange={e => handleFieldChange(key, e.target.value)}
                        placeholder={isImg ? "Image URL or upload below..." : ""}
                      />
                      {isImg && (
                        <div className="flex items-start gap-4 p-3 bg-white border rounded-lg shadow-sm">
                          {val ? (
                            <div className="relative w-24 h-24 border rounded overflow-hidden bg-gray-50 flex-shrink-0 group">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={val} alt="Preview" className="w-full h-full object-contain" />
                              <button
                                type="button"
                                onClick={() => handleFieldChange(key, '')}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-md"
                                title="Clear Image"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                              </button>
                            </div>
                          ) : (
                            <div className="w-24 h-24 border-2 border-dashed rounded flex flex-col items-center justify-center bg-gray-50 text-gray-400">
                              <span className="text-[10px] uppercase font-semibold">No Image</span>
                            </div>
                          )}
                          <div className="flex-1 space-y-2">
                            <label className="inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-md text-blue-700 text-xs font-bold cursor-pointer hover:bg-blue-100 transition-colors">
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                              {isUploading ? 'Uploading...' : 'Choose File'}
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                disabled={isUploading}
                                onChange={(e) => {
                                  const file = e.target.files?.[0]
                                  if (file) handleFileUpload(key, file)
                                }}
                              />
                            </label>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {items.map((item, idx) => {
        const title = item.title || item.name || item.label || `Item ${idx + 1}`
        const isVisible = item.visible !== false
        const logoUrl = item.src || item.logo || item.url || item.image

        return (
          <div key={`${idx}-${JSON.stringify(item)}`} className={`flex items-center justify-between p-3 border rounded ${isVisible ? 'bg-white' : 'bg-gray-100 opacity-75'}`}>
            <div className="flex items-center gap-3 overflow-hidden">
              {logoUrl && (
                <div className="w-8 h-8 rounded border bg-gray-50 flex-shrink-0 flex items-center justify-center overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={logoUrl} alt="" className="w-full h-full object-contain" />
                </div>
              )}
              <span className="font-medium truncate">{title}</span>
              {!isVisible && <span className="text-xs bg-gray-200 px-2 py-1 rounded text-gray-600 shrink-0">Hidden</span>}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); handleToggleVisible(idx) }}
                className={`text-sm px-2 py-1 rounded ${isVisible ? 'text-green-600 hover:bg-green-50' : 'text-gray-500 hover:bg-gray-200'}`}
                title="Toggle Visibility"
              >
                {isVisible ? 'On' : 'Off'}
              </button>
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); handleEdit(idx) }}
                className="text-sm px-2 py-1 rounded text-blue-600 hover:bg-blue-50"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); handleDelete(idx) }}
                className="text-sm px-2 py-1 rounded text-red-600 hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          </div>
        )
      })}

      <button
        type="button"
        onClick={(e) => { e.preventDefault(); handleAdd() }}
        className="w-full py-2 border-2 border-dashed border-gray-300 rounded text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors"
      >
        + Add New Item
      </button>
    </div>
  )
}
