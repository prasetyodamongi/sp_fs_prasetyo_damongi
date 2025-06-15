'use client'
import { useState, useEffect } from 'react'
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export function EmailCombobox({
  onSelect,
  existingMembers = [],
}: {
  onSelect: (email: string) => void
  existingMembers?: string[]
}) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState('')
  const [emails, setEmails] = useState<string[]>([])
  const [isSearching, setIsSearching] = useState(false)

  // Mock search function - replace with actual API call
  const searchEmails = async (query: string) => {
    if (query.length < 3) {
      setEmails([])
      return
    }

    setIsSearching(true)
    try {
      // Replace with your actual API endpoint
      const response = await fetch(`/api/users/search?q=${query}`)
      const data = await response.json()
      setEmails(data.filter((email: string) => !existingMembers.includes(email)))
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setIsSearching(false)
    }
  }

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchEmails(value)
    }, 300)

    return () => clearTimeout(timer)
  }, [value])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value || "Cari email anggota..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Cari email..."
            value={value}
            onValueChange={setValue}
          />
          <CommandList>
            {isSearching ? (
              <CommandEmpty>Mencari...</CommandEmpty>
            ) : emails.length === 0 ? (
              <CommandEmpty>Email tidak ditemukan</CommandEmpty>
            ) : (
              <CommandGroup heading="Hasil Pencarian">
                {emails.map((email) => (
                  <CommandItem
                    key={email}
                    value={email}
                    onSelect={(currentValue) => {
                      setValue(currentValue === value ? '' : currentValue)
                      setOpen(false)
                      onSelect(currentValue)
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === email ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {email}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}