import React from 'react'
import { SectionCard } from '../../components/SectionCard'
import { FieldRow } from '../../components/FieldRow'

interface GlobalSettingsProps {
  content: Record<string, any>
  handleEdit: (key: string, value: any, type: string) => void
  handleQuickToggle: (key: string, currentValue: any) => void
}

export const GlobalSettings = ({ content, handleEdit, handleQuickToggle }: GlobalSettingsProps) => {
  return (
    <SectionCard title="Global Settings" description="General website configuration, logo, and contact info.">
      <FieldRow
        label="Logo Config (Image & Text)"
        rootKey="global"
        fieldKey="logo"
        type="object"
        content={content}
        handleEdit={handleEdit}
        handleQuickToggle={handleQuickToggle}
      />
      <FieldRow
        label="Contact Information"
        rootKey="global"
        fieldKey="contact_info"
        type="list"
        content={content}
        handleEdit={handleEdit}
        handleQuickToggle={handleQuickToggle}
      />
    </SectionCard>
  )
}
