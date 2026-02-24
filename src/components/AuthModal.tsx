'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

interface Props {
  onClose: () => void
  defaultMode?: 'login' | 'signup'
}

export default function AuthModal({ onClose, defaultMode = 'login' }: Props) {
  const [mode, setMode] = useState<'login' | 'signup'>(defaultMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn, signUp } = useAuth()

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
      onClose()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'エラーが発生しました'
      setError(msg.includes('wrong-password') || msg.includes('user-not-found')
        ? 'メールアドレスまたはパスワードが間違っています'
        : msg.includes('email-already-in-use')
        ? 'このメールアドレスはすでに使用されています'
        : msg.includes('weak-password')
        ? 'パスワードは6文字以上で設定してください'
        : 'エラーが発生しました。再度お試しください')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold mb-1">
          {mode === 'login' ? 'ログイン' : 'アカウント作成'}
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          {mode === 'login'
            ? 'Novellaにログインして作品を楽しみましょう'
            : '今すぐ登録して、あなたの物語を世界に届けましょう'}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {mode === 'signup' && (
            <input
              type="text"
              placeholder="表示名"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#9043e1] focus:ring-2 focus:ring-purple-100 transition"
            />
          )}
          <input
            type="email"
            placeholder="メールアドレス"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#9043e1] focus:ring-2 focus:ring-purple-100 transition"
          />
          <input
            type="password"
            placeholder="パスワード"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#9043e1] focus:ring-2 focus:ring-purple-100 transition"
          />

          {error && <p className="text-red-500 text-xs">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white transition disabled:opacity-50"
            style={{ background: '#9043e1' }}
          >
            {loading ? '処理中...' : mode === 'login' ? 'ログイン' : 'アカウントを作成する'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          {mode === 'login' ? 'アカウントをお持ちでない方は' : 'すでにアカウントをお持ちの方は'}
          <button
            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError('') }}
            className="ml-1 font-semibold"
            style={{ color: '#9043e1' }}
          >
            {mode === 'login' ? '新規登録' : 'ログイン'}
          </button>
        </p>
      </div>
    </div>
  )
}
