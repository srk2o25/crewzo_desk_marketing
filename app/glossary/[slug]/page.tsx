import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Breadcrumb from '@/components/Breadcrumb'
import Cta from '@/components/Cta'
import JsonLd from '@/components/JsonLd'
import Prose from '@/components/Prose'
import { glossaryTermGraph } from '@/lib/jsonld'
import { getAllGlossaryTerms, getSite, glossaryUrl, renderBody } from '@/lib/content'
import { PLACEHOLDER, withPlaceholder } from '@/lib/static-params'

const site = getSite()

export const dynamicParams = false

export function generateStaticParams() {
  return withPlaceholder(getAllGlossaryTerms().map((t) => ({ slug: t.slug })))
}

type Props = { params: Promise<{ slug: string }> }

const find = (slug: string) => getAllGlossaryTerms().find((t) => t.slug === slug)

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const term = find((await params).slug)
  if (!term) return {}
  const url = glossaryUrl(site, term.slug)
  const title = `What is ${term.term}?`
  return {
    title: { absolute: `${title} | Crewzo Desk Glossary` },
    description: term.description,
    alternates: { canonical: url },
    robots: { index: !term.robots.noindex, follow: true, 'max-snippet': term.robots.maxSnippet, 'max-image-preview': 'large', 'max-video-preview': -1 },
    openGraph: { type: 'article', title, description: term.description, url },
    twitter: { card: 'summary_large_image', title, description: term.description },
  }
}

export default async function GlossaryTermPage({ params }: Props) {
  const { slug } = await params
  const term = slug === PLACEHOLDER ? undefined : find(slug)
  if (!term) notFound()
  const html = term.body.trim() ? await renderBody(term.body) : ''

  return (
    <article className="pt-32 pb-24 px-6">
      <JsonLd data={glossaryTermGraph(site, term)} />
      <div className="max-w-3xl mx-auto">
        <Breadcrumb trail={[{ name: 'Glossary', href: '/glossary/' }]} />

        <header className="mt-8 mb-8">
          <p className="text-xs font-bold text-primary uppercase tracking-widest mb-3">Glossary</p>
          <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-gray-900 leading-[1.08]">What is {term.term}?</h1>
        </header>

        {/* The definition is the answer block: one short paragraph that stands on its own when quoted. */}
        <section aria-label="Definition" className="mb-10 rounded-2xl border border-blue-100 bg-blue-50/60 p-6">
          <p className="text-lg text-slate-800 leading-relaxed">{term.definition}</p>
        </section>

        {html && <Prose html={html} />}

        <p className="mt-12 text-sm">
          <Link href="/glossary/" className="font-semibold text-primary hover:text-primary-dark">← All glossary terms</Link>
        </p>

        <Cta />
      </div>
    </article>
  )
}
