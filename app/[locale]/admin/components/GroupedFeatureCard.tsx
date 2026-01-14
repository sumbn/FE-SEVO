import React from 'react'

interface Field {
  key: string
  label: string
  type?: 'text' | 'list' | 'json' | 'object'
}

interface GroupedFeatureCardProps {
  title: string
  rootKey: string
  toggleKey: string
  fields: Field[]
  content: Record<string, any>
  handleEdit: (key: string, value: any, type?: string) => void
  handleQuickToggle: (key: string, currentValue: any) => void
}

export const GroupedFeatureCard = ({
  title,
  rootKey,
  toggleKey,
  fields,
  content,
  handleEdit,
  handleQuickToggle
}: GroupedFeatureCardProps) => {
  // 1. Get Root Data
  let rootData: any = {}
  try {
    const rootStr = content[rootKey]
    rootData = typeof rootStr === 'string' ? JSON.parse(rootStr) : rootStr || {}
  } catch (e) { }

  const isEnabled = rootData[toggleKey] === true || rootData[toggleKey] === 'true'
  const fullToggleKey = `${rootKey}.${toggleKey}`

  return (
    <div className="flex flex-col p-4 border border-gray-200 rounded-lg bg-gray-50/50 h-full relative group hover:border-blue-400 transition-all">
      {/* Header: Title + Toggle */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="font-semibold text-gray-700 text-sm mb-1">{title}</p>
          <p className={`text-xs font-bold ${isEnabled ? 'text-green-600' : 'text-gray-400'}`}>
            {isEnabled ? 'ACTIVE' : 'INACTIVE'}
          </p>
        </div>

        <div className="relative inline-flex items-center cursor-pointer">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={isEnabled}
              onChange={() => handleQuickToggle(fullToggleKey, rootData[toggleKey])}
            />
            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>

      {/* Fields List */}
      <div className="mt-auto space-y-3 pt-3 border-t border-gray-200">
        {fields.map((f, idx) => {
          const val = rootData[f.key]
          let preview = String(val || '')
          if (typeof val === 'object') {
            preview = Array.isArray(val) ? `${val.length} items` : 'Object'
            if (Array.isArray(val) && val.length === 0) preview = '(Empty)'
          }
          if (!val) preview = '(Empty)'

          const fullFieldKey = `${rootKey}.${f.key}`

          return (
            <div key={idx} className="flex flex-col gap-1">
              <p className="text-xs font-semibold text-gray-500">{f.label}</p>
              <div className="flex items-center justify-between gap-2">
                <div className="text-xs text-gray-600 font-medium truncate flex-1 bg-white px-2 py-1 rounded border border-gray-100 h-[26px]">
                  {preview}
                </div>
                <button
                  onClick={() => handleEdit(fullFieldKey, val, f.type)}
                  className="shrink-0 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded transition-colors h-[26px] flex items-center"
                >
                  Edit
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
