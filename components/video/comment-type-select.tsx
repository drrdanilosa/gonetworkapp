"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export interface CommentColorType {
  id: string
  name: string
  color: string
  description: string
}

interface CommentTypeSelectProps {
  value: string
  onValueChange: (value: string) => void
  options: CommentColorType[]
}

export function CommentTypeSelect({ value, onValueChange, options }: CommentTypeSelectProps) {
  const [open, setOpen] = React.useState(false)
  const selectedOption = options.find(option => option.id === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          <div className="flex items-center">
            <div 
              className="w-3 h-3 rounded-full mr-2" 
              style={{ backgroundColor: selectedOption?.color || '#BD93F9' }} 
            />
            {selectedOption?.name || "Selecione o tipo"}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Buscar tipo..." />
          <CommandEmpty>Nenhum tipo encontrado.</CommandEmpty>
          <CommandGroup>
            {options.map((option) => (
              <CommandItem
                key={option.id}
                value={option.id}
                onSelect={() => {
                  onValueChange(option.id)
                  setOpen(false)
                }}
              >
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: option.color }} 
                  />
                  {option.name}
                </div>
                <Check
                  className={cn(
                    "ml-auto h-4 w-4",
                    value === option.id ? "opacity-100" : "opacity-0"
                  )}
                />
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
