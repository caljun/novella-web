import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { LangProvider } from '@/contexts/LangContext'

export const metadata: Metadata = {
  title: 'Novella',
  description: '小説・物語の投稿・閲覧プラットフォーム',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <LangProvider>
          <Navbar />
          <main className="min-h-screen pt-14">{children}</main>
          <Footer />
        </LangProvider>
      </body>
    </html>
  )
}
