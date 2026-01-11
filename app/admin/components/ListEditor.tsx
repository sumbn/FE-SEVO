'use client'

import { useState, useMemo, useEffect } from 'react'

interface ListEditorProps {
  value: string
  onChange: (value: string) => void
}

interface ListItem {
  [key: string]: any
}

export function ListEditor({ value, onChange }: ListEditorProps) {
  // Internal state for immediate UI updates
  const [items, setItems] = useState<ListItem[]>([])
  const [error, setError] = useState<string | null>(null)

  // Sync internal state when prop value changes (e.g. initial load or parent reset)
  useEffect(() => {
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
      setItems([])
      setError('Invalid JSON format.')
    }
  }, [value])

  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editItem, setEditItem] = useState<ListItem>({})

  const updateParent = (newItems: ListItem[]) => {
    // Update local state immediately
    setItems(newItems)
    // Propagate to parent
    onChange(JSON.stringify(newItems))
  }

  const handleToggleVisible = (index: number) => {
    const newItems = [...items]
    const currentVis = newItems[index].visible !== false
    newItems[index] = { ...newItems[index], visible: !currentVis }
    updateParent(newItems)
  }

  const handleDelete = (index: number) => {
    // Removed confirm dialog temporarily to rule out browser blocking issues
    // if (confirm('Are you sure you want to delete this item?')) {
    const newItems = items.filter((_, i) => i !== index)
    updateParent(newItems)
    // }
  }

  const handleEdit = (index: number) => {
    setEditingIndex(index)
    setEditItem({ ...items[index] })
  }

  const handleAdd = () => {
    setEditingIndex(items.length) // Next index
    // Try to infer schema from previous item, or empty
    const template: ListItem = items.length > 0 ? { ...items[0] } : { title: '', description: '' }
    // Clear values
    Object.keys(template).forEach(k => template[k] = (typeof template[k] === 'boolean' ? true : ''))
    template.visible = true // Default to visible
    setEditItem(template)
  }

  const saveEdit = () => {
    if (editingIndex === null) return
    const newItems = [...items]
    if (editingIndex >= newItems.length) {
      newItems.push(editItem)
    } else {
      newItems[editingIndex] = editItem
    }
    updateParent(newItems)
    setEditingIndex(null)
  }

  const cancelEdit = () => {
    setEditingIndex(null)
  }

  const handleFieldChange = (key: string, val: string | boolean | number) => {
    setEditItem(prev => ({ ...prev, [key]: val }))
  }

  if (error) {
    return <div className="text-red-500 text-sm p-2 bg-red-50 rounded">{error}</div>
  }

  // Edit Mode
  if (editingIndex !== null) {
    return (
      <div className="space-y-4 p-4 border rounded bg-gray-50">
        <h3 className="font-bold text-lg">{editingIndex >= items.length ? 'Add Item' : 'Edit Item'}</h3>
        <div className="grid gap-4">
          {Object.keys(editItem).map(key => {
            if (key === 'visible') return null // Handle separately or ignore in main form
            const val = editItem[key]
            return (
              <div key={key}>
                <label className="block text-sm font-semibold mb-1 capitalize">{key}</label>
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
                  <input
                    className="w-full border rounded p-2"
                    value={val}
                    onChange={e => handleFieldChange(key, e.target.value)}
                  />
                )}
              </div>
            )
          })}
          {/* Fallback if object is empty (new list) */}
          {Object.keys(editItem).length === 0 && (
            <div className="text-sm text-gray-500">
              No fields detected. Add keys manually in JSON mode first if needed, or define schema.
              (Basic implementation assumes schema exists)
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={cancelEdit} className="px-4 py-2 rounded border hover:bg-gray-100">Cancel</button>
          <button onClick={saveEdit} className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Save Item</button>
        </div>
      </div>
    )
  }

  // List View
  return (
    <div className="space-y-3">
      {items.map((item, idx) => {
        const title = item.title || item.name || item.label || `Item ${idx + 1}`
        const isVisible = item.visible !== false

        return (
          <div key={`${idx}-${JSON.stringify(item)}`} className={`flex items-center justify-between p-3 border rounded ${isVisible ? 'bg-white' : 'bg-gray-100 opacity-75'}`}>
            <div className="flex items-center gap-3">
              <span className="font-medium">{title}</span>
              {!isVisible && <span className="text-xs bg-gray-200 px-2 py-1 rounded text-gray-600">Hidden</span>}
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
                onClick={(e) => {
                  e.preventDefault()
                  // console.log('Deleting index:', idx);
                  handleDelete(idx)
                }}
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
