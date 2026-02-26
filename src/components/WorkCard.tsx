import Link from 'next/link'
import Image from 'next/image'
import { Eye, Heart } from 'lucide-react'
import type { Work } from '@/types'

interface Props {
  work: Work
}

export default function WorkCard({ work }: Props) {
  return (
    <Link href={`/works/${work.id}`} className="group block">
      {/* Cover: 3:4 aspect ratio */}
      <div className="relative w-full overflow-hidden rounded-xl bg-gray-100" style={{ aspectRatio: '3/4' }}>
        {work.coverImageUrl ? (
          <Image
            src={work.coverImageUrl}
            alt={work.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 20vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-gray-300 text-3xl">📖</span>
          </div>
        )}
        {/* Subtle overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 rounded-xl" />
      </div>

      {/* Info */}
      <div className="mt-1.5 px-0.5">
        <p className="text-xs font-semibold text-gray-900 line-clamp-1 leading-snug">{work.title}</p>
        <div className="flex items-center gap-2 mt-1 text-gray-400">
          <span className="flex items-center gap-0.5 text-[10px]">
            <Eye size={10} />
            {work.viewCount}
          </span>
          <span className="flex items-center gap-0.5 text-[10px]">
            <Heart size={10} />
            {work.likeCount}
          </span>
        </div>
      </div>
    </Link>
  )
}
