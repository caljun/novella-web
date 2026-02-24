'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, X } from 'lucide-react'
import { searchWorks } from '@/lib/firestore'
import WorkCard from '@/components/WorkCard'
import { useLang } from '@/contexts/LangContext'
import { t } from '@/lib/i18n'
import type { Work } from '@/types'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Work[]>([])
  const [loading, setLoading] = useState(false)
  const { lang } = useLang()
  const inputRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (!query.trim()) { setResults([]); return }
    setLoading(true)
    timerRef.current = setTimeout(async () => {
      const res = await searchWorks(query.trim())
      setResults(res)
      setLoading(false)
    }, 350)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [query])

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-6">
      {/* Search bar */}
      <div className="relative mb-6">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t(lang, 'search.placeholder')}
          className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-10 pr-10 py-3 text-sm outline-none focus:border-[#9043e1] focus:ring-2 focus:ring-purple-100 transition"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-gray-400 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Results */}
      {!query.trim() ? (
        <div className="flex flex-col items-center py-16 text-gray-400">
          <Search size={40} className="mb-3 opacity-30" />
          <p className="text-sm">{t(lang, 'search.hint')}</p>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-100 rounded-xl" style={{ aspectRatio: '3/4' }} />
              <div className="mt-1.5 h-3 bg-gray-100 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : results.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-gray-400">
          <p className="text-sm">「{query}」 — {t(lang, 'search.noResults')}</p>
        </div>
      ) : (
        <>
          <p className="text-xs text-gray-400 mb-3">{results.length} {t(lang, 'search.results')}</p>
          <div className="grid grid-cols-3 gap-3">
            {results.map((work) => (
              <WorkCard key={work.id} work={work} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
