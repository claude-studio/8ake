import * as React from 'react'

import { ChevronDown } from 'lucide-react'

import { cn } from '@/shared/lib/utils'

function NativeSelect({ className, children, ...props }: React.ComponentProps<'select'>) {
  return (
    <div className="relative inline-flex">
      <select
        data-slot="native-select"
        className={cn(
          'border-input bg-background text-foreground focus:border-ring focus:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 dark:bg-input/30 flex appearance-none items-center rounded-md border px-3 py-2 pr-7 text-sm shadow-xs transition-[color,box-shadow] outline-none focus:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        size={12}
        className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground"
      />
    </div>
  )
}

function NativeSelectOption({ className, ...props }: React.ComponentProps<'option'>) {
  return <option className={cn('', className)} {...props} />
}

export { NativeSelect, NativeSelectOption }
