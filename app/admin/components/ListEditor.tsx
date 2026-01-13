'use client'

import { useState, useMemo, useEffect } from 'react'
import { apiFetch } from '@/lib/api'

interface ListEditorProps {
  value: string
  onChange: (value: string) => void
  template?: Record<string, any>
  folder?: string // Cloudinary folder name
  maxItems?: number
  onPendingDeletes?: (keys: string[]) => void // Callback to notify parent of images to delete
}

interface ListItem {
  [key: string]: any
}

export function ListEditor({ value, onChange, template: customTemplate, folder = 'others', maxItems, onPendingDeletes }: ListEditorProps) {
  // Internal state for immediate UI updates
  const [items, setItems] = useState<ListItem[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  // Track images that need to be deleted from storage when parent saves
  const [deletedKeys, setDeletedKeys] = useState<string[]>([])

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
  // Track original state BEFORE editing. 
  // This is used to detect deleted images on Save or NEW images on Cancel.
  const [originalEditItem, setOriginalEditItem] = useState<ListItem | null>(null)

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
    const original = { ...items[index] }
    setEditItem(original)
    setOriginalEditItem(original)
  }

  const handleAdd = () => {
    const newItem = customTemplate || { title: '', description: '' }
    setEditingIndex(items.length)
    setEditItem(newItem)
    setOriginalEditItem(null) // New item has no "original" images
  }

  const handleClose = () => {
    // If we cancel, we must clean up any NEW images uploaded during this session
    // that are NOT in the original item.
    if (editItem && editingIndex !== null) {
      // Use originalEditItem instead of items[editingIndex] because items might have been
      // updated by "Live Editing" via updateParent.
      const original = originalEditItem || {}

      Object.keys(editItem).forEach(key => {
        if (key.endsWith('_key')) {
          const newKey = editItem[key]
          const oldKey = original[key]
          // If this key is new (not in original), delete it
          if (newKey && newKey !== oldKey) {
            handleDeleteFromStorage(newKey)
          }
        }
      })
    }

    // Clear pending deletions since we're canceling
    setDeletedKeys([])
    if (onPendingDeletes) {
      onPendingDeletes([])
    }

    setEditingIndex(null)
    setEditItem(null)
    setOriginalEditItem(null)
  }

  const handleSaveItem = () => {
    if (editingIndex === null || !editItem) return

    // On save, we check if we replaced any OLD images or if images were CLEARED.
    // Use originalEditItem for comparison.
    if (originalEditItem) {
      Object.keys(originalEditItem).forEach(key => {
        if (key.endsWith('_key')) {
          const fieldName = key.replace('_key', '')
          const oldKey = originalEditItem[key]
          const newKey = editItem[key]
          const newUrl = editItem[fieldName]

          // Delete if:
          // 1. Key changed (image was replaced)
          // 2. URL is empty but key still exists (image was cleared)
          if (oldKey && (oldKey !== newKey || !newUrl)) {
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
    setOriginalEditItem(null)
  }

  const handleFieldChange = (key: string, val: string | boolean | number) => {
    if (!editItem || editingIndex === null) return

    // Check if this is clearing an image field
    if (isImageField(key) && val === '' && editItem[key]) {
      // User is clearing an existing image
      const keyField = `${key}_key`
      const oldKey = editItem[keyField]

      // If there's an old key, mark it for deletion
      if (oldKey) {
        setDeletedKeys(prev => {
          const updated = [...prev, oldKey]
          // Notify parent of pending deletions
          if (onPendingDeletes) {
            onPendingDeletes(updated)
          }
          return updated
        })
      }
    }

    const next = { ...editItem, [key]: val }

    // Update local buffered state
    setEditItem(next)

    // Immediately sync to items array (Live Editing)
    const newItems = [...items]
    if (editingIndex >= newItems.length) {
      newItems.push(next)
    } else {
      newItems[editingIndex] = next
    }
    updateParent(newItems)
  }

  const handleFileUpload = async (key: string, file: File) => {
    if (!editItem) return

    try {
      setIsUploading(true)

      // Track the old key for deletion
      const currentSessionKey = editItem[`${key}_key`]
      const original = originalEditItem || {}
      const originalKey = original[`${key}_key`]

      // If replacing an existing image, mark old key for deletion
      if (currentSessionKey) {
        if (currentSessionKey !== originalKey) {
          // Delete temp upload immediately
          handleDeleteFromStorage(currentSessionKey)
        } else if (originalKey) {
          // Mark original image for deletion when parent saves
          setDeletedKeys(prev => {
            const updated = [...prev, originalKey]
            if (onPendingDeletes) {
              onPendingDeletes(updated)
            }
            return updated
          })
        }
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

      const next = {
        ...editItem!,
        [key]: response.url,
        [`${key}_key`]: response.key
      }
      setEditItem(next)

      // Immediately sync to items array (Live Editing)
      const newItems = [...items]
      if (editingIndex !== null) {
        if (editingIndex >= newItems.length) {
          newItems.push(next)
        } else {
          newItems[editingIndex] = next
        }
        updateParent(newItems)
      }

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
    // Explicitly exclude 'icon' because we want to use string-based icons (lucide)
    if (lowerKey === 'icon') return false
    return lowerKey === 'src' || lowerKey === 'logo' || lowerKey === 'url' || lowerKey === 'image' || lowerKey.includes('image')
  }

  // Define supported icons for the dropdown
  const SUPPORTED_ICONS = [
    { label: 'Mail', value: 'envelope' },
    { label: 'Phone', value: 'phone' },
    { label: 'Address', value: 'map-marker' },
    { label: 'Facebook', value: 'facebook' },
    { label: 'Instagram', value: 'instagram' },
    { label: 'Link', value: 'link' },
    { label: 'Globe', value: 'globe' },
  ]

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
                  <label className="block text-sm font-semibold capitalize text-gray-700">{key}</label>

                  {typeof val === 'boolean' ? (
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={val}
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        onChange={e => handleFieldChange(key, e.target.checked)}
                      />
                      <span className="text-sm text-gray-600 font-medium">{val ? 'Enabled' : 'Disabled'}</span>
                    </label>
                  ) : key.toLowerCase() === 'icon' ? (
                    <select
                      className="w-full border rounded-lg p-2.5 text-sm bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all border-gray-300"
                      value={val || ''}
                      onChange={e => handleFieldChange(key, e.target.value)}
                    >
                      <option value="">-- Select Icon --</option>
                      {SUPPORTED_ICONS.map(icon => (
                        <option key={icon.value} value={icon.value}>{icon.label}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="space-y-2">
                      <input
                        className="w-full border rounded-lg p-2.5 text-sm bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all border-gray-300"
                        value={val || ''}
                        onChange={e => handleFieldChange(key, e.target.value)}
                        placeholder={isImg ? "Image URL or upload below..." : `Enter ${key}...`}
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

      {(!maxItems || items.length < maxItems) && (
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); handleAdd() }}
          className="w-full py-2 border-2 border-dashed border-gray-300 rounded text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors"
        >
          + Add New Item
        </button>
      )}
    </div>
  )
}
