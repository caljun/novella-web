'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight, ImagePlus, CheckCircle, BookOpen, Plus } from 'lucide-react'
import { createWork, createEpisode, fetchWorksByAuthor, uploadImage } from '@/lib/firestore'
import { useAuth } from '@/hooks/useAuth'
import { useLang } from '@/contexts/LangContext'
import { t } from '@/lib/i18n'
import AuthModal from '@/components/AuthModal'
import type { Work } from '@/types'

const MIN_CHARS = 800
const MAX_CHARS = 1500

type Mode = 'select' | 'new' | 'episode'
type Step = 1 | 2 | 3 | 4 | 5 | 6

interface NewPostForm {
  content: string
  topImage: File | null
  bottomImage: File | null
  episodeTitle: string
  workSummary: string
  workTitle: string
  coverImage: File | null
}

interface EpisodeForm {
  workId: string
  workTitle: string
  content: string
  topImage: File | null
  bottomImage: File | null
  episodeTitle: string
  episodeNumber: number
}

export default function PostPage() {
  const { user, loading: authLoading } = useAuth()
  const { lang } = useLang()
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('select')
  const [step, setStep] = useState<Step>(1)
  const [publishing, setPublishing] = useState(false)
  const [success, setSuccess] = useState(false)
  const [showAuth, setShowAuth] = useState(false)
  const [myWorks, setMyWorks] = useState<Work[]>([])

  // New post form
  const [form, setForm] = useState<NewPostForm>({
    content: '',
    topImage: null,
    bottomImage: null,
    episodeTitle: '',
    workSummary: '',
    workTitle: '',
    coverImage: null,
  })

  // Episode form
  const [epForm, setEpForm] = useState<EpisodeForm>({
    workId: '',
    workTitle: '',
    content: '',
    topImage: null,
    bottomImage: null,
    episodeTitle: '',
    episodeNumber: 1,
  })

  const topImgRef = useRef<HTMLInputElement>(null)
  const bottomImgRef = useRef<HTMLInputElement>(null)
  const coverImgRef = useRef<HTMLInputElement>(null)

  const totalSteps = mode === 'new' ? 6 : 5

  useEffect(() => {
    if (user) fetchWorksByAuthor(user.uid).then(setMyWorks)
  }, [user])

  if (authLoading) return null

  if (!user) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 flex flex-col items-center text-center">
        <BookOpen size={48} className="text-gray-200 mb-4" />
        <h2 className="text-lg font-bold mb-2">{t(lang, 'post.needLogin')}</h2>
        <p className="text-sm text-gray-400 mb-6">{t(lang, 'post.needLoginDesc')}</p>
        <button
          onClick={() => setShowAuth(true)}
          className="px-6 py-3 rounded-xl text-sm font-semibold text-white"
          style={{ background: '#9043e1' }}
        >
          {t(lang, 'auth.createAccount')}
        </button>
        {showAuth && <AuthModal onClose={() => setShowAuth(false)} defaultMode="signup" />}
      </div>
    )
  }

  // Mode selection
  if (mode === 'select') {
    return (
      <div className="max-w-lg mx-auto px-4 py-8 pb-24">
        <h1 className="text-xl font-bold mb-2">{t(lang, 'post.title')}</h1>
        <p className="text-sm text-gray-400 mb-8">{t(lang, 'post.subtitle')}</p>
        <div className="flex flex-col gap-4">
          <button
            onClick={() => { setMode('new'); setStep(1) }}
            className="p-5 rounded-2xl border-2 border-gray-100 hover:border-[#9043e1]/40 hover:bg-purple-50/30 transition text-left group"
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform" style={{ background: '#9043e1' }}>
              <Plus size={22} className="text-white" />
            </div>
            <p className="font-bold">{t(lang, 'post.newWork')}</p>
            <p className="text-sm text-gray-400 mt-0.5">{t(lang, 'post.newWorkDesc')}</p>
          </button>
          <button
            onClick={() => { setMode('episode'); setStep(1) }}
            className="p-5 rounded-2xl border-2 border-gray-100 hover:border-[#9043e1]/40 hover:bg-purple-50/30 transition text-left group"
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform" style={{ background: '#7c3aed' }}>
              <BookOpen size={22} className="text-white" />
            </div>
            <p className="font-bold">{t(lang, 'post.addEpisode')}</p>
            <p className="text-sm text-gray-400 mt-0.5">{t(lang, 'post.addEpisodeDesc')}</p>
          </button>
        </div>
      </div>
    )
  }

  async function handlePublish() {
    if (!user) return
    setPublishing(true)
    try {
      if (mode === 'new') {
        const [topUrls, bottomUrls, coverUrl] = await Promise.all([
          form.topImage ? uploadImage(form.topImage, `episodes/${Date.now()}_top`) : Promise.resolve(''),
          form.bottomImage ? uploadImage(form.bottomImage, `episodes/${Date.now()}_bottom`) : Promise.resolve(''),
          form.coverImage ? uploadImage(form.coverImage, `covers/${Date.now()}`) : Promise.resolve(''),
        ])
        const workId = await createWork({
          title: form.workTitle,
          summary: form.workSummary || undefined,
          coverImageUrl: coverUrl || undefined,
          authorId: user.uid,
          authorName: user.displayName ?? 'ユーザー',
        })
        await createEpisode({
          workId,
          title: form.episodeTitle,
          content: form.content,
          topImages: topUrls ? [topUrls] : [],
          bottomImages: bottomUrls ? [bottomUrls] : [],
          episodeNumber: 1,
        })
      } else {
        const [topUrls, bottomUrls] = await Promise.all([
          epForm.topImage ? uploadImage(epForm.topImage, `episodes/${Date.now()}_top`) : Promise.resolve(''),
          epForm.bottomImage ? uploadImage(epForm.bottomImage, `episodes/${Date.now()}_bottom`) : Promise.resolve(''),
        ])
        await createEpisode({
          workId: epForm.workId,
          title: epForm.episodeTitle,
          content: epForm.content,
          topImages: topUrls ? [topUrls] : [],
          bottomImages: bottomUrls ? [bottomUrls] : [],
          episodeNumber: epForm.episodeNumber,
        })
      }
      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        setMode('select')
        setStep(1)
        setForm({ content: '', topImage: null, bottomImage: null, episodeTitle: '', workSummary: '', workTitle: '', coverImage: null })
        setEpForm({ workId: '', workTitle: '', content: '', topImage: null, bottomImage: null, episodeTitle: '', episodeNumber: 1 })
        router.push('/')
      }, 1500)
    } finally {
      setPublishing(false)
    }
  }

  const contentValid = (mode === 'new' ? form.content : epForm.content).length >= MIN_CHARS &&
    (mode === 'new' ? form.content : epForm.content).length <= MAX_CHARS
  const canPublish = mode === 'new'
    ? contentValid && form.workTitle.trim() && form.episodeTitle.trim() && form.coverImage
    : contentValid && epForm.workId && epForm.episodeTitle.trim()

  function ImageUploadArea({ label, file, onFile, inputRef }: {
    label: string
    file: File | null
    onFile: (f: File | null) => void
    inputRef: React.RefObject<HTMLInputElement | null>
  }) {
    return (
      <div>
        <p className="text-xs font-semibold text-gray-500 mb-2">{label}</p>
        {file ? (
          <div className="relative inline-block">
            <div className="relative w-[140px] h-[180px] rounded-xl overflow-hidden bg-gray-100">
              <Image src={URL.createObjectURL(file)} alt="" fill className="object-cover" />
            </div>
            <button
              onClick={() => onFile(null)}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gray-800 text-white flex items-center justify-center"
            >
              <X size={10} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => inputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-500 hover:border-[#9043e1]/40 hover:text-[#9043e1] transition"
          >
            <ImagePlus size={16} />
            {t(lang, 'post.selectImage')}
          </button>
        )}
        <input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f) }}
        />
      </div>
    )
  }

  const currentContent = mode === 'new' ? form.content : epForm.content
  const charCount = currentContent.length
  const charValid = charCount >= MIN_CHARS && charCount <= MAX_CHARS

  return (
    <>
      {/* Success overlay */}
      {success && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <CheckCircle size={64} className="text-[#9043e1]" />
            <p className="text-lg font-bold">{mode === 'new' ? t(lang, 'post.successNew') : t(lang, 'post.successEp')}</p>
            <p className="text-sm text-gray-400">{mode === 'new' ? t(lang, 'post.successNewSub') : t(lang, 'post.successEpSub')}</p>
          </div>
        </div>
      )}

      <div className="max-w-lg mx-auto px-4 py-6 pb-32">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => { if (step === 1) { setMode('select') } else { setStep((s) => (s - 1) as Step) } }}
            className="p-2 rounded-xl hover:bg-gray-50 transition text-gray-400 hover:text-gray-700"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex-1">
            <p className="text-xs text-gray-400">{lang === 'ja' ? `ステップ ${step} / ${totalSteps}` : `Step ${step} / ${totalSteps}`}</p>
            <div className="mt-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ background: '#9043e1', width: `${(step / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Steps — New Post */}
        {mode === 'new' && (
          <>
            {step === 1 && (
              <div>
                <h2 className="text-lg font-bold mb-1">{t(lang, 'post.step.content')}</h2>
                <p className="text-sm text-gray-400 mb-4">{t(lang, 'post.charCount')}</p>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                  placeholder={t(lang, 'post.contentPlaceholder')}
                  className={`w-full rounded-2xl border px-4 py-3 text-sm leading-7 resize-none outline-none transition focus:ring-2 ${
                    charCount > 0 && !charValid
                      ? 'border-red-300 focus:ring-red-100'
                      : 'border-gray-200 focus:border-[#9043e1] focus:ring-purple-100'
                  }`}
                  style={{ minHeight: 260 }}
                />
                <p className={`text-xs mt-1 text-right ${charValid ? 'text-[#9043e1]' : charCount > 0 ? 'text-red-400' : 'text-gray-300'}`}>
                  {charCount} {t(lang, 'post.charCount')}
                </p>
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 className="text-lg font-bold mb-1">{t(lang, 'post.step.image')}</h2>
                <p className="text-sm text-gray-400 mb-6">{t(lang, 'post.topImage')}</p>
                <div className="flex flex-col gap-6">
                  <ImageUploadArea
                    label={t(lang, 'post.topImage')}
                    file={form.topImage}
                    onFile={(f) => setForm((prev) => ({ ...prev, topImage: f }))}
                    inputRef={topImgRef}
                  />
                  <ImageUploadArea
                    label={t(lang, 'post.bottomImage')}
                    file={form.bottomImage}
                    onFile={(f) => setForm((prev) => ({ ...prev, bottomImage: f }))}
                    inputRef={bottomImgRef}
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <h2 className="text-lg font-bold mb-1">{t(lang, 'post.step.epTitle')}</h2>
                <p className="text-sm text-gray-400 mb-4">{t(lang, 'post.epTitlePlaceholder')}</p>
                <input
                  type="text"
                  placeholder={t(lang, 'post.epTitlePlaceholder')}
                  value={form.episodeTitle}
                  onChange={(e) => setForm((f) => ({ ...f, episodeTitle: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#9043e1] focus:ring-2 focus:ring-purple-100 transition mb-6"
                />
                <p className="text-xs font-semibold text-gray-500 mb-2">{t(lang, 'post.summary')}</p>
                <textarea
                  placeholder={t(lang, 'post.summaryDesc')}
                  value={form.workSummary}
                  onChange={(e) => setForm((f) => ({ ...f, workSummary: e.target.value }))}
                  rows={4}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#9043e1] focus:ring-2 focus:ring-purple-100 transition resize-none"
                />
              </div>
            )}

            {step === 4 && (
              <div>
                <h2 className="text-lg font-bold mb-1">{t(lang, 'post.step.workInfo')}</h2>
                <p className="text-sm text-gray-400 mb-4">{t(lang, 'post.workTitlePlaceholder')}</p>
                <input
                  type="text"
                  placeholder={t(lang, 'post.workTitlePlaceholder')}
                  value={form.workTitle}
                  onChange={(e) => setForm((f) => ({ ...f, workTitle: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#9043e1] focus:ring-2 focus:ring-purple-100 transition mb-6"
                />
                <p className="text-xs font-semibold text-gray-500 mb-2">{t(lang, 'post.coverImage')}</p>
                {form.coverImage ? (
                  <div className="relative inline-block">
                    <div className="relative w-36 rounded-2xl overflow-hidden bg-gray-100" style={{ aspectRatio: '3/4' }}>
                      <Image src={URL.createObjectURL(form.coverImage)} alt="" fill className="object-cover" />
                    </div>
                    <button
                      onClick={() => setForm((f) => ({ ...f, coverImage: null }))}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gray-800 text-white flex items-center justify-center"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => coverImgRef.current?.click()}
                    className="relative w-36 rounded-2xl overflow-hidden bg-gray-50 border-2 border-dashed border-gray-200 hover:border-[#9043e1]/40 transition flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-[#9043e1]"
                    style={{ aspectRatio: '3/4' }}
                  >
                    <ImagePlus size={24} />
                    <p className="text-xs">{t(lang, 'post.selectCover')}</p>
                  </button>
                )}
                <input
                  ref={coverImgRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) setForm((prev) => ({ ...prev, coverImage: f })) }}
                />
              </div>
            )}

            {step === 5 && (
              <div>
                <h2 className="text-lg font-bold mb-4">{t(lang, 'post.step.preview')}</h2>
                <div className="space-y-4">
                  {form.coverImage && (
                    <div className="relative w-full rounded-2xl overflow-hidden" style={{ aspectRatio: '3/4', maxWidth: 160 }}>
                      <Image src={URL.createObjectURL(form.coverImage)} alt="" fill className="object-cover" />
                    </div>
                  )}
                  <div>
                    <p className="text-xl font-bold">{form.workTitle || `(${t(lang, 'post.workTitle')})`}</p>
                    {form.workSummary && <p className="text-sm text-gray-500 mt-1">{form.workSummary}</p>}
                  </div>
                  <p className="text-sm font-semibold text-[#9043e1]">{form.episodeTitle || `(${t(lang, 'post.epTitle')})`}</p>
                  {form.topImage && (
                    <div className="relative w-full rounded-xl overflow-hidden" style={{ aspectRatio: '4/3' }}>
                      <Image src={URL.createObjectURL(form.topImage)} alt="" fill className="object-cover" />
                    </div>
                  )}
                  <p className="text-sm leading-7 text-gray-700 whitespace-pre-wrap">{form.content}</p>
                  {form.bottomImage && (
                    <div className="relative w-full rounded-xl overflow-hidden" style={{ aspectRatio: '4/3' }}>
                      <Image src={URL.createObjectURL(form.bottomImage)} alt="" fill className="object-cover" />
                    </div>
                  )}
                </div>
              </div>
            )}

            {step === 6 && (
              <div>
                <h2 className="text-lg font-bold mb-1">{t(lang, 'post.step.publish')}</h2>
                <p className="text-sm text-gray-400 mb-4">{t(lang, 'post.step.preview')}</p>
                <div className="bg-gray-50 rounded-2xl p-4 space-y-2 text-sm mb-6">
                  <div className="flex justify-between"><span className="text-gray-500">{t(lang, 'post.cover')}</span><span className={form.coverImage ? 'text-gray-700' : 'text-red-400'}>{form.coverImage ? t(lang, 'post.set') : t(lang, 'post.notSet')}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">{t(lang, 'post.workTitle')}</span><span className={form.workTitle ? 'text-gray-700' : 'text-red-400'}>{form.workTitle || `(${t(lang, 'post.notSet')})`}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">{t(lang, 'post.epTitle')}</span><span className={form.episodeTitle ? 'text-gray-700' : 'text-red-400'}>{form.episodeTitle || `(${t(lang, 'post.notSet')})`}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">{t(lang, 'post.charLabel')}</span><span className={charValid ? 'text-gray-700' : 'text-red-400'}>{charCount}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">{t(lang, 'post.topImageLabel')}</span><span className="text-gray-700">{form.topImage ? '1' : t(lang, 'post.none')}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">{t(lang, 'post.bottomImageLabel')}</span><span className="text-gray-700">{form.bottomImage ? '1' : t(lang, 'post.none')}</span></div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Steps — Episode */}
        {mode === 'episode' && (
          <>
            {step === 1 && (
              <div>
                <h2 className="text-lg font-bold mb-1">{t(lang, 'post.selectWork')}</h2>
                <p className="text-sm text-gray-400 mb-4">{t(lang, 'post.selectWorkDesc')}</p>
                {myWorks.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-8">{t(lang, 'post.noWorks')}</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {myWorks.map((w) => (
                      <button
                        key={w.id}
                        onClick={() => setEpForm((f) => ({ ...f, workId: w.id, workTitle: w.title, episodeNumber: 99 }))}
                        className={`flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition ${
                          epForm.workId === w.id ? 'border-[#9043e1] bg-purple-50/30' : 'border-gray-100 hover:border-gray-200'
                        }`}
                      >
                        <div className="relative w-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0" style={{ aspectRatio: '3/4' }}>
                          {w.coverImageUrl && <Image src={w.coverImageUrl} alt="" fill className="object-cover" />}
                        </div>
                        <p className="text-sm font-semibold">{w.title}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 className="text-lg font-bold mb-1">{t(lang, 'post.step.content')}</h2>
                <p className="text-sm text-gray-400 mb-4">{t(lang, 'post.charCount')}</p>
                <textarea
                  value={epForm.content}
                  onChange={(e) => setEpForm((f) => ({ ...f, content: e.target.value }))}
                  placeholder={t(lang, 'post.continuePlaceholder')}
                  className={`w-full rounded-2xl border px-4 py-3 text-sm leading-7 resize-none outline-none transition focus:ring-2 ${
                    epForm.content.length > 0 && !charValid
                      ? 'border-red-300 focus:ring-red-100'
                      : 'border-gray-200 focus:border-[#9043e1] focus:ring-purple-100'
                  }`}
                  style={{ minHeight: 260 }}
                />
                <p className={`text-xs mt-1 text-right ${charValid ? 'text-[#9043e1]' : epForm.content.length > 0 ? 'text-red-400' : 'text-gray-300'}`}>
                  {epForm.content.length} {t(lang, 'post.charCount')}
                </p>
              </div>
            )}

            {step === 3 && (
              <div>
                <h2 className="text-lg font-bold mb-1">{t(lang, 'post.step.image')}</h2>
                <p className="text-sm text-gray-400 mb-6">{t(lang, 'post.topImage')}</p>
                <div className="flex flex-col gap-6">
                  <ImageUploadArea
                    label={t(lang, 'post.topImage')}
                    file={epForm.topImage}
                    onFile={(f) => setEpForm((prev) => ({ ...prev, topImage: f }))}
                    inputRef={topImgRef}
                  />
                  <ImageUploadArea
                    label={t(lang, 'post.bottomImage')}
                    file={epForm.bottomImage}
                    onFile={(f) => setEpForm((prev) => ({ ...prev, bottomImage: f }))}
                    inputRef={bottomImgRef}
                  />
                </div>
              </div>
            )}

            {step === 4 && (
              <div>
                <h2 className="text-lg font-bold mb-1">{t(lang, 'post.step.epTitle')}</h2>
                <p className="text-sm text-gray-400 mb-4">{t(lang, 'post.epTitlePlaceholder')}</p>
                <input
                  type="text"
                  placeholder={t(lang, 'post.epTitlePlaceholder')}
                  value={epForm.episodeTitle}
                  onChange={(e) => setEpForm((f) => ({ ...f, episodeTitle: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#9043e1] focus:ring-2 focus:ring-purple-100 transition"
                />
              </div>
            )}

            {step === 5 && (
              <div>
                <h2 className="text-lg font-bold mb-1">{t(lang, 'post.step.publish')}</h2>
                <p className="text-sm text-gray-400 mb-4">{t(lang, 'post.step.preview')}</p>
                <div className="bg-gray-50 rounded-2xl p-4 space-y-2 text-sm mb-6">
                  <div className="flex justify-between"><span className="text-gray-500">{t(lang, 'post.workTitle')}</span><span className="text-gray-700">{epForm.workTitle}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">{t(lang, 'post.epTitle')}</span><span className={epForm.episodeTitle ? 'text-gray-700' : 'text-red-400'}>{epForm.episodeTitle || `(${t(lang, 'post.notSet')})`}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">{t(lang, 'post.charLabel')}</span><span className={charValid ? 'text-gray-700' : 'text-red-400'}>{epForm.content.length}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">{t(lang, 'post.topImageLabel')}</span><span className="text-gray-700">{epForm.topImage ? '1' : t(lang, 'post.none')}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">{t(lang, 'post.bottomImageLabel')}</span><span className="text-gray-700">{epForm.bottomImage ? '1' : t(lang, 'post.none')}</span></div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Navigation */}
        <div className="fixed bottom-16 md:bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-100 px-4 py-3 flex gap-3 max-w-lg mx-auto">
          {step < totalSteps ? (
            <button
              onClick={() => setStep((s) => (s + 1) as Step)}
              className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl text-sm font-semibold text-white transition"
              style={{ background: '#9043e1' }}
            >
              {t(lang, 'post.next')}
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={handlePublish}
              disabled={!canPublish || publishing}
              className="flex-1 py-3 rounded-xl text-sm font-semibold text-white transition disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: '#9043e1' }}
            >
              {publishing ? t(lang, 'post.publishing') : t(lang, 'post.publish')}
            </button>
          )}
        </div>
      </div>
    </>
  )
}
