import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Breadcrumb from '@/components/Breadcrumb'
import Cta from '@/components/Cta'
import JsonLd from '@/components/JsonLd'
import Prose from '@/components/Prose'
import { caseStudyGraph } from '@/lib/jsonld'
import { absolute, caseStudyUrl, formatDate, getAllCaseStudies, getSite, renderBody } from '@/lib/content'
import { PLACEHOLDER, withPlaceholder } from '@/lib/static-params'

const site = getSite()

export const dynamicParams = false

export function generateStaticParams() {
  return withPlaceholder(getAllCaseStudies().map((cs) => ({ slug: cs.slug })))
}

type Props = { params: Promise<{ slug: string }> }

const find = (slug: string) => getAllCaseStudies().find((cs) => cs.slug === slug)

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const cs = find((await params).slug)
  if (!cs) return {}
  const url = caseStudyUrl(site, cs.slug)
  const image = absolute(site, cs.image || '/og-image.png')
  return {
    title: cs.title,
    description: cs.description,
    alternates: { canonical: url },
    robots: { index: !cs.robots.noindex, follow: true, 'max-snippet': cs.robots.maxSnippet, 'max-image-preview': 'large', 'max-video-preview': -1 },
    openGraph: { type: 'article', title: cs.title, description: cs.description, url, publishedTime: cs.date, images: [{ url: image, alt: cs.imageAlt || cs.title }] },
    twitter: { card: 'summary_large_image', title: cs.title, description: cs.description, images: [image] },
  }
}

export default async function CaseStudyPage({ params }: Props) {
  const { slug } = await params
  const cs = slug === PLACEHOLDER ? undefined : find(slug)
  if (!cs) notFound()
  const html = await renderBody(cs.body)

  return (
    <article className="pt-32 pb-24 px-6">
      <JsonLd data={caseStudyGraph(site, cs)} />
      <div className="max-w-3xl mx-auto">
        <Breadcrumb trail={[{ name: 'Case studies', href: '/case-studies/' }]} />

        <header className="mt-8 mb-10 pb-10 border-b border-slate-100">
          <p className="text-xs font-bold text-primary uppercase tracking-widest mb-3">
            Case study · {cs.customer}{cs.industry ? ` · ${cs.industry}` : ''}
          </p>
          <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-gray-900 mb-4 leading-[1.08]">{cs.title}</h1>
          <p className="text-sm text-slate-400"><time dateTime={cs.date}>{formatDate(cs.date)}</time></p>
        </header>

        <section aria-label="Summary" className="mb-10 rounded-2xl border border-blue-100 bg-blue-50/60 p-6">
          <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">In short</p>
          <p className="text-slate-700 leading-relaxed">{cs.summary}</p>
        </section>

        {cs.results.length > 0 && (
          <section aria-label="Results" className="mb-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {cs.results.map((r) => (
              <div key={r.label} className="rounded-2xl border border-slate-200 bg-white p-5 text-center">
                <p className="text-3xl font-black text-gray-900">{r.value}</p>
                <p className="mt-1 text-sm text-slate-500">{r.label}</p>
              </div>
            ))}
          </section>
        )}

        {cs.image && <img src={cs.image} alt={cs.imageAlt} className="mb-10 w-full rounded-2xl" width={1200} height={630} fetchPriority="high" />}

        <Prose html={html} />

        {cs.quote.text && (
          <figure className="mt-12 rounded-2xl border-l-4 border-primary bg-white p-6">
            <blockquote className="text-lg text-gray-900 leading-relaxed">“{cs.quote.text}”</blockquote>
            {cs.quote.name && (
              <figcaption className="mt-3 text-sm text-slate-500">
                {cs.quote.name}{cs.quote.role ? `, ${cs.quote.role}` : ''}, {cs.customer}
              </figcaption>
            )}
          </figure>
        )}

        <Cta />
      </div>
    </article>
  )
}
