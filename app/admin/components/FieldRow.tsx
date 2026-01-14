import React from 'react'

interface FieldRowProps {
  label: string
  rootKey: string
  fieldKey?: string
  type?: 'text' | 'list' | 'json' | 'boolean' | 'object'
  content: Record<string, any>
  handleEdit: (key: string, value: any, type: string) => void
  handleQuickToggle: (key: string, currentValue: any) => void
}

export const FieldRow = ({
  label,
  rootKey,
  fieldKey,
  type = 'text',
  content,
  handleEdit,
  handleQuickToggle
}: FieldRowProps) => {
  // Access value
  let value: any = ''
  try {
    const rootData = content[rootKey]
    const rootObj = typeof rootData === 'string' ? JSON.parse(rootData) : rootData

    if (fieldKey) {
      value = rootObj ? rootObj[fieldKey] : undefined
    } else {
      value = rootObj // direct access
    }
  } catch (e) {
    // console.warn("Failed to read value for", rootKey, fieldKey)
  }

  const isEmpty = value === undefined || value === null || value === ''

  // Preview logic
  let preview = String(value)
  if (typeof value === 'object') {
    preview = Array.isArray(value) ? `${value.length} items` : 'Object'
    if (Array.isArray(value) && value.length === 0) preview = '(Empty List)'
  }

  // Boolean specific preview
  if (type === 'boolean') {
    // Treat undefined/null/empty as false (default)
    const isTrue = value === true || value === 'true'
    preview = isTrue ? '✅ Enabled' : '❌ Disabled'
  }

  // Legacy string fallback for preview
  if (type === 'json' && typeof value === 'string') {
    preview = 'JSON String'
  }

  // Only show (Empty) if it's NOT a boolean type
  if (isEmpty && type !== 'boolean') preview = '(Empty)'

  const fullKey = fieldKey ? `${rootKey}.${fieldKey}` : rootKey

  // --- RENDER FOR BOOLEAN (TOGGLE CARD) ---
  if (type === 'boolean') {
    const isTrue = value === true || value === 'true'

    return (
      <div className="flex flex-col justify-between p-4 border border-gray-200 rounded-lg bg-gray-50/50 h-full relative">
        <div className="flex justify-between items-start">
          <p className="font-semibold text-gray-700 text-sm mb-1 pr-8">{label}</p>
          {/* Toggle Switch Top Right */}
          <div className="absolute top-4 right-4">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={isTrue}
                onChange={() => handleQuickToggle(fullKey, value)}
              />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        {/* Status Text (Optional, keeping it simple) */}
        <div className="mt-auto pt-2">
          <p className={`text-xs font-bold ${isTrue ? 'text-green-600' : 'text-gray-400'}`}>
            {isTrue ? 'ACTIVE' : 'INACTIVE'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-400 hover:shadow-sm transition-all bg-gray-50/50 group h-full">
      <div className="mb-3">
        <p className="font-semibold text-gray-700 text-sm mb-1">{label}</p>
      </div>

      <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between gap-3">
        <div className="text-xs text-gray-600 font-medium truncate flex-1 bg-white px-2 py-1 rounded border border-gray-100 min-h-[26px]">
          {preview}
        </div>
        <button
          onClick={() => handleEdit(fullKey, value, type)}
          className="shrink-0 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md transition-colors"
        >
          Edit
        </button>
      </div>
    </div>
  )
}
