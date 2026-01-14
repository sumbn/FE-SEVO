import React from 'react'

interface SectionCardProps {
  title: string
  description?: string
  children: React.ReactNode
}

export const SectionCard = ({ title, description, children }: SectionCardProps) => (
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
