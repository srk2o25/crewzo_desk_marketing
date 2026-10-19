import type { Metadata } from 'next'
import Link from 'next/link'
import JsonLd from '@/components/JsonLd'
import { blogGraph } from '@/lib/jsonld'
import { blogUrl, formatDate, getAllCaseStudies, getAllGlossaryTerms, getAllPosts, getSite } from '@/lib/content'

const site = getSite()

export const metadata: Metadata = {
  title: { absolute: `Blog | ${site.name}` },
  description: site.blog.description,
  alternates: { canonical: blogUrl(site) },
  openGraph: { title: site.blog.title, description: site.blog.description, url: blogUrl(site) },
}

export default function BlogIndex() {
  const posts = getAllPosts().filter((p) => !p.robots.noindex)
  // Other content types appear here once they have published entries.
  const sections = [
    ...(getAllCaseStudies().length ? [{ name: 'Case studies', href: '/case-studies/' }] : []),
    ...(getAllGlossaryTerms().length ? [{ name: 'Glossary', href: '/glossary/' }] : []),
  ]

  return (
    <>
      <JsonLd data={blogGraph(site, posts)} />

      <section className="pt-32 pb-16 px-6 border-b border-slate-100">
        <div className="max-w-3xl mx-auto text-center">
          <span className="text-xs font-bold text-primary uppercase tracking-widest">Blog</span>
          <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-gray-900 mt-4 mb-6 leading-[1.08]">
            Insights for lettings, sales, and maintenance teams.
          </h1>
          <p className="text-lg text-slate-500 leading-relaxed max-w-xl mx-auto">{site.blog.description}</p>
          {sections.length > 0 && (
            <nav aria-label="Sections" className="mt-8 flex justify-center gap-3">
              {sections.map((s) => (
                <Link key={s.href} href={s.href} className="text-sm font-semibold text-primary bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-full transition-colors">
                  {s.name}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/${post.slug}/`}
              className="block bg-white rounded-2xl border border-slate-200 p-7 hover:border-primary hover:shadow-md transition-all"
            >
              <p className="text-xs text-slate-400 mb-2">
                <time dateTime={post.date}>{formatDate(post.date)}</time>
              </p>
              <h2 className="text-xl font-black text-gray-900 mb-2">{post.title}</h2>
              <p className="text-sm text-slate-500 leading-relaxed mb-4">{post.description}</p>
              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span key={tag} className="text-xs font-semibold text-primary bg-blue-50 px-2.5 py-1 rounded-full">{tag}</span>
                  ))}
                </div>
              )}
            </Link>
          ))}
        </div>
      </section>
    </>
  )
}
