import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import LogoutButton from './LogoutButton'
import Link from 'next/link'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/admin-login')
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-white border-b px-6 py-4 flex justify-between items-center">
        <nav className="flex items-center gap-6">
          <Link href="/admin" className="font-bold text-lg">
            Dashboard
          </Link>
          <Link
            href="/admin/recitants"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Récitants
          </Link>
          <Link
            href="/admin/lectures"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Lectures
          </Link>
        </nav>
        <LogoutButton />
      </header>
      <main className="p-6">{children}</main>
    </div>
  )
}