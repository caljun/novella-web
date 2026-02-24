'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { updateProfile } from 'firebase/auth'
import { ChevronLeft, LogOut, Camera } from 'lucide-react'
import { auth } from '@/lib/firebase'
import { createOrUpdateUser, uploadImage } from '@/lib/firestore'
import { useAuth } from '@/hooks/useAuth'
import { useLang } from '@/contexts/LangContext'
import { t } from '@/lib/i18n'

export default function SettingsPage() {
  const { user, logout } = useAuth()
  const { lang } = useLang()
  const router = useRouter()
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!user) { router.push('/auth'); return }
    setDisplayName(user.displayName ?? '')
  }, [user, router])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setSaving(true)
    await updateProfile(user, { displayName })
    await createOrUpdateUser({ id: user.uid, userId: user.uid, displayName, bio })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !user) return
    const url = await uploadImage(file, `users/${user.uid}/avatar`)
    await updateProfile(user, { photoURL: url })
    await createOrUpdateUser({ id: user.uid, userId: user.uid, profileImageUrl: url })
  }

  async function handleLogout() {
    await logout()
    router.push('/')
  }

  if (!user) return null

  return (
    <div className="max-w-lg mx-auto px-4 py-6 pb-24">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#9043e1] mb-6 transition-colors"
      >
        <ChevronLeft size={18} />
        {t(lang, 'settings.back')}
      </button>

      <h1 className="text-xl font-bold mb-6">{t(lang, 'settings.title')}</h1>

      {/* Avatar */}
      <div className="flex flex-col items-center mb-8">
        <label className="relative cursor-pointer group">
          <div className="w-24 h-24 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center text-3xl font-bold text-gray-300">
            {user.photoURL ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
            ) : (
              (user.displayName?.[0] ?? '?').toUpperCase()
            )}
          </div>
          <div className="absolute inset-0 rounded-full bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
            <Camera size={20} className="text-white" />
          </div>
          <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        </label>
        <p className="text-xs text-gray-400 mt-2">{t(lang, 'settings.avatar')}</p>
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-4">
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1.5 block">{t(lang, 'settings.displayName')}</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#9043e1] focus:ring-2 focus:ring-purple-100 transition"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1.5 block">{t(lang, 'settings.bio')}</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#9043e1] focus:ring-2 focus:ring-purple-100 transition resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 rounded-xl text-sm font-semibold text-white transition disabled:opacity-50"
          style={{ background: '#9043e1' }}
        >
          {saving ? t(lang, 'settings.saving') : saved ? t(lang, 'settings.saved') : t(lang, 'settings.save')}
        </button>
      </form>

      <div className="mt-6 pt-6 border-t border-gray-100">
        <p className="text-xs text-gray-400 mb-1">{t(lang, 'settings.email')}</p>
        <p className="text-sm text-gray-600">{user.email}</p>
      </div>

      <button
        onClick={handleLogout}
        className="mt-8 w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-red-500 border border-red-100 hover:bg-red-50 transition"
      >
        <LogOut size={16} />
        {t(lang, 'settings.logout')}
      </button>
    </div>
  )
}
