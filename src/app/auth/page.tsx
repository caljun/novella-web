'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useLang } from '@/contexts/LangContext'
import { t } from '@/lib/i18n'

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { user, signIn, signUp } = useAuth()
  const { lang } = useLang()
  const router = useRouter()

  useEffect(() => {
    if (user) router.push(`/profile/${user.uid}`)
  }, [user, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'login') {
        await signIn(email, password)
      } else {
        await signUp(email, password, displayName)
      }
      router.push('/')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : ''
      setError(
        msg.includes('wrong-password') || msg.includes('user-not-found')
          ? t(lang, 'auth.err.wrongPassword')
          : msg.includes('email-already-in-use')
          ? t(lang, 'auth.err.emailInUse')
          : msg.includes('weak-password')
          ? t(lang, 'auth.err.weakPassword')
          : t(lang, 'auth.err.generic')
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-1" style={{ color: '#9043e1' }}>Novella</h1>
          <p className="text-sm text-gray-500">{t(lang, 'auth.tagline')}</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
          <div className="flex mb-6 bg-gray-50 rounded-2xl p-1">
            {(['login', 'signup'] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError('') }}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold transition ${
                  mode === m ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'
                }`}
              >
                {m === 'login' ? t(lang, 'auth.login') : t(lang, 'auth.signup')}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            {mode === 'signup' && (
              <input
                type="text"
                placeholder={t(lang, 'auth.displayName')}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#9043e1] focus:ring-2 focus:ring-purple-100 transition"
              />
            )}
            <input
              type="email"
              placeholder={t(lang, 'auth.email')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#9043e1] focus:ring-2 focus:ring-purple-100 transition"
            />
            <input
              type="password"
              placeholder={t(lang, 'auth.password')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#9043e1] focus:ring-2 focus:ring-purple-100 transition"
            />

            {error && <p className="text-red-500 text-xs">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white mt-1 transition disabled:opacity-50"
              style={{ background: '#9043e1' }}
            >
              {loading ? t(lang, 'auth.processing') : mode === 'login' ? t(lang, 'auth.login') : t(lang, 'auth.createAccount')}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
