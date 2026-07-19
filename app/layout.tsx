import type { Metadata } from 'next'
import './globals.css'
import ConditionalNavbar from '@/components/public/ConditionalNavbar'

export const metadata: Metadata = {
  title: 'Récitations du Coran',
  description: 'Écoutez et téléchargez librement les récitations du Coran',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body>
        <ConditionalNavbar />
        {children}
      </body>
    </html>
  )
}