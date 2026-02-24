'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { ChevronLeft, ImagePlus, X, Trash2 } from 'lucide-react'
import { fetchWork, updateWork, deleteWork, uploadImage } from '@/lib/firestore'
import { useAuth } from '@/hooks/useAuth'
import { useLang } from '@/contexts/LangContext'
import { t } from '@/lib/i18n'
import type { Work } from '@/types'

export default function WorkEditPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { user } = useAuth()
  const { lang } = useLang()

  const [work, setWork] = useState<Work | null>(null)
  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchWork(id).then((w) => {
      if (!w) return
      setWork(w)
      setTitle(w.title)
      setSummary(w.summary ?? '')
    })
  }, [id])

  // Redirect if not author
  useEffect(() => {
    if (work && user && work.authorId !== user.uid) router.replace(`/works/${id}`)
  }, [work, user, id, router])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)
    const updates: Parameters<typeof updateWork>[1] = { title: title.trim(), summary: summary.trim() }
    if (coverFile) {
      updates.coverImageUrl = await uploadImage(coverFile, `covers/${id}_${Date.now()}`)
    }
    await updateWork(id, updates)
    setSaving(false)
    router.push(`/works/${id}`)
  }

  async function handleDelete() {
    setDeleting(true)
    await deleteWork(id)
    router.push('/')
  }

  if (!work) return null

  const coverPreview = coverFile ? URL.createObjectURL(coverFile) : work.coverImageUrl

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-8 pb-24">
      <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-gray-400 hover:text-[#9043e1] mb-6 transition-colors">
        <ChevronLeft size={16} />
        {t(lang, 'work.back')}
      </button>

      <h1 className="text-xl font-bold mb-6">{t(lang, 'edit.work')}</h1>

      <form onSubmit={handleSave} className="flex flex-col gap-5">
        {/* Cover */}
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-2 block">{t(lang, 'edit.coverLabel')}</label>
          <div className="flex items-start gap-4">
            <div className="relative w-28 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0" style={{ aspectRatio: '3/4' }}>
              {coverPreview ? (
                <Image src={coverPreview} alt="" fill className="object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-2xl">📖</div>
              )}
            </div>
            <div className="flex flex-col gap-2 pt-1">
              <label className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-500 hover:border-[#9043e1] hover:text-[#9043e1] cursor-pointer transition">
                <ImagePlus size={15} />
                {coverFile ? t(lang, 'edit.selectCover') : t(lang, 'edit.changeCover')}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) setCoverFile(f) }} />
              </label>
              {coverFile && (
                <button type="button" onClick={() => setCoverFile(null)} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-400 transition">
                  <X size={12} />
                  {t(lang, 'edit.cancel')}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1.5 block">{t(lang, 'edit.titleLabel')} <span className="text-red-400">*</span></label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#9043e1] focus:ring-2 focus:ring-purple-100 transition"
          />
        </div>

        {/* Summary */}
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1.5 block">{t(lang, 'edit.summaryLabel')}</label>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={4}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#9043e1] focus:ring-2 focus:ring-purple-100 transition resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={saving || !title.trim()}
          className="w-full py-3 rounded-xl text-sm font-semibold text-white transition disabled:opacity-50"
          style={{ background: '#9043e1' }}
        >
          {saving ? t(lang, 'edit.saving') : t(lang, 'edit.save')}
        </button>
      </form>

      {/* Delete */}
      <div className="mt-8 pt-6 border-t border-gray-100">
        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-red-500 border border-red-100 hover:bg-red-50 transition"
          >
            <Trash2 size={15} />
            {t(lang, 'edit.delete')}
          </button>
        ) : (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-4">
            <p className="text-sm font-semibold text-red-600 mb-1">{t(lang, 'edit.deleteConfirm')}</p>
            <p className="text-xs text-red-400 mb-4">{t(lang, 'edit.deleteWorkWarning')}</p>
            <div className="flex gap-2">
              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-2 rounded-lg text-sm font-medium bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition">
                {t(lang, 'edit.cancel')}
              </button>
              <button onClick={handleDelete} disabled={deleting} className="flex-1 py-2 rounded-lg text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition disabled:opacity-50">
                {deleting ? t(lang, 'edit.deleting') : t(lang, 'edit.doDelete')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
