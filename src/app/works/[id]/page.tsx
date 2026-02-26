'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Eye, Heart, ChevronLeft, Edit2, BookOpen, ChevronRight } from 'lucide-react'
import { fetchWork, fetchEpisodes } from '@/lib/firestore'
import { useAuth } from '@/hooks/useAuth'
import { useLang } from '@/contexts/LangContext'
import { t } from '@/lib/i18n'
import type { Work, Episode } from '@/types'

export default function WorkDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { user } = useAuth()
  const { lang } = useLang()
  const [work, setWork] = useState<Work | null>(null)
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [w, eps] = await Promise.all([fetchWork(id), fetchEpisodes(id)])
      setWork(w)
      setEpisodes(eps)
      setLoading(false)
    }
    load()
  }, [id, user])

  if (loading) return <WorkSkeleton />
  if (!work) return <div className="flex justify-center py-24 text-gray-400">{t(lang, 'work.notFound')}</div>

  const totalLikes = episodes.reduce((acc, ep) => acc + ep.likeCount, 0)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 pb-24 md:pb-12">

      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 text-sm text-gray-400 hover:text-[#9043e1] mb-8 transition-colors"
      >
        <ChevronLeft size={16} />
        {t(lang, 'work.back')}
      </button>

      {/* Hero */}
      <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 mb-10">
        {/* Cover */}
        <div className="relative w-40 sm:w-48 flex-shrink-0 rounded-2xl overflow-hidden bg-gray-100 self-start mx-auto sm:mx-0 shadow-sm" style={{ aspectRatio: '3/4' }}>
          {work.coverImageUrl ? (
            <Image src={work.coverImageUrl} alt={work.title} fill className="object-cover" sizes="192px" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-4xl text-gray-200">📖</div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold leading-snug mb-2">{work.title}</h1>
          <Link href={`/profile/${work.authorId}`} className="text-sm font-medium hover:underline" style={{ color: '#9043e1' }}>
            {work.authorName}
          </Link>

          <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
            <span className="flex items-center gap-1.5"><Eye size={14} />{work.viewCount.toLocaleString()}</span>
            <span className="flex items-center gap-1.5"><Heart size={14} />{totalLikes.toLocaleString()}</span>
            <span className="flex items-center gap-1.5"><BookOpen size={14} />{episodes.length}{lang === 'ja' ? '話' : ' eps'}</span>
          </div>

          {work.summary && (
            <p className="mt-4 text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{work.summary}</p>
          )}

          <div className="flex items-center gap-3 mt-6">
            {episodes.length > 0 && (
              <Link
                href={`/episodes/${episodes[0].id}`}
                className="px-5 py-2.5 rounded-full text-sm font-semibold text-white transition hover:opacity-90"
                style={{ background: '#9043e1' }}
              >
                {t(lang, 'work.readFirst')}
              </Link>
            )}
            {work.authorId === user?.uid && (
              <Link
                href={`/works/${work.id}/edit`}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-medium border border-gray-200 text-gray-600 hover:border-[#9043e1] hover:text-[#9043e1] transition"
              >
                <Edit2 size={13} />
                {t(lang, 'work.edit')}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Episodes */}
      <div>
        <h2 className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-3">{t(lang, 'work.episodeList')}</h2>
        {episodes.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-10">{t(lang, 'work.noEpisodes')}</p>
        ) : (
          <div className="flex flex-col divide-y divide-gray-50">
            {episodes.map((ep) => (
              <Link
                key={ep.id}
                href={`/episodes/${ep.id}`}
                className="flex items-center gap-4 py-3.5 hover:bg-gray-50 -mx-3 px-3 rounded-xl transition group"
              >
                <span className="text-xs font-bold text-gray-200 w-7 text-right flex-shrink-0">{ep.episodeNumber}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold group-hover:text-[#9043e1] transition truncate">{ep.title}</p>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><Heart size={10} />{ep.likeCount}</span>
                    <span>💬 {ep.commentCount}</span>
                  </div>
                </div>
                <ChevronRight size={15} className="text-gray-200 group-hover:text-[#9043e1] flex-shrink-0 transition" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function WorkSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 animate-pulse">
      <div className="h-4 w-16 bg-gray-100 rounded mb-8" />
      <div className="flex gap-8 mb-10">
        <div className="w-48 bg-gray-100 rounded-2xl flex-shrink-0" style={{ aspectRatio: '3/4' }} />
        <div className="flex-1 space-y-3 pt-2">
          <div className="h-8 w-2/3 bg-gray-100 rounded" />
          <div className="h-4 w-1/4 bg-gray-100 rounded" />
          <div className="h-4 w-1/3 bg-gray-100 rounded" />
          <div className="space-y-2 mt-4">
            {[80, 90, 70].map((w, i) => (
              <div key={i} className="h-3 bg-gray-100 rounded" style={{ width: `${w}%` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
