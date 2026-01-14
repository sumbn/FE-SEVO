import React from 'react'
import { SectionCard } from '../../components/SectionCard'
import { FieldRow } from '../../components/FieldRow'

interface NavigationSettingsProps {
  content: Record<string, any>
  handleEdit: (key: string, value: any, type: string) => void
  handleQuickToggle: (key: string, currentValue: any) => void
}

export const NavigationSettings = ({ content, handleEdit, handleQuickToggle }: NavigationSettingsProps) => {
  return (
    <SectionCard title="Navigation Settings" description="Manage main website navigation links and call-to-action buttons.">
      <FieldRow
        label="Menu Links"
        rootKey="global"
        fieldKey="nav_menu"
        type="list"
        content={content}
        handleEdit={handleEdit}
        handleQuickToggle={handleQuickToggle}
      />
      <FieldRow
        label="Button CTAs"
        rootKey="global"
        fieldKey="nav_ctas"
        type="list"
        content={content}
        handleEdit={handleEdit}
        handleQuickToggle={handleQuickToggle}
      />
    </SectionCard>
  )
}
