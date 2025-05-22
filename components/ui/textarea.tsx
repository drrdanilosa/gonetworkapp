'use client'

"use client"

import * as React from 'react'

import { cn } from '@/lib/utils'

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<'textarea'>
>(({ className, value, onChange, defaultValue, ...props }, ref) => {
  // Se tem onChange, usa value, senão usa defaultValue
  const textareaProps = onChange
    ? { value: value === undefined ? '' : value }
    : { defaultValue: value === undefined ? defaultValue : value }

  return (
    <textarea
      className={cn(
        'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        className
      )}
      ref={ref}
      onChange={onChange}
      {...textareaProps}
      {...props}
    />
  )
})
Textarea.displayName = 'Textarea'

export { Textarea }
