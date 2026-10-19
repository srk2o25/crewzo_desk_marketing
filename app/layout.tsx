import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { blogUrl, getSite } from '@/lib/content'
import './globals.css'

const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600', '700', '900'], display: 'swap' })

const site = getSite()

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.blog.title, template: '%s | Crewzo Desk' },
  description: site.blog.description,
  icons: { icon: '/favicon-32.png', apple: '/apple-touch-icon.png' },
  openGraph: { type: 'website', siteName: site.name, url: blogUrl(site), images: [{ url: '/og-image.png', width: 1200, height: 630 }] },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true, 'max-snippet': -1, 'max-image-preview': 'large', 'max-video-preview': -1 },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-US">
      <body className={`${inter.className} text-gray-900 antialiased`}>
        {/* Same GoatCounter site as the landing page (crewzo.co.in), so blog visits show up in the same analytics. */}
        <Script
          data-goatcounter="https://crewzodesk.goatcounter.com/count"
          src="//gc.zgo.at/count.js"
          strategy="afterInteractive"
        />
        <Nav />
        <main>{children}</main>
        <Footer email={site.email} />
      </body>
    </html>
  )
}
