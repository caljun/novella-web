import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export const metadata = { title: '利用規約 | Novella' }

export default function TermsPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 pb-16">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-[#9043e1] mb-8 transition-colors">
        <ChevronLeft size={15} />
        ホームに戻る
      </Link>
      <h1 className="text-2xl font-bold mb-2">利用規約</h1>
      <p className="text-sm text-gray-400 mb-8">最終更新日: 2025年1月</p>

      <div className="prose prose-sm max-w-none text-gray-700 space-y-6">
        <section>
          <h2 className="text-base font-bold text-gray-900 mb-2">第1条（適用）</h2>
          <p className="leading-relaxed">本規約は、Novella（以下「本サービス」）の利用条件を定めるものです。登録ユーザーの皆さまには、本規約に従って本サービスをご利用いただきます。</p>
        </section>
        <section>
          <h2 className="text-base font-bold text-gray-900 mb-2">第2条（禁止事項）</h2>
          <p className="leading-relaxed">ユーザーは以下の行為をしてはなりません。</p>
          <ul className="list-disc list-inside space-y-1 mt-2 text-sm">
            <li>法令または公序良俗に違反する行為</li>
            <li>他のユーザーへの誹謗中傷・ハラスメント</li>
            <li>著作権等の知的財産権を侵害する行為</li>
            <li>性的・暴力的なコンテンツの投稿</li>
            <li>スパム・商業的勧誘行為</li>
          </ul>
        </section>
        <section>
          <h2 className="text-base font-bold text-gray-900 mb-2">第3条（コンテンツの権利）</h2>
          <p className="leading-relaxed">ユーザーが投稿した作品の著作権はユーザー自身に帰属します。ただし、本サービスの運営・宣伝のために必要な範囲で利用することができるものとします。</p>
        </section>
        <section>
          <h2 className="text-base font-bold text-gray-900 mb-2">第4条（免責事項）</h2>
          <p className="leading-relaxed">本サービスは、ユーザーが投稿したコンテンツについて一切の責任を負いません。本サービスに起因してユーザーに生じた損害について、当サービスは責任を負わないものとします。</p>
        </section>
      </div>
    </div>
  )
}
