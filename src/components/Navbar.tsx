'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Home, Search, PenSquare, User, LogOut, Settings } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useLang } from '@/contexts/LangContext'
import { t } from '@/lib/i18n'
import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()
  const { lang, toggleLang } = useLang()
  const [searchQuery, setSearchQuery] = useState('')
  const [showUserMenu, setShowUserMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  const mobileTabs = [
    { href: '/', icon: Home, label: t(lang, 'nav.home') },
    { href: '/search', icon: Search, label: t(lang, 'nav.search') },
    { href: '/post', icon: PenSquare, label: t(lang, 'nav.post') },
    { href: user ? `/profile/${user.uid}` : '/auth', icon: User, label: t(lang, 'nav.mypage') },
  ]

  return (
    <>
      {/* ── Desktop top bar ── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 h-14">
        <div className="max-w-7xl mx-auto h-full flex items-center gap-5 px-6">

          {/* Logo */}
          <Link href="/" className="flex-shrink-0 text-xl font-black tracking-tight" style={{ color: '#9043e1' }}>
            Novella
          </Link>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-1">
            {[{ href: '/', label: t(lang, 'nav.home') }, { href: '/post', label: t(lang, 'nav.post') }].map(({ href, label }) => {
              const active = pathname === href
              return (
                <Link
                  key={href}
                  href={href}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    active ? 'text-[#9043e1] bg-purple-50' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {label}
                </Link>
              )
            })}
          </nav>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xs relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t(lang, 'nav.searchPlaceholder')}
              className="w-full bg-gray-50 border border-gray-200 rounded-full pl-8 pr-4 py-1.5 text-sm outline-none focus:border-[#9043e1] focus:bg-white focus:ring-2 focus:ring-purple-100 transition"
            />
          </form>

          <div className="flex-1 hidden md:block" />

          {/* Lang toggle */}
          <button
            onClick={toggleLang}
            className="hidden md:flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold border border-gray-200 text-gray-500 hover:border-[#9043e1] hover:text-[#9043e1] transition-colors"
            title={lang === 'ja' ? 'Switch to English' : '日本語に切り替え'}
          >
            {lang === 'ja' ? 'EN' : 'JA'}
          </button>

          {/* User area */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowUserMenu((v) => !v)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-gray-50 transition"
                >
                  <div className="w-7 h-7 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center text-xs font-bold text-gray-400 flex-shrink-0">
                    {user.photoURL ? (
                      <Image src={user.photoURL} alt="" width={28} height={28} className="object-cover" />
                    ) : (
                      (user.displayName?.[0] ?? '?').toUpperCase()
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-700 max-w-[120px] truncate">
                    {user.displayName ?? t(lang, 'nav.mypage')}
                  </span>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-1.5 w-48 bg-white border border-gray-100 rounded-2xl shadow-lg shadow-black/5 py-1.5 overflow-hidden">
                    <Link
                      href={`/profile/${user.uid}`}
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                    >
                      <User size={14} className="text-gray-400" />
                      {t(lang, 'nav.mypage')}
                    </Link>
                    <Link
                      href="/settings"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                    >
                      <Settings size={14} className="text-gray-400" />
                      {t(lang, 'nav.settings')}
                    </Link>
                    <div className="my-1 border-t border-gray-100" />
                    <button
                      onClick={() => { logout(); setShowUserMenu(false) }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition"
                    >
                      <LogOut size={14} />
                      {t(lang, 'nav.logout')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/auth" className="px-4 py-1.5 rounded-full text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition">
                  {t(lang, 'nav.login')}
                </Link>
                <Link href="/auth" className="px-4 py-1.5 rounded-full text-sm font-semibold text-white transition hover:opacity-90" style={{ background: '#9043e1' }}>
                  {t(lang, 'nav.signup')}
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Mobile bottom nav ── */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/90 backdrop-blur-xl border-t border-gray-100 flex pb-safe">
        {mobileTabs.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors ${
                active ? 'text-[#9043e1]' : 'text-gray-400'
              }`}
            >
              <Icon size={21} strokeWidth={active ? 2.5 : 1.8} />
              {label}
            </Link>
          )
        })}
        {/* Mobile lang toggle */}
        <button
          onClick={toggleLang}
          className="flex flex-col items-center gap-0.5 py-2.5 px-3 text-[10px] font-bold text-gray-400"
        >
          <span className="text-base leading-none">{lang === 'ja' ? 'EN' : 'JA'}</span>
          {lang === 'ja' ? 'EN' : 'JA'}
        </button>
      </nav>
    </>
  )
}
