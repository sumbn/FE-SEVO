'use client'

import { useEffect, useState } from 'react'
import { apiFetch } from '@/lib/api'
import { ListEditor } from '../components/ListEditor'

export default function ContentPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [content, setContent] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [editingType, setEditingType] = useState<string>('text')
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

  const handleEdit = (key: string, value: any, type: string = 'text') => {
    // If value is an object (array/dict), stringify it for the editor
    const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value === undefined || value === null ? '' : value)
    setEditingKey(key)
    setEditingType(type)

    // For boolean, if empty, default to 'false' string for editor state
    if (type === 'boolean' && stringValue === '') {
      setEditValue('false')
    } else {
      setEditValue(stringValue)
    }
  }

  const handleSave = async () => {
    if (!editingKey) return

    try {
      setIsSaving(true)

      // Determine if we are editing a nested key (e.g. "hero.title") or a root key ("homepage_layout")
      // Actually, all our new keys are nested in root objects (hero, about, global)
      // EXCEPT "homepage_layout".

      let rootKey = editingKey
      let subKey = null

      if (editingKey.includes('.')) {
        const parts = editingKey.split('.')
        rootKey = parts[0]
        subKey = parts[1]
      }

      // 1. Get current Root Object
      // Content API returns strings for values.
      let currentRootValue = content[rootKey]
      // If it looks like JSON, parse it.
      let rootObj: any = {}
      try {
        rootObj = JSON.parse(currentRootValue)
      } catch {
        rootObj = currentRootValue // Fallback if it's not JSON (unlikely for hero/about)
      }

      let finalValueToSave = editValue

      // 2. If it's a nested update, modify the object
      if (subKey) {
        // We need to know if the value being saved should be treated as string or JSON (array/obj)
        // Heuristic: If it parses as Array/Object, use that.
        // Or better: Checking specific keys isn't scalable.
        // Let's rely on JSON.parse check.
        let newValue = editValue
        try {
          const parsed = JSON.parse(editValue)
          if (typeof parsed === 'object' || Array.isArray(parsed)) {
            newValue = parsed
          }
        } catch { }

        // Convert string booleans to actual booleans
        if (newValue === 'true') {
          rootObj[subKey] = true
        } else if (newValue === 'false') {
          rootObj[subKey] = false
        } else {
          rootObj[subKey] = newValue
        }
        finalValueToSave = JSON.stringify(rootObj)
      }
      // 3. If it's a root key (like homepage_layout), just save the string.
      // But wait, content[rootKey] is expected to be a string in DB.

      await apiFetch(`/content/${rootKey}`, {
        method: 'PUT',
        body: JSON.stringify({ value: finalValueToSave }),
      })

      // Update local state
      // If nested, we update the ROOT key's value to the new stringified object
      setContent(prev => ({
        ...prev,
        [rootKey]: finalValueToSave
      }))

      setEditingKey(null)
    } catch (err) {
      alert('Failed to save')
      console.error(err)
    } finally {
      setIsSaving(false)
    }
  }

  // Quick toggle handler for boolean fields (direct save)
  const handleQuickToggle = async (key: string, currentValue: any) => {
    try {
      // Determine new value
      const isTrue = currentValue === true || currentValue === 'true'
      const newValue = isTrue ? 'false' : 'true' // Toggle

      // Same saving logic as handleSave but for a specific single-value update
      let rootKey = key
      let subKey = null

      if (key.includes('.')) {
        const parts = key.split('.')
        rootKey = parts[0]
        subKey = parts[1]
      }

      // 1. Get current Root Object
      let currentRootValue = content[rootKey]
      let rootObj: any = {}
      try {
        rootObj = JSON.parse(currentRootValue)
      } catch {
        rootObj = currentRootValue
      }

      let finalValueToSave = newValue

      // 2. If it's a nested update
      if (subKey) {
        // Convert string booleans to actual booleans
        if (newValue === 'true') {
          rootObj[subKey] = true
        } else if (newValue === 'false') {
          rootObj[subKey] = false
        } else {
          rootObj[subKey] = newValue
        }
        finalValueToSave = JSON.stringify(rootObj)
      }

      // 3. Update API
      await apiFetch(`/content/${rootKey}`, {
        method: 'PUT',
        body: JSON.stringify({ value: finalValueToSave }),
      })

      // 4. Update Local State
      setContent(prev => ({
        ...prev,
        [rootKey]: finalValueToSave
      }))

    } catch (err) {
      console.error("Quick toggle failed", err)
      alert("Failed to update status")
    }
  }

  if (loading) return <div>Loading content...</div>

  // Helper to parse layout
  let layout = []
  try {
    if (content.homepage_layout) {
      layout = JSON.parse(content.homepage_layout)
    }
  } catch (e) {
    console.error("Failed to parse layout", e)
  }

  // --- UI COMPONENTS ---

  const SectionCard = ({ title, description, children }: { title: string, description?: string, children: React.ReactNode }) => (
    <div className="mb-8 rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden">
      <div className="border-b border-gray-100 bg-gray-50 px-6 py-4">
        <h2 className="text-lg font-bold text-gray-800">{title}</h2>
        {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
      </div>
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {children}
      </div>
    </div>
  )

  const GroupedFeatureCard = ({
    title,
    rootKey,
    toggleKey,
    fields
  }: {
    title: string,
    rootKey: string,
    toggleKey: string,
    fields: { key: string, label: string, type?: 'text' | 'list' | 'json' }[]
  }) => {
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

  const FieldRow = ({ label, rootKey, fieldKey, type = 'text' }: { label: string, rootKey: string, fieldKey?: string, type?: 'text' | 'list' | 'json' | 'boolean' }) => {
    // Access value
    let value: any = ''
    try {
      const rootStr = content[rootKey]
      if (fieldKey) {
        const rootObj = JSON.parse(rootStr)
        value = rootObj[fieldKey]
      } else {
        value = rootStr // direct access
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

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Content Management</h1>
        <p className="text-gray-500 mt-2">Manage website content section by section.</p>
      </div>

      {/* 1. GLOBAL SETTINGS */}
      <SectionCard title="Global Settings" description="General website configuration, logo, and contact info.">
        <FieldRow label="Site Name" rootKey="global" fieldKey="site_name" />
        <FieldRow label="Logo Text" rootKey="global" fieldKey="logo_text" />
        <FieldRow label="Contact Information" rootKey="global" fieldKey="contact_info" type="list" />
      </SectionCard>

      {/* 2. DYNAMIC SECTIONS (Based on Layout) */}
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {layout.map((section: any, idx: number) => {
        // Hero Section
        if (section.type === 'Hero') {
          return (
            <SectionCard key={section.id || idx} title={`Hero Section (${section.id})`} description="Main introduction banner.">
              <FieldRow label="Title" rootKey="hero" fieldKey="title" />
              <FieldRow label="Subtitle" rootKey="hero" fieldKey="subtitle" />
              <FieldRow label="Call to Action Buttons" rootKey="hero" fieldKey="ctas" type="list" />
              <GroupedFeatureCard
                title="Trust Bar Configuration"
                rootKey="hero"
                toggleKey="showTrustBar"
                fields={[
                  { key: 'trustBarText', label: 'Bar Text', type: 'text' },
                  { key: 'trustBarLogos', label: 'Partner Logos', type: 'list' }
                ]}
              />

              <FieldRow label="Show Visual (Collage)" rootKey="hero" fieldKey="showVisual" type="boolean" />
            </SectionCard>
          )
        }

        // About Section
        if (section.type === 'About') {
          return (
            <SectionCard key={section.id || idx} title="About Section" description="Introduction content.">
              <FieldRow label="Headline" rootKey="about" fieldKey="title" />
              <FieldRow label="Description Text" rootKey="about" fieldKey="text" />
              <FieldRow label="Feature Cards (Mission/Vision)" rootKey="about" fieldKey="features" type="list" />
            </SectionCard>
          )
        }

        // Fallback
        return null
      })}

      {/* 3. ADVANCED / UNUSED KEYS */}
      <SectionCard title="Advanced Configuration" description="Layout structure.">
        <FieldRow label="Homepage Layout Structure" rootKey="homepage_layout" type="json" />
      </SectionCard>

      {/* Basic Modal (Kept same logic) */}
      {editingKey && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto transform transition-all">
            <h2 className="mb-1 text-xl font-bold text-gray-800">Edit {editingKey}</h2>
            <p className="mb-4 text-sm text-gray-500">Make changes to the content below.</p>

            {/* Conditional Rendering: ListEditor vs Textarea vs Boolean */}
            {(() => {
              // Use explicit type passed from FieldRow
              if (editingType === 'boolean') {
                return (
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={editValue === 'true'}
                        onChange={(e) => setEditValue(e.target.checked ? 'true' : 'false')}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      <span className="ml-3 text-sm font-medium text-gray-900">
                        {editValue === 'true' ? 'Enabled' : 'Disabled'}
                      </span>
                    </label>
                  </div>
                )
              }

              let isList = false
              try {
                const parsed = JSON.parse(editValue)
                if (Array.isArray(parsed)) isList = true
              } catch (e) {
                isList = false
              }

              if (isList) {
                return (
                  <ListEditor
                    value={editValue}
                    onChange={setEditValue}
                  />
                )
              }

              return (
                <textarea
                  className="w-full rounded-lg border-gray-300 border p-4 font-mono text-sm focus:border-blue-500 focus:ring-blue-500"
                  rows={8}
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                />
              )
            })()}

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setEditingKey(null)}
                className="rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-100 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:bg-blue-400 font-medium shadow-sm"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
