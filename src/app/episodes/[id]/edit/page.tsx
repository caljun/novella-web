'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { ChevronLeft, ImagePlus, X, Trash2 } from 'lucide-react'
import { fetchEpisode, updateEpisode, deleteEpisode, uploadImage } from '@/lib/firestore'
import { useAuth } from '@/hooks/useAuth'
import { useLang } from '@/contexts/LangContext'
import { t } from '@/lib/i18n'

const MIN_CHARS = 800
const MAX_CHARS = 1500

export default function EpisodeEditPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { user } = useAuth()
  const { lang } = useLang()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [topImageUrl, setTopImageUrl] = useState<string | null>(null)
  const [bottomImageUrl, setBottomImageUrl] = useState<string | null>(null)
  const [topFile, setTopFile] = useState<File | null>(null)
  const [bottomFile, setBottomFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const topRef = useRef<HTMLInputElement>(null)
  const bottomRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchEpisode(id).then((ep) => {
      if (!ep) return
      setTitle(ep.title)
      setContent(ep.content)
      setTopImageUrl(ep.topImages[0] ?? null)
      setBottomImageUrl(ep.bottomImages[0] ?? null)
    })
  }, [id])

  const charCount = content.length
  const charValid = charCount >= MIN_CHARS && charCount <= MAX_CHARS

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !charValid) return
    setSaving(true)

    const [newTopUrl, newBottomUrl] = await Promise.all([
      topFile ? uploadImage(topFile, `episodes/${id}_top_${Date.now()}`) : Promise.resolve(topImageUrl ?? ''),
      bottomFile ? uploadImage(bottomFile, `episodes/${id}_bottom_${Date.now()}`) : Promise.resolve(bottomImageUrl ?? ''),
    ])

    await updateEpisode(id, {
      title: title.trim(),
      content,
      topImages: newTopUrl ? [newTopUrl] : [],
      bottomImages: newBottomUrl ? [newBottomUrl] : [],
    })
    setSaving(false)
    router.back()
  }

  async function handleDelete() {
    setDeleting(true)
    await deleteEpisode(id)
    router.push('/')
  }

  const topPreview = topFile ? URL.createObjectURL(topFile) : topImageUrl
  const bottomPreview = bottomFile ? URL.createObjectURL(bottomFile) : bottomImageUrl

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 pb-24">
      <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-gray-400 hover:text-[#9043e1] mb-6 transition-colors">
        <ChevronLeft size={16} />
        {t(lang, 'episode.back')}
      </button>
      <h1 className="text-xl font-bold mb-6">{t(lang, 'edit.episode')}</h1>

      <form onSubmit={handleSave} className="flex flex-col gap-6">
        {/* Title */}
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1.5 block">{t(lang, 'edit.epTitleLabel')} <span className="text-red-400">*</span></label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#9043e1] focus:ring-2 focus:ring-purple-100 transition"
          />
        </div>

        {/* Top image */}
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-2 block">{t(lang, 'edit.topImageLabel')}</label>
          {topPreview ? (
            <div className="relative inline-block">
              <div className="relative w-36 h-44 rounded-xl overflow-hidden bg-gray-100">
                <Image src={topPreview} alt="" fill className="object-cover" />
              </div>
              <button type="button" onClick={() => { setTopFile(null); setTopImageUrl(null) }} className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gray-800 text-white flex items-center justify-center">
                <X size={10} />
              </button>
            </div>
          ) : (
            <button type="button" onClick={() => topRef.current?.click()} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-500 hover:border-[#9043e1] hover:text-[#9043e1] transition">
              <ImagePlus size={15} />
              {t(lang, 'post.selectImage')}
            </button>
          )}
          <input ref={topRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) { setTopFile(f); setTopImageUrl(null) } }} />
        </div>

        {/* Content */}
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1.5 block">{t(lang, 'edit.contentLabel')}</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={14}
            className={`w-full border rounded-xl px-4 py-3 text-sm leading-7 outline-none transition focus:ring-2 resize-none ${
              charCount > 0 && !charValid
                ? 'border-red-300 focus:ring-red-100'
                : 'border-gray-200 focus:border-[#9043e1] focus:ring-purple-100'
            }`}
          />
          <p className={`text-xs mt-1 text-right ${charValid ? 'text-[#9043e1]' : charCount > 0 ? 'text-red-400' : 'text-gray-300'}`}>
            {charCount} {t(lang, 'post.charCount')}
          </p>
        </div>

        {/* Bottom image */}
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-2 block">{t(lang, 'edit.bottomImageLabel')}</label>
          {bottomPreview ? (
            <div className="relative inline-block">
              <div className="relative w-36 h-44 rounded-xl overflow-hidden bg-gray-100">
                <Image src={bottomPreview} alt="" fill className="object-cover" />
              </div>
              <button type="button" onClick={() => { setBottomFile(null); setBottomImageUrl(null) }} className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gray-800 text-white flex items-center justify-center">
                <X size={10} />
              </button>
            </div>
          ) : (
            <button type="button" onClick={() => bottomRef.current?.click()} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-500 hover:border-[#9043e1] hover:text-[#9043e1] transition">
              <ImagePlus size={15} />
              {t(lang, 'post.selectImage')}
            </button>
          )}
          <input ref={bottomRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) { setBottomFile(f); setBottomImageUrl(null) } }} />
        </div>

        <button
          type="submit"
          disabled={saving || !title.trim() || !charValid}
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
            {t(lang, 'edit.deleteEp')}
          </button>
        ) : (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-4">
            <p className="text-sm font-semibold text-red-600 mb-1">{t(lang, 'edit.deleteConfirm')}</p>
            <p className="text-xs text-red-400 mb-4">{t(lang, 'edit.deleteEpWarning')}</p>
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
