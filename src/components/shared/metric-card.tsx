import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MetricCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: {
    value: string
    positive: boolean
  }
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
}

const variantStyles = {
  default: 'bg-primary/10 text-primary',
  success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  danger: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
}

export function MetricCard({ title, value, icon: Icon, trend, variant = 'default' }: MetricCardProps) {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          {trend && (
            <p className={cn('text-sm', trend.positive ? 'text-emerald-600' : 'text-red-600')}>
              {trend.positive ? '+' : ''}{trend.value}
            </p>
          )}
        </div>
        <div className={cn('flex size-10 items-center justify-center rounded-lg', variantStyles[variant])}>
          <Icon className="size-5" />
        </div>
      </div>
    </div>
  )
}
