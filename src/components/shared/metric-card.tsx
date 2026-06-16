import type { LucideIcon } from 'lucide-react'
import { TrendingUp, TrendingDown } from 'lucide-react'
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

const iconBg: Record<string, string> = {
  default: 'bg-primary/10 text-primary dark:bg-primary/15',
  success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/25 dark:text-emerald-400',
  warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/25 dark:text-amber-400',
  danger: 'bg-red-100 text-red-700 dark:bg-red-900/25 dark:text-red-400',
  info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/25 dark:text-blue-400',
}

export function MetricCard({ title, value, icon: Icon, trend, variant = 'default' }: MetricCardProps) {
  return (
    <div className="relative overflow-hidden rounded-xl border bg-card p-5 shadow-xs">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">{title}</p>
          <p className="text-2xl font-bold tracking-tight tabular-nums">{value}</p>
          {trend && (
            <div className={cn(
              'flex items-center gap-1 text-[11px] font-medium',
              trend.positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
            )}>
              {trend.positive ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
              <span>{trend.positive ? '+' : ''}{trend.value}</span>
            </div>
          )}
        </div>
        <div className={cn('flex size-9 items-center justify-center rounded-lg', iconBg[variant])}>
          <Icon className="size-4.5" />
        </div>
      </div>
    </div>
  )
}
