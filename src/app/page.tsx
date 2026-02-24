'use client'

import { useEffect, useState, useCallback } from 'react'
import { RefreshCw } from 'lucide-react'
import { subscribeWorks } from '@/lib/firestore'
import WorkCard from '@/components/WorkCard'
import { useLang } from '@/contexts/LangContext'
import { t } from '@/lib/i18n'
import type { Work } from '@/types'

export default function HomePage() {
  const [works, setWorks] = useState<Work[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const { lang } = useLang()

  useEffect(() => {
    const unsub = subscribeWorks((w) => {
      setWorks(w)
      setLoading(false)
    })
    return unsub
  }, [])

  const handleRefresh = useCallback(() => {
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 800)
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-24 md:pb-12">

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-tight">{t(lang, 'home.title')}</h1>
        <button
          onClick={handleRefresh}
          className={`p-2 rounded-full text-gray-400 hover:text-[#9043e1] hover:bg-purple-50 transition-all ${refreshing ? 'animate-spin text-[#9043e1]' : ''}`}
        >
          <RefreshCw size={17} />
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-100 rounded-xl" style={{ aspectRatio: '3/4' }} />
              <div className="mt-2 h-3 bg-gray-100 rounded w-4/5" />
              <div className="mt-1 h-2.5 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : works.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-gray-400">
          <span className="text-6xl mb-4 opacity-50">📚</span>
          <p className="text-base font-medium">{t(lang, 'home.empty')}</p>
          <p className="text-sm mt-1">{t(lang, 'home.emptyHint')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {works.map((work) => (
            <WorkCard key={work.id} work={work} />
          ))}
        </div>
      )}
    </div>
  )
}
