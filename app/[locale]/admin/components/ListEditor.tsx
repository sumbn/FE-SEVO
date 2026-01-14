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
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null)

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
  const getStorageKeysRecursive = (obj: any): string[] => {
    const keys: string[] = []
    if (!obj || typeof obj !== 'object') return keys

    if (Array.isArray(obj)) {
      obj.forEach(item => keys.push(...getStorageKeysRecursive(item)))
    } else {
      Object.keys(obj).forEach(k => {
        if (k.endsWith('_key') && obj[k]) {
          keys.push(obj[k])
        } else if (typeof obj[k] === 'object') {
          keys.push(...getStorageKeysRecursive(obj[k]))
        }
      })
    }
    return keys
  }

  // --- DRAG AND DROP HANDLERS ---
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggingIndex(index)
    e.dataTransfer.effectAllowed = 'move'
    // Optional: add a class for styling while dragging
    const target = e.currentTarget as HTMLElement
    target.style.opacity = '0.4'
  }

  const handleDragEnd = (e: React.DragEvent) => {
    const target = e.currentTarget as HTMLElement
    target.style.opacity = '1'
    setDraggingIndex(null)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggingIndex === null || draggingIndex === index) return
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    if (draggingIndex === null || draggingIndex === dropIndex) return

    const newItems = [...items]
    const draggedItem = newItems[draggingIndex]

    // Move item
    newItems.splice(draggingIndex, 1)
    newItems.splice(dropIndex, 0, draggedItem)

    updateParent(newItems)
    setDraggingIndex(null)
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
    const keysToDelete = getStorageKeysRecursive(itemToDelete)
    keysToDelete.forEach(key => handleDeleteFromStorage(key))

    const newItems = items.filter((_, i) => i !== index)
    updateParent(newItems)

    if (editingIndex === index) {
      setEditingIndex(null)
      setEditItem(null)
    }
  }

  const handleEdit = (index: number) => {
    setEditingIndex(index)
    // Merge existing item with template to ensure all fields are present
    const original = { ...(customTemplate || {}), ...items[index] }
    setEditItem(original)
    setOriginalEditItem(original)
  }

  const handleAdd = () => {
    let newItem: ListItem | null = customTemplate ? { ...customTemplate } : null

    // If no template, try to infer from first existing item
    if (!newItem && items.length > 0) {
      const sample = items[0]
      newItem = {}
      Object.keys(sample).forEach(key => {
        if (key === 'visible' || key.endsWith('_key')) return
        const val = sample[key]
        if (Array.isArray(val)) newItem![key] = []
        else if (typeof val === 'boolean') newItem![key] = true
        else if (typeof val === 'number') newItem![key] = 0
        else newItem![key] = ''
      })
    }

    // Absolute fallback
    if (!newItem) {
      newItem = { title: '', description: '' }
    } else {
      // If we used a template, we want empty arrays for fields that are lists,
      // but we want to keep the keys so the form knows they are lists.
      Object.keys(newItem).forEach(key => {
        if (Array.isArray(newItem![key])) {
          newItem![key] = []
        }
      })
    }

    setEditingIndex(items.length)
    setEditItem(newItem)
    setOriginalEditItem(null) // New item has no "original" images
  }

  const handleClose = () => {
    // If we cancel, we must clean up any NEW images uploaded during this session
    // that are NOT in the original item.
    if (editItem && editingIndex !== null) {
      const original = originalEditItem || {}
      const currentKeys = getStorageKeysRecursive(editItem)
      const originalKeys = getStorageKeysRecursive(original)

      // Delete keys that are in current but not in original
      currentKeys.forEach(key => {
        if (!originalKeys.includes(key)) {
          handleDeleteFromStorage(key)
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

    // Update local buffered state only
    setEditItem(next)
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

  // Detect if field is a list (array of objects)
  const isListField = (val: any) => {
    return Array.isArray(val)
  }

  // Define supported icons for the dropdown
  const SUPPORTED_ICONS = [
    { label: 'Mail', value: 'envelope' },
    { label: 'Phone', value: 'phone' },
    { label: 'Address', value: 'map-marker' },
    { label: 'Facebook', value: 'facebook' },
    { label: 'Instagram', value: 'instagram' },
    { label: 'Link', value: 'link' },
    { label: 'Globe', value: 'globe' }
  ]

  // Define predefined options for specific fields
  const FIELD_OPTIONS: Record<string, { label: string, value: string }[]> = {
    type: [
      { label: 'Normal Link', value: 'link' },
      { label: 'Dropdown Menu', value: 'dropdown' }
    ],
    variant: [
      { label: 'Primary (Solid)', value: 'primary' },
      { label: 'Glass (Transparent)', value: 'glass' },
      { label: 'Outline', value: 'outline' }
    ],
    color: [
      { label: 'Neon Blue', value: 'neon-blue' },
      { label: 'Neon Pink', value: 'neon-pink' },
      { label: 'Cyan', value: 'cyan' },
      { label: 'Indigo', value: 'indigo' }
    ]
  }

  if (error) {
    return <div className="text-red-500 text-sm p-2 bg-red-50 rounded">{error}</div>
  }

  if (editingIndex !== null && editItem) {
    return (
      <div className="fixed inset-0 bg-[#050b14]/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
        {/* Edit Form Card */}
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] flex flex-col max-h-[90vh] overflow-hidden border border-white/10 scale-in-center">

          {/* Header */}
          <div className="px-8 py-5 border-b bg-gray-50/50 flex items-center justify-between">
            <div className="flex flex-col">
              <h3 className="font-bold text-xl text-gray-800 tracking-tight">
                {editingIndex >= items.length ? 'Add New Item' : 'Edit Item'}
              </h3>
              {customTemplate && <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Configuration Mode</div>}
            </div>
            <button onClick={handleClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
            <div className="grid gap-6">
              {(() => {
                // Union of keys from template and current item to ensure consistency
                const templateKeys = customTemplate ? Object.keys(customTemplate) : []
                const itemKeys = Object.keys(editItem)
                const allKeys = Array.from(new Set([...templateKeys, ...itemKeys]))

                return allKeys.map(key => {
                  if (key === 'visible' || key.endsWith('_key')) return null
                  const val = editItem[key] !== undefined ? editItem[key] : (customTemplate ? customTemplate[key] : '')
                  const isImg = isImageField(key)

                  // Sub-template for nested lists
                  const subTemplate = (customTemplate && Array.isArray(customTemplate[key]) && customTemplate[key].length > 0)
                    ? customTemplate[key][0]
                    : undefined

                  return (
                    <div key={key} className="space-y-2">
                      <label className="block text-xs font-black uppercase tracking-widest text-gray-500">{key}</label>

                      {typeof val === 'boolean' ? (
                        <label className="inline-flex items-center gap-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={val}
                            className="w-5 h-5 text-blue-600 rounded-lg border-gray-300 focus:ring-blue-500 transition-all"
                            onChange={e => handleFieldChange(key, e.target.checked)}
                          />
                          <span className="text-sm font-bold text-gray-700 group-hover:text-blue-600 transition-colors">{val ? 'Active' : 'Hidden'}</span>
                        </label>
                      ) : key.toLowerCase() === 'icon' ? (
                        <select
                          className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm bg-gray-50/50 focus:ring-4 focus:ring-blue-500/10 focus:bg-white focus:border-blue-500 outline-none transition-all font-medium"
                          value={val || ''}
                          onChange={e => handleFieldChange(key, e.target.value)}
                        >
                          <option value="">-- Select Icon --</option>
                          {SUPPORTED_ICONS.map(icon => (
                            <option key={icon.value} value={icon.value}>{icon.label}</option>
                          ))}
                        </select>
                      ) : FIELD_OPTIONS[key.toLowerCase()] ? (
                        <select
                          className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm bg-gray-50/50 focus:ring-4 focus:ring-blue-500/10 focus:bg-white focus:border-blue-500 outline-none transition-all font-medium"
                          value={val || ''}
                          onChange={e => handleFieldChange(key, e.target.value)}
                        >
                          <option value="">-- Select {key} --</option>
                          {FIELD_OPTIONS[key.toLowerCase()].map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      ) : isListField(val) ? (
                        <div className="border-2 border-dashed border-gray-100 rounded-xl p-4 bg-gray-50/30">
                          <ListEditor
                            value={JSON.stringify(val || [])}
                            onChange={(newVal) => handleFieldChange(key, JSON.parse(newVal))}
                            folder={folder}
                            template={subTemplate}
                          />
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <input
                            className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm bg-gray-50/50 focus:ring-4 focus:ring-blue-500/10 focus:bg-white focus:border-blue-500 outline-none transition-all font-medium"
                            value={val || ''}
                            onChange={e => handleFieldChange(key, e.target.value)}
                            placeholder={isImg ? "Image URL or upload..." : `Enter ${key}...`}
                          />
                          {isImg && (
                            <div className="flex items-center gap-4 p-4 bg-gray-50/50 border-2 border-gray-100 rounded-xl">
                              {val ? (
                                <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-white border border-gray-200 group flex-shrink-0">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={val} alt="Preview" className="w-full h-full object-contain" />
                                  <button
                                    type="button"
                                    onClick={() => handleFieldChange(key, '')}
                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                  >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                                  </button>
                                </div>
                              ) : (
                                <div className="w-20 h-20 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center bg-white text-gray-300 flex-shrink-0">
                                  <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                </div>
                              )}
                              <div className="flex-1">
                                <label className="inline-flex items-center px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 text-xs font-black uppercase tracking-wider cursor-pointer hover:bg-gray-50 shadow-sm transition-all hover:border-gray-300">
                                  <svg className="w-3.5 h-3.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                  {isUploading ? 'Uploading...' : 'Upload Image'}
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
                })
              })()}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-8 py-5 border-t bg-gray-50 flex justify-end items-center gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveItem}
              className="px-8 py-2.5 text-sm font-black text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-[0_10px_20px_-5px_rgba(37,99,235,0.4)] hover:shadow-[0_15px_25px_-5px_rgba(37,99,235,0.5)] transition-all flex items-center gap-2 transform active:scale-95"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
              Confirm & Save
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {items.map((item, idx) => (
        <div
          key={idx}
          draggable
          onDragStart={(e) => handleDragStart(e, idx)}
          onDragEnd={handleDragEnd}
          onDragOver={(e) => handleDragOver(e, idx)}
          onDrop={(e) => handleDrop(e, idx)}
          className={`group flex items-center justify-between gap-4 p-4 bg-white border rounded-xl transition-all hover:border-blue-300 hover:shadow-md ${draggingIndex === idx ? 'opacity-40 border-dashed border-blue-500' : 'border-gray-200'}`}
        >
          {/* Drag Handle */}
          <div className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-blue-500 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8h16M4 16h16"></path>
            </svg>
          </div>

          <div className="flex-grow min-w-0">
            <div className="flex items-center gap-3">
              <p className="font-bold text-gray-800 truncate">
                {item.label || item.title || `Item ${idx + 1}`}
              </p>
              {item.items && (
                <span className="px-2 py-0.5 bg-blue-50 text-[10px] font-black text-blue-600 rounded uppercase">
                  {item.items.length} Items
                </span>
              )}
            </div>
            {item.href && <p className="text-xs text-gray-400 truncate">{item.href}</p>}
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <button
              onClick={() => handleToggleVisible(idx)}
              className={`text-xs font-bold transition-colors ${item.visible !== false ? 'text-green-500 hover:text-green-600' : 'text-gray-300 hover:text-gray-400'}`}
            >
              {item.visible !== false ? 'On' : 'Off'}
            </button>
            <button
              onClick={() => handleEdit(idx)}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(idx)}
              className="text-xs font-bold text-red-400 hover:text-red-600 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      ))}

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
