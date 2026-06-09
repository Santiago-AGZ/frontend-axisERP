import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  status?: 'success' | 'warning' | 'danger' | 'neutral'
}

const statusStyles = {
  neutral: 'text-muted-foreground',
  success: 'text-emerald-600 dark:text-emerald-400',
  warning: 'text-amber-600 dark:text-amber-400',
  danger: 'text-red-600 dark:text-red-400',
}

const iconBgStyles = {
  neutral: 'bg-muted',
  success: 'bg-emerald-100 dark:bg-emerald-900/30',
  warning: 'bg-amber-100 dark:bg-amber-900/30',
  danger: 'bg-red-100 dark:bg-red-900/30',
}

export function StatCard({ label, value, icon: Icon, status = 'neutral' }: StatCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-xl border bg-card p-5 shadow-sm">
      <div className={cn('flex size-11 items-center justify-center rounded-lg', iconBgStyles[status])}>
        <Icon className={cn('size-5', statusStyles[status])} />
      </div>
      <div className="space-y-0.5">
        <p className="text-2xl font-bold tracking-tight">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}
