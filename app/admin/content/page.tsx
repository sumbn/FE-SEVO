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

  const handleEdit = (key: string, value: any) => {
    // If value is an object (array/dict), stringify it for the editor
    const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value || '')
    setEditingKey(key)
    setEditValue(stringValue)
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

        rootObj[subKey] = newValue
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

  const FieldRow = ({ label, rootKey, fieldKey, type = 'text' }: { label: string, rootKey: string, fieldKey?: string, type?: 'text' | 'list' | 'json' }) => {
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

    // Legacy string fallback for preview
    if (type === 'json' && typeof value === 'string') {
      preview = 'JSON String'
    }

    if (isEmpty) preview = '(Empty)'

    const fullKey = fieldKey ? `${rootKey}.${fieldKey}` : rootKey

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
            onClick={() => handleEdit(fullKey, value)}
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
            <h2 className="mb-1 text-xl font-bold text-gray-900">Edit {editingKey}</h2>
            <p className="mb-4 text-sm text-gray-500">Make changes to the content below.</p>

            {/* Conditional Rendering: ListEditor vs Textarea */}
            {(() => {
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
