import React from 'react'
import { SectionCard } from '../../components/SectionCard'
import { FieldRow } from '../../components/FieldRow'
import { GroupedFeatureCard } from '../../components/GroupedFeatureCard'

interface HeroSettingsProps {
  section: { id: string, type: string }
  content: Record<string, any>
  handleEdit: (key: string, value: any, type?: string) => void
  handleQuickToggle: (key: string, currentValue: any) => void
}

export const HeroSettings = ({ section, content, handleEdit, handleQuickToggle }: HeroSettingsProps) => {
  return (
    <SectionCard title={`Hero Section (${section.id})`} description="Main introduction banner.">
      <FieldRow
        label="Title"
        rootKey="hero"
        fieldKey="title"
        content={content}
        handleEdit={(key, val, type) => handleEdit(key, val, type)}
        handleQuickToggle={handleQuickToggle}
      />
      <FieldRow
        label="Subtitle"
        rootKey="hero"
        fieldKey="subtitle"
        content={content}
        handleEdit={(key, val, type) => handleEdit(key, val, type)}
        handleQuickToggle={handleQuickToggle}
      />
      <FieldRow
        label="Call to Action Buttons"
        rootKey="hero"
        fieldKey="ctas"
        type="list"
        content={content}
        handleEdit={(key, val, type) => handleEdit(key, val, type)}
        handleQuickToggle={handleQuickToggle}
      />
      <GroupedFeatureCard
        title="Trust Bar Configuration"
        rootKey="hero"
        toggleKey="showTrustBar"
        fields={[
          { key: 'trustBarText', label: 'Bar Text', type: 'text' },
          { key: 'trustBarLogos', label: 'Partner Logos', type: 'list' }
        ]}
        content={content}
        handleEdit={handleEdit}
        handleQuickToggle={handleQuickToggle}
      />

      <GroupedFeatureCard
        title="Hero Visual (Carousel)"
        rootKey="hero"
        toggleKey="showVisual"
        fields={[
          { key: 'visualImages', label: 'Image List', type: 'list' }
        ]}
        content={content}
        handleEdit={handleEdit}
        handleQuickToggle={handleQuickToggle}
      />
    </SectionCard>
  )
}
