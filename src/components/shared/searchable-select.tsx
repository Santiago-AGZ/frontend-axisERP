import { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface Option {
  value: string
  label: string
}

interface SearchableSelectProps {
  options: Option[]
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  notFound?: string
  searchPlaceholder?: string
  disabled?: boolean
}

export function SearchableSelect({
  options,
  value,
  onValueChange,
  notFound = 'Sin resultados',
  searchPlaceholder = 'Buscar...',
  disabled,
}: SearchableSelectProps) {
  const [search, setSearch] = useState('')

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase()),
  )

  useEffect(() => {
    if (!value) setSearch('')
  }, [value])

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <Search className="absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="h-8 pl-7 text-xs"
          placeholder={searchPlaceholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          disabled={disabled}
          autoComplete="off"
        />
      </div>

      <div className="max-h-48 overflow-y-auto rounded-md border">
        {filtered.length === 0 ? (
          <div className="px-2 py-4 text-center text-xs text-muted-foreground">
            {notFound}
          </div>
        ) : (
          filtered.map((o) => {
            const selected = o.value === value
            return (
              <div
                key={o.value}
                className={cn(
                  'flex cursor-pointer items-center border-b px-2 py-1.5 text-[13px] last:border-0 hover:bg-accent hover:text-accent-foreground',
                  selected && 'bg-accent font-medium',
                )}
                onMouseDown={(e) => { e.preventDefault(); onValueChange(o.value) }}
              >
                <span className="flex-1">{o.label}</span>
                {selected && (
                  <span className="text-xs text-muted-foreground shrink-0 ml-2">
                    Seleccionado
                  </span>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
