import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export const metadata = { title: 'ガイドライン | Novella' }

export default function GuidelinesPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 pb-16">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-[#9043e1] mb-8 transition-colors">
        <ChevronLeft size={15} />
        ホームに戻る
      </Link>
      <h1 className="text-2xl font-bold mb-2">コミュニティガイドライン</h1>
      <p className="text-sm text-gray-400 mb-8">最終更新日: 2025年1月</p>

      <div className="space-y-6 text-gray-700">
        <p className="text-sm leading-relaxed">Novellaは、創作を愛するすべての人が安心して作品を投稿・閲覧できる場所です。以下のガイドラインを守って、よりよいコミュニティを一緒に作りましょう。</p>

        {[
          {
            title: '✅ 歓迎するコンテンツ',
            items: ['オリジナルの小説・短編・詩', 'イラストを交えた物語', '様々なジャンル・テーマの作品', '建設的なコメント・感想'],
          },
          {
            title: '🚫 禁止するコンテンツ',
            items: [
              '性的・暴力的・差別的なコンテンツ',
              '他者の著作物の無断転載',
              '実在の人物への誹謗中傷',
              'スパム・広告目的の投稿',
              '個人情報を含むコンテンツ',
            ],
          },
          {
            title: '💬 コメントについて',
            items: ['作品への感想・応援メッセージを大切に', '批判は建設的に、相手を尊重して', '荒らし・嫌がらせは禁止'],
          },
        ].map(({ title, items }) => (
          <section key={title}>
            <h2 className="text-base font-bold text-gray-900 mb-2">{title}</h2>
            <ul className="space-y-1">
              {items.map((item) => (
                <li key={item} className="text-sm flex items-start gap-2">
                  <span className="text-gray-300 mt-0.5">—</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>
        ))}

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-2">違反への対応</h2>
          <p className="text-sm leading-relaxed">ガイドライン違反のコンテンツはコミュニティ通報機能で報告できます。確認後、コンテンツの削除やアカウント停止等の対応を行います。</p>
        </section>
      </div>
    </div>
  )
}
