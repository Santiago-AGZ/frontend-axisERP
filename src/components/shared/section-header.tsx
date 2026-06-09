import type { ReactNode } from 'react'

interface SectionHeaderProps {
  title: string
  description?: string
  actions?: ReactNode
}

export function SectionHeader({ title, description, actions }: SectionHeaderProps) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-0.5">
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}
