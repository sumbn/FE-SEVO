import React from 'react'
import { SectionCard } from '../../components/SectionCard'
import { FieldRow } from '../../components/FieldRow'

interface AboutSettingsProps {
  content: Record<string, any>
  handleEdit: (key: string, value: any, type: string) => void
  handleQuickToggle: (key: string, currentValue: any) => void
}

export const AboutSettings = ({ content, handleEdit, handleQuickToggle }: AboutSettingsProps) => {
  return (
    <SectionCard title="About Section" description="Introduction content.">
      <FieldRow
        label="Headline"
        rootKey="about"
        fieldKey="title"
        content={content}
        handleEdit={handleEdit}
        handleQuickToggle={handleQuickToggle}
      />
      <FieldRow
        label="Description Text"
        rootKey="about"
        fieldKey="text"
        content={content}
        handleEdit={handleEdit}
        handleQuickToggle={handleQuickToggle}
      />
      <FieldRow
        label="Feature Cards (Mission/Vision)"
        rootKey="about"
        fieldKey="features"
        type="list"
        content={content}
        handleEdit={handleEdit}
        handleQuickToggle={handleQuickToggle}
      />
    </SectionCard>
  )
}
