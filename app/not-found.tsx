import Link from 'next/link'

export default function NotFound() {
  return (
    <section className="pt-40 pb-32 px-6 text-center">
      <h1 className="text-4xl font-black tracking-tight text-gray-900 mb-4">Page not found</h1>
      <p className="text-slate-500 mb-8">That article doesn&apos;t exist, or it has moved.</p>
      <Link href="/" className="text-sm font-semibold text-primary hover:text-primary-dark">← All articles</Link>
    </section>
  )
}
