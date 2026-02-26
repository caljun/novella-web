'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, Heart, MessageCircle, Send, Trash2, X, ChevronRight, Edit2 } from 'lucide-react'
import {
  fetchEpisode,
  fetchWork,
  fetchEpisodes,
  toggleEpisodeLike,
  isEpisodeLiked,
  subscribeComments,
  addComment,
  deleteComment,
  incrementViewCount,
} from '@/lib/firestore'
import { useAuth } from '@/hooks/useAuth'
import { useLang } from '@/contexts/LangContext'
import { t } from '@/lib/i18n'
import AuthModal from '@/components/AuthModal'
import type { Episode, Work, Comment } from '@/types'

export default function EpisodeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { user } = useAuth()
  const { lang } = useLang()

  const [episode, setEpisode] = useState<Episode | null>(null)
  const [work, setWork] = useState<Work | null>(null)
  const [allEpisodes, setAllEpisodes] = useState<Episode[]>([])
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [comments, setComments] = useState<Comment[]>([])
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showAuth, setShowAuth] = useState(false)

  useEffect(() => {
    setLoading(true)
    async function load() {
      const ep = await fetchEpisode(id)
      if (!ep) { setLoading(false); return }
      const [w, eps] = await Promise.all([fetchWork(ep.workId), fetchEpisodes(ep.workId)])
      setEpisode(ep)
      setWork(w)
      setAllEpisodes(eps)
      setLikeCount(ep.likeCount)
      setLoading(false)
      incrementViewCount(ep.workId)
      if (user) setLiked(await isEpisodeLiked(id, user.uid))
    }
    load()
  }, [id, user])

  useEffect(() => {
    const unsub = subscribeComments(id, setComments)
    return unsub
  }, [id])

  // Scroll to top when episode changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [id])

  async function handleLike() {
    if (!user) { setShowAuth(true); return }
    const nowLiked = await toggleEpisodeLike(id, user.uid)
    setLiked(nowLiked)
    setLikeCount((c) => c + (nowLiked ? 1 : -1))
  }

  async function handleComment() {
    if (!user) { setShowAuth(true); return }
    if (!commentText.trim()) return
    setSubmitting(true)
    await addComment({
      episodeId: id,
      userId: user.uid,
      userName: user.displayName ?? 'ユーザー',
      userProfileImageUrl: user.photoURL ?? undefined,
      content: commentText.trim(),
    })
    setCommentText('')
    setSubmitting(false)
  }

  const currentIndex = allEpisodes.findIndex((ep) => ep.id === id)
  const prevEpisode = currentIndex > 0 ? allEpisodes[currentIndex - 1] : null
  const nextEpisode = currentIndex < allEpisodes.length - 1 ? allEpisodes[currentIndex + 1] : null

  if (loading) return <ReadingSkeleton />
  if (!episode) return <div className="flex justify-center py-24 text-gray-400">{t(lang, 'episode.notFound')}</div>

  return (
    <>
      <div className="min-h-screen">
        {/* Reading layout */}
        <div className="max-w-2xl mx-auto px-4 sm:px-8 py-10 pb-32 md:pb-16">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-8">
            <button onClick={() => router.back()} className="hover:text-[#9043e1] transition-colors">
              <ChevronLeft size={16} className="inline -mt-0.5" />
              {t(lang, 'episode.back')}
            </button>
            {work && (
              <>
                <span>/</span>
                <Link href={`/works/${work.id}`} className="hover:text-[#9043e1] transition-colors truncate max-w-[200px]">
                  {work.title}
                </Link>
              </>
            )}
          </div>

          {/* Episode header */}
          <div className="mb-10">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-[#9043e1] tracking-widest uppercase mb-2">
                  {lang === 'ja' ? `第${episode.episodeNumber}話` : `Episode ${episode.episodeNumber}`}
                </p>
                <h1 className="text-2xl sm:text-3xl font-bold leading-snug">{episode.title}</h1>
                {work && (
                  <Link href={`/profile/${work.authorId}`} className="inline-block mt-2 text-sm text-gray-400 hover:text-[#9043e1] transition-colors">
                    {work.authorName}
                  </Link>
                )}
              </div>
              {work?.authorId === user?.uid && (
                <Link
                  href={`/episodes/${id}/edit`}
                  className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-500 hover:text-[#9043e1] hover:border-[#9043e1] transition"
                >
                  <Edit2 size={13} />
                  {t(lang, 'episode.edit')}
                </Link>
              )}
            </div>
          </div>

          {/* Top images */}
          {episode.topImages.map((url, i) => (
            <div key={i} className="relative w-full rounded-2xl overflow-hidden mb-8 bg-gray-50" style={{ aspectRatio: '4/3' }}>
              <Image src={url} alt="" fill className="object-cover" />
            </div>
          ))}

          {/* Body text — reading-optimized */}
          <div
            className="text-[17px] leading-[2] text-gray-800 whitespace-pre-wrap mb-10 tracking-wide"
            style={{ wordBreak: 'break-word', fontFamily: "'Hiragino Mincho ProN', 'Yu Mincho', Georgia, serif" }}
          >
            {episode.content}
          </div>

          {/* Bottom images */}
          {episode.bottomImages.map((url, i) => (
            <div key={i} className="relative w-full rounded-2xl overflow-hidden mb-8 bg-gray-50" style={{ aspectRatio: '4/3' }}>
              <Image src={url} alt="" fill className="object-cover" />
            </div>
          ))}

          {/* Action bar */}
          <div className="flex items-center gap-3 pt-6 border-t border-gray-100 mb-10">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
                liked
                  ? 'bg-red-50 text-red-500 border border-red-200'
                  : 'bg-gray-50 text-gray-500 border border-gray-200 hover:border-red-200 hover:text-red-400'
              }`}
            >
              <Heart size={15} fill={liked ? 'currentColor' : 'none'} />
              {likeCount}
            </button>
            <button
              onClick={() => setShowComments(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold bg-gray-50 text-gray-500 border border-gray-200 hover:border-[#9043e1]/40 hover:text-[#9043e1] transition-all"
            >
              <MessageCircle size={15} />
              {comments.length}
            </button>
          </div>

          {/* Prev / Next navigation */}
          <div className="grid grid-cols-2 gap-3">
            {prevEpisode ? (
              <Link
                href={`/episodes/${prevEpisode.id}`}
                className="flex items-center gap-2 p-4 rounded-2xl border border-gray-100 hover:border-[#9043e1]/30 hover:bg-purple-50/30 transition group"
              >
                <ChevronLeft size={16} className="text-gray-300 group-hover:text-[#9043e1] flex-shrink-0 transition" />
                <div className="min-w-0">
                  <p className="text-[10px] text-gray-400 mb-0.5">{t(lang, 'episode.prev')}</p>
                  <p className="text-xs font-semibold truncate group-hover:text-[#9043e1] transition">{prevEpisode.title}</p>
                </div>
              </Link>
            ) : <div />}

            {nextEpisode ? (
              <Link
                href={`/episodes/${nextEpisode.id}`}
                className="flex items-center justify-end gap-2 p-4 rounded-2xl border border-gray-100 hover:border-[#9043e1]/30 hover:bg-purple-50/30 transition text-right group"
              >
                <div className="min-w-0">
                  <p className="text-[10px] text-gray-400 mb-0.5">{t(lang, 'episode.next')}</p>
                  <p className="text-xs font-semibold truncate group-hover:text-[#9043e1] transition">{nextEpisode.title}</p>
                </div>
                <ChevronRight size={16} className="text-gray-300 group-hover:text-[#9043e1] flex-shrink-0 transition" />
              </Link>
            ) : (
              work && (
                <Link
                  href={`/works/${work.id}`}
                  className="flex items-center justify-end gap-2 p-4 rounded-2xl border border-gray-100 hover:border-[#9043e1]/30 hover:bg-purple-50/30 transition text-right group"
                >
                  <div>
                    <p className="text-[10px] text-gray-400 mb-0.5">{t(lang, 'episode.toWork')}</p>
                    <p className="text-xs font-semibold group-hover:text-[#9043e1] transition">{t(lang, 'episode.tableOfContents')}</p>
                  </div>
                  <ChevronRight size={16} className="text-gray-300 group-hover:text-[#9043e1] flex-shrink-0 transition" />
                </Link>
              )
            )}
          </div>
        </div>
      </div>

      {/* Comments drawer */}
      {showComments && (
        <div className="fixed inset-0 z-40 flex items-end sm:items-center sm:justify-end">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowComments(false)} />
          <div className="relative w-full sm:w-96 sm:h-full sm:max-h-full bg-white sm:rounded-none rounded-t-3xl shadow-2xl flex flex-col max-h-[75vh] sm:max-h-full sm:border-l sm:border-gray-100">
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100 flex-shrink-0">
              <h3 className="font-bold text-base">{lang === 'ja' ? 'コメント' : 'Comments'} <span className="text-gray-400 font-normal text-sm">({comments.length})</span></h3>
              <button onClick={() => setShowComments(false)} className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
              {comments.length === 0 ? (
                <div className="flex flex-col items-center py-12 text-gray-400">
                  <MessageCircle size={32} className="mb-2 opacity-30" />
                  <p className="text-sm">{t(lang, 'episode.noComments')}</p>
                </div>
              ) : comments.map((c) => (
                <div key={c.id} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex-shrink-0 flex items-center justify-center text-xs font-bold text-gray-400 overflow-hidden">
                    {c.userProfileImageUrl ? (
                      <Image src={c.userProfileImageUrl} alt={c.userName} width={32} height={32} className="object-cover" />
                    ) : (c.userName[0]?.toUpperCase())}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-700 mb-0.5">{c.userName}</p>
                    <p className="text-sm text-gray-600 leading-relaxed">{c.content}</p>
                  </div>
                  {c.userId === user?.uid && (
                    <button onClick={() => deleteComment(c.id, id)} className="p-1 text-gray-300 hover:text-red-400 transition flex-shrink-0">
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="px-4 py-3 border-t border-gray-100 flex-shrink-0 flex items-center gap-2">
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleComment() } }}
                placeholder={t(lang, 'episode.commentPlaceholder')}
                className="flex-1 bg-gray-50 rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-100 transition"
              />
              <button
                onClick={handleComment}
                disabled={!commentText.trim() || submitting}
                className="w-9 h-9 rounded-full flex items-center justify-center text-white transition disabled:opacity-40 flex-shrink-0"
                style={{ background: '#9043e1' }}
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} defaultMode="signup" />}
    </>
  )
}

function ReadingSkeleton() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-8 py-10 animate-pulse">
      <div className="h-4 w-32 bg-gray-100 rounded mb-8" />
      <div className="h-8 w-2/3 bg-gray-100 rounded mb-3" />
      <div className="h-4 w-24 bg-gray-100 rounded mb-10" />
      <div className="space-y-3">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="h-5 bg-gray-100 rounded" style={{ width: `${65 + (i % 3) * 12}%` }} />
        ))}
      </div>
    </div>
  )
}
