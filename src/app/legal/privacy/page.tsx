import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export const metadata = { title: 'プライバシーポリシー | Novella' }

export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 pb-16">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-[#9043e1] mb-8 transition-colors">
        <ChevronLeft size={15} />
        ホームに戻る
      </Link>
      <h1 className="text-2xl font-bold mb-2">プライバシーポリシー</h1>
      <p className="text-sm text-gray-400 mb-8">最終更新日: 2025年1月</p>

      <div className="prose prose-sm max-w-none text-gray-700 space-y-6">
        <section>
          <h2 className="text-base font-bold text-gray-900 mb-2">収集する情報</h2>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>メールアドレス・表示名（アカウント登録時）</li>
            <li>投稿した作品・エピソード・コメントの内容</li>
            <li>アップロードした画像ファイル</li>
            <li>アクセスログ（IPアドレス等）</li>
          </ul>
        </section>
        <section>
          <h2 className="text-base font-bold text-gray-900 mb-2">情報の利用目的</h2>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>本サービスの提供・運営のため</li>
            <li>ユーザーサポートのため</li>
            <li>サービスの改善・新機能開発のため</li>
            <li>不正利用の検知・防止のため</li>
          </ul>
        </section>
        <section>
          <h2 className="text-base font-bold text-gray-900 mb-2">第三者への提供</h2>
          <p className="leading-relaxed">法令に基づく場合を除き、ユーザーの同意なく第三者に個人情報を提供しません。本サービスはFirebase（Google）をインフラとして使用しており、Googleのプライバシーポリシーも適用されます。</p>
        </section>
        <section>
          <h2 className="text-base font-bold text-gray-900 mb-2">お問い合わせ</h2>
          <p className="leading-relaxed">個人情報の取り扱いに関するご質問は、本サービス内のサポート窓口よりお問い合わせください。</p>
        </section>
      </div>
    </div>
  )
}
