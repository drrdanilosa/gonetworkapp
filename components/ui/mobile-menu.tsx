'use client'

import { useState } from 'react'
import { useMobile } from '@/hooks/use-mobile'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function MobileMenu() {
  const isMobile = useMobile()
  const [isOpen, setIsOpen] = useState(false)

  const links = [
    { href: '/', label: 'Home' },
    { href: '/tema', label: 'Tema Dracula' },
    { href: '/exemplo', label: 'Exemplo' },
    { href: '/events', label: 'Eventos' },
  ]

  // Se não for mobile, mostrar menu horizontal
  if (!isMobile) {
    return (
      <nav className="hidden gap-2 md:flex">
        {links.map(link => (
          <Link key={link.href} href={link.href}>
            <Button variant="ghost" size="sm">
              {link.label}
            </Button>
          </Link>
        ))}
      </nav>
    )
  }

  // Versão mobile
  return (
    <div className="relative z-50">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Menu"
      >
        {isOpen ? <X className="size-6" /> : <Menu className="size-6" />}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="dracula-backdrop absolute right-0 top-full min-w-[200px] rounded-lg p-4 shadow-dracula"
          >
            <nav className="flex flex-col gap-2">
              {links.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="w-full"
                >
                  <Button variant="ghost" className="w-full justify-start">
                    {link.label}
                  </Button>
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
