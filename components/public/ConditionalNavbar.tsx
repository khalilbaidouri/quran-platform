'use client'

import { usePathname } from 'next/navigation'
import Navbar from './Navbar'

export default function ConditionalNavbar() {
  const pathname = usePathname()

  const isAdminRoute =
    pathname.startsWith('/admin') || pathname.startsWith('/admin-login')

  if (isAdminRoute) return null

  return <Navbar />
}