'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Settings, UserPlus, UserCheck, BookOpen, Heart } from 'lucide-react'
import {
  fetchUser,
  fetchWorksByAuthor,
  fetchLikedWorks,
  getFollowCounts,
  toggleFollow,
  isFollowing,
} from '@/lib/firestore'
import { useAuth } from '@/hooks/useAuth'
import { useLang } from '@/contexts/LangContext'
import { t } from '@/lib/i18n'
import WorkCard from '@/components/WorkCard'
import AuthModal from '@/components/AuthModal'
import type { User, Work } from '@/types'

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { user: currentUser } = useAuth()
  const { lang } = useLang()

  const [profileUser, setProfileUser] = useState<User | null>(null)
  const [works, setWorks] = useState<Work[]>([])
  const [likedWorks, setLikedWorks] = useState<Work[]>([])
  const [followCounts, setFollowCounts] = useState({ followers: 0, following: 0 })
  const [following, setFollowing] = useState(false)
  const [activeTab, setActiveTab] = useState<'works' | 'likes'>('works')
  const [loading, setLoading] = useState(true)
  const [showAuth, setShowAuth] = useState(false)

  const isSelf = currentUser?.uid === id

  useEffect(() => {
    async function load() {
      const [u, ws, lw, fc] = await Promise.all([
        fetchUser(id),
        fetchWorksByAuthor(id),
        fetchLikedWorks(id),
        getFollowCounts(id),
      ])
      setProfileUser(u)
      setWorks(ws)
      setLikedWorks(lw)
      setFollowCounts(fc)
      if (currentUser && !isSelf) {
        setFollowing(await isFollowing(currentUser.uid, id))
      }
      setLoading(false)
    }
    load()
  }, [id, currentUser, isSelf])

  async function handleFollow() {
    if (!currentUser) { setShowAuth(true); return }
    const now = await toggleFollow(currentUser.uid, id)
    setFollowing(now)
    setFollowCounts((fc) => ({
      ...fc,
      followers: fc.followers + (now ? 1 : -1),
    }))
  }

  const totalViews = works.reduce((a, w) => a + w.viewCount, 0)
  const totalLikes = works.reduce((a, w) => a + w.likeCount, 0)

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gray-100" />
            <div className="flex-1 space-y-2">
              <div className="h-5 w-1/3 bg-gray-100 rounded" />
              <div className="h-3 w-1/2 bg-gray-100 rounded" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!profileUser) {
    return <div className="flex justify-center py-24 text-gray-400">{t(lang, 'profile.notFound')}</div>
  }

  return (
    <>
      <div className="max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-6">
        {/* Header */}
        <div className="flex items-start gap-4 mb-6">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex-shrink-0 overflow-hidden flex items-center justify-center text-2xl font-bold text-gray-300">
            {profileUser.profileImageUrl ? (
              <Image
                src={profileUser.profileImageUrl}
                alt={profileUser.displayName ?? ''}
                width={80}
                height={80}
                className="object-cover"
              />
            ) : (
              (profileUser.displayName?.[0] ?? '?').toUpperCase()
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h1 className="text-lg font-bold">{profileUser.displayName ?? '名前なし'}</h1>
                {profileUser.bio && (
                  <p className="text-sm text-gray-500 mt-1 leading-relaxed">{profileUser.bio}</p>
                )}
              </div>
              {isSelf ? (
                <Link
                  href="/settings"
                  className="p-2 rounded-xl border border-gray-200 text-gray-400 hover:text-[#9043e1] hover:border-[#9043e1] transition"
                >
                  <Settings size={17} />
                </Link>
              ) : (
                <button
                  onClick={handleFollow}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition ${
                    following
                      ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      : 'text-white'
                  }`}
                  style={following ? {} : { background: '#9043e1' }}
                >
                  {following ? <UserCheck size={15} /> : <UserPlus size={15} />}
                  {following ? t(lang, 'profile.following') : t(lang, 'profile.follow')}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-5 gap-2 mb-6 p-4 bg-gray-50 rounded-2xl text-center">
          {[
            { labelKey: 'profile.workCount' as const, value: works.length },
            { labelKey: 'profile.followers' as const, value: followCounts.followers },
            { labelKey: 'profile.following' as const, value: followCounts.following },
            { labelKey: 'profile.views' as const, value: totalViews },
            { labelKey: 'profile.likes' as const, value: totalLikes },
          ].map(({ labelKey, value }) => (
            <div key={labelKey}>
              <p className="text-sm font-bold">{value}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{t(lang, labelKey)}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 mb-5">
          {(['works', 'likes'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-[#9043e1] text-[#9043e1]'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab === 'works' ? `${t(lang, 'profile.works')} (${works.length})` : `${t(lang, 'profile.likes')} (${likedWorks.length})`}
            </button>
          ))}
        </div>

        {/* Work grids */}
        {activeTab === 'works' ? (
          works.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-gray-400">
              <BookOpen size={36} className="mb-2 opacity-30" />
              <p className="text-sm">{t(lang, 'profile.noWorks')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {works.map((work) => <WorkCard key={work.id} work={work} />)}
            </div>
          )
        ) : likedWorks.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-gray-400">
            <Heart size={36} className="mb-2 opacity-30" />
            <p className="text-sm">{t(lang, 'profile.noLikes')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {likedWorks.map((work) => <WorkCard key={work.id} work={work} />)}
          </div>
        )}
      </div>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  )
}
