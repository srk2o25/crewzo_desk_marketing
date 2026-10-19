// Mirrors the landing page's footer (crewzodesk/index.html). Keep links in sync.
export default function Footer({ email }: { email: string }) {
  return (
    <footer className="bg-gray-900 px-6 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-10 mb-10">
          <div className="flex flex-col items-center text-center gap-3">
            <img src="/logos/logo-horizontal-white.png" alt="Crewzo Desk" width={200} height={50} className="h-10 w-auto" />
            <p className="text-sm text-slate-400">
              Reach out to us at{' '}
              <a href={`mailto:${email}`} className="text-slate-300 hover:text-white transition-colors">{email}</a>
            </p>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Product</p>
            <ul className="space-y-2.5">
              <li><a href="/#features" className="text-sm text-slate-400 hover:text-white transition-colors">Features</a></li>
              <li><a href="/#faq" className="text-sm text-slate-400 hover:text-white transition-colors">FAQ</a></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Company</p>
            <ul className="space-y-2.5">
              <li><a href="/resources/blog/" className="text-sm text-slate-400 hover:text-white transition-colors">Blog</a></li>
              <li><a href="/#demo" className="text-sm text-slate-400 hover:text-white transition-colors">Book a demo</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-600">© {new Date().getFullYear()} SRK Labs, trading as Crewzo Desk. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="/privacy.html" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">Privacy Policy</a>
            <a href="/terms.html" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">Terms &amp; Conditions</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
