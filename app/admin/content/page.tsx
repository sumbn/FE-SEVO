'use client'

import { useEffect, useState } from 'react'
import { apiFetch } from '@/lib/api'
import { ListEditor } from '../components/ListEditor'
import { GlobalSettings } from './sections/GlobalSettings'
import { NavigationSettings } from './sections/NavigationSettings'
import { HeroSettings } from './sections/HeroSettings'
import { AboutSettings } from './sections/AboutSettings'
import { FieldRow } from '../components/FieldRow'
import { SectionCard } from '../components/SectionCard'

const ITEM_TEMPLATES: Record<string, any> = {
  'hero.trustBarLogos': { alt: '', src: '' },
  'hero.ctas': { label: '', href: '', primary: true },
  'hero.visualImages': { src: '', alt: '' },
  'global.contact_info': { label: '', value: '', icon: '' },
  'about.features': { title: '', description: '', icon: '' },
  'global.logo': { text: '', src: '' },
  'global.nav_menu': { label: '', href: '', type: 'dropdown', items: [{ label: '', sublabel: '', href: '', icon: '', color: '' }] },
  'global.nav_ctas': { label: '', href: '', variant: 'primary', icon: '' }
}

export default function ContentPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [content, setContent] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [editingType, setEditingType] = useState<string>('text')
  const [editValue, setEditValue] = useState('')
  // Track images that need to be deleted from Cloudinary
  const [pendingDeletes, setPendingDeletes] = useState<string[]>([])

  useEffect(() => {
    loadContent()
  }, [])

  const loadContent = async () => {
    try {
      const data = await apiFetch('/content')
      // DEBUG LOG
      console.log('[ContentPage] Loaded content:', data)
      setContent(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (key: string, value: any, type: string = 'text') => {
    // 1. If value is missing, check template or default for type
    let finalValue = value
    if (value === undefined || value === null || (typeof value === 'string' && value === '')) {
      // For list types, always start with empty array, not template
      if (type === 'list') {
        finalValue = []
      } else if (ITEM_TEMPLATES[key]) {
        finalValue = ITEM_TEMPLATES[key]
      }
    }

    // 2. Specialized Transition: global.logo missing but logo_text exists
    if (key === 'global.logo' && (!finalValue || !finalValue.text)) {
      try {
        const globalData = content['global']
        const parsed = typeof globalData === 'string' ? JSON.parse(globalData) : globalData
        if (parsed?.logo_text) {
          finalValue = { text: parsed.logo_text, src: '' }
        }
      } catch (e) { }
    }

    // If value is an object (array/dict), stringify it for the editor
    const stringValue = typeof finalValue === 'object' ? JSON.stringify(finalValue) : String(finalValue === undefined || finalValue === null ? '' : finalValue)

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

      // STEP 1: Delete orphaned images from Cloudinary
      if (pendingDeletes.length > 0) {
        console.log('[ContentPage] Deleting orphaned images:', pendingDeletes)
        for (const key of pendingDeletes) {
          try {
            await apiFetch('/uploads', {
              method: 'DELETE',
              body: JSON.stringify({ key })
            })
            console.log(`[ContentPage] Deleted orphaned file: ${key}`)
          } catch (err) {
            console.error(`[ContentPage] Failed to delete orphaned file: ${key}`, err)
          }
        }
      }

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

      // 2. Get current Root Object
      let rootObj = content[rootKey] || {}
      if (typeof rootObj === 'string') {
        try {
          rootObj = JSON.parse(rootObj)
        } catch {
          rootObj = {}
        }
      }

      let finalValueToSave: any = editValue

      // 3. If it's a nested update, modify the object
      if (subKey) {
        let newValue = editValue
        try {
          const parsed = JSON.parse(editValue)
          // If we are editing an "object" type (e.g. logo), it might have been wrapped in an array by ListEditor
          if (editingType === 'object' && Array.isArray(parsed)) {
            newValue = parsed[0]
          } else if (typeof parsed === 'object' || Array.isArray(parsed)) {
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
        finalValueToSave = rootObj
      } else {
        // Root key - try to parse as JSON if possible
        try {
          const parsed = JSON.parse(editValue)
          if (typeof parsed === 'object' || Array.isArray(parsed)) {
            finalValueToSave = parsed
          }
        } catch { }
      }

      await apiFetch(`/content/${rootKey}`, {
        method: 'PUT',
        body: JSON.stringify({ value: finalValueToSave }),
        requiresAuth: true,
      })

      // Update local state
      // If nested, we update the ROOT key's value to the new stringified object
      setContent(prev => ({
        ...prev,
        [rootKey]: finalValueToSave
      }))

      // Clear pending deletions after successful save
      setPendingDeletes([])
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
      let rootObj = content[rootKey] || {}
      if (typeof rootObj === 'string') {
        try {
          rootObj = JSON.parse(rootObj)
        } catch {
          rootObj = {}
        }
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
        finalValueToSave = rootObj
      } else {
        // Root key - try to parse as JSON if possible
        try {
          const parsed = JSON.parse(newValue)
          if (typeof parsed === 'object' || Array.isArray(parsed)) {
            finalValueToSave = parsed
          }
        } catch { }
      }

      // 3. Update API
      await apiFetch(`/content/${rootKey}`, {
        method: 'PUT',
        body: JSON.stringify({ value: finalValueToSave }),
        requiresAuth: true,
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

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Content Management</h1>
        <p className="text-gray-500 mt-2">Manage website content section by section.</p>
      </div>

      {/* 1. GLOBAL SETTINGS */}
      <GlobalSettings
        content={content}
        handleEdit={handleEdit}
        handleQuickToggle={handleQuickToggle}
      />

      <NavigationSettings
        content={content}
        handleEdit={handleEdit}
        handleQuickToggle={handleQuickToggle}
      />

      {/* 2. DYNAMIC SECTIONS (Based on Layout) */}
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {layout.map((section: any, idx: number) => {
        // Hero Section
        if (section.type === 'Hero') {
          return (
            <HeroSettings
              key={section.id || idx}
              section={section}
              content={content}
              handleEdit={handleEdit}
              handleQuickToggle={handleQuickToggle}
            />
          )
        }

        // About Section
        if (section.type === 'About') {
          return (
            <AboutSettings
              key={section.id || idx}
              content={content}
              handleEdit={handleEdit}
              handleQuickToggle={handleQuickToggle}
            />
          )
        }

        // Fallback
        return null
      })}

      {/* 3. ADVANCED / UNUSED KEYS */}
      <SectionCard title="Advanced Configuration" description="Layout structure.">
        <FieldRow
          label="Homepage Layout Structure"
          rootKey="homepage_layout"
          type="json"
          content={content}
          handleEdit={handleEdit}
          handleQuickToggle={handleQuickToggle}
        />
      </SectionCard>


      {/* Basic Modal (Kept same logic) */}
      {editingKey && (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm">
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

              if (editingType === 'list' || editingType === 'object') {
                const isObject = editingType === 'object'
                // For object type, wrap in array [item] so ListEditor can handle it,
                // and we'll unwrap in handleSave
                const listValue = isObject ? (editValue ? JSON.stringify([JSON.parse(editValue)]) : '[]') : editValue

                // Determine folder based on root key (e.g. "hero" -> "hero", "about.features" -> "about")
                const folder = editingKey.split('.')[0] || 'others'

                return (
                  <ListEditor
                    value={listValue}
                    onChange={(newVal) => {
                      if (isObject) {
                        try {
                          const parsed = JSON.parse(newVal)
                          setEditValue(JSON.stringify(parsed[0] || {}))
                        } catch (e) {
                          setEditValue(newVal)
                        }
                      } else {
                        setEditValue(newVal)
                      }
                    }}
                    onPendingDeletes={(keys) => setPendingDeletes(keys)}
                    template={ITEM_TEMPLATES[editingKey]}
                    folder={folder}
                    maxItems={isObject ? 1 : undefined}
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
                onClick={() => {
                  setEditingKey(null)
                  setPendingDeletes([]) // Clear pending deletions on cancel
                }}
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
