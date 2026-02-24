'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useLang } from '@/contexts/LangContext'
import { t } from '@/lib/i18n'

const APP_STORE_URL = 'https://apps.apple.com/us/app/novella/id6757092620?itscg=30200&itsct=apps_box_link&mttnsubad=6757092620'

export default function Footer() {
  const { lang } = useLang()

  return (
    <footer className="hidden md:block border-t border-gray-100 bg-white mt-16">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-8">

          {/* Brand + App Store */}
          <div className="flex flex-col gap-4">
            <div>
              <span className="text-lg font-black tracking-tight" style={{ color: '#9043e1' }}>Novella</span>
              <p className="text-xs text-gray-400 mt-1">{t(lang, 'footer.tagline')}</p>
            </div>
            <a
              href={APP_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block hover:opacity-75 transition-opacity w-fit"
            >
              <Image src="/app-store-black.svg" alt="Download on the App Store" width={135} height={40} />
            </a>
          </div>

          {/* Links */}
          <nav className="flex flex-col gap-2 pt-1">
            <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-1">Legal</p>
            {[
              { href: '/legal/terms', key: 'footer.terms' as const },
              { href: '/legal/privacy', key: 'footer.privacy' as const },
              { href: '/legal/guidelines', key: 'footer.guidelines' as const },
            ].map(({ href, key }) => (
              <Link
                key={href}
                href={href}
                className="text-sm text-gray-400 hover:text-[#9043e1] transition-colors"
              >
                {t(lang, key)}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-50">
          <p className="text-xs text-gray-300">© {new Date().getFullYear()} Novella. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
