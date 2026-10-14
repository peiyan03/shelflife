'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const LINKS = [
  { href: '/', label: 'Home' },
  { href: '/add', label: 'Add by hand' },
  { href: '/preview', label: 'Components' },
  { href: '/about', label: 'About' },
]

export function Nav() {
  const pathname = usePathname()
  return (
    <nav className="site-nav" aria-label="Main">
      {LINKS.map((l) => (
        <Link key={l.href} href={l.href} aria-current={pathname === l.href ? 'page' : undefined}>
          {l.label}
        </Link>
      ))}
    </nav>
  )
}
