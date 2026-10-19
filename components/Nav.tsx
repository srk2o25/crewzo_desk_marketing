// Mirrors the landing page's header (crewzodesk/index.html). Keep links in sync.
// Plain <a> tags on purpose: marketing pages aren't routes in this app, and next/link would prefix them
// with the /resources/blog base path. The mobile menu is a <details> element, so the nav needs no JS.

const linkClass = 'text-sm font-medium text-slate-600 hover:text-primary transition-colors'
const itemClass = 'block px-4 py-2.5 text-sm text-slate-700 hover:bg-green-50 hover:text-primary transition-colors'

function Chevron() {
  return (
    <svg className="w-3.5 h-3.5 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  )
}

export default function Nav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-6 h-16 grid grid-cols-2 md:grid-cols-3 items-center">
        <a href="/" className="flex items-center justify-self-start">
          <img src="/logos/logo-horizontal-black.png" alt="Crewzo Desk" width={160} height={40} className="h-9 w-auto" />
        </a>

        <div className="hidden md:flex items-center justify-center gap-8">
          <a href="/#features" className={linkClass}>Features</a>
          <a href="/resources/blog/" className={linkClass}>Blog</a>
          <a href="/#faq" className={linkClass}>FAQ</a>
        </div>

        <div className="flex items-center justify-end gap-4">
          <a href="/#demo" className="hidden md:inline-flex text-sm font-semibold text-white bg-primary hover:bg-primary-dark px-5 py-2.5 rounded-xl transition-colors shadow-sm">
            Book a demo
          </a>
          <details className="md:hidden group">
            <summary className="list-none p-2 text-slate-600 cursor-pointer" aria-label="Toggle menu">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </summary>
            <div className="absolute left-0 right-0 top-16 bg-white border-t border-slate-100 px-6 py-4 flex flex-col gap-4 shadow-sm">
              <a href="/#features" className="text-sm font-medium text-slate-700">Features</a>
              <a href="/resources/blog/" className="text-sm font-medium text-slate-700">Blog</a>
              <a href="/#faq" className="text-sm font-medium text-slate-700">FAQ</a>
              <a href="/#demo" className="text-sm font-semibold text-white bg-primary px-4 py-2 rounded-xl text-center">Book a demo</a>
            </div>
          </details>
        </div>
      </div>
    </nav>
  )
}
