import type { Metadata } from 'next'
import Link from 'next/link'
import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import { collectionGraph } from '@/lib/jsonld'
import { getAllGlossaryTerms, getSite, glossaryUrl } from '@/lib/content'

const site = getSite()
const description = 'Plain-English definitions of the lettings, enquiry management and lead qualification terms UK agents use.'

export const metadata: Metadata = {
  title: 'Glossary',
  description,
  alternates: { canonical: glossaryUrl(site) },
  openGraph: { title: `Glossary | ${site.name}`, description, url: glossaryUrl(site) },
}

// Removed from the output by scripts/nest-output.mjs while there are no terms.
export default function GlossaryIndex() {
  const terms = getAllGlossaryTerms().filter((t) => !t.robots.noindex)

  return (
    <section className="pt-32 pb-24 px-6">
      <JsonLd data={collectionGraph(site, 'Glossary', glossaryUrl(site), terms.map((t) => ({ name: t.term, url: glossaryUrl(site, t.slug) })))} />
      <div className="max-w-3xl mx-auto">
        <Breadcrumb trail={[]} />
        <h1 className="mt-8 text-4xl lg:text-5xl font-black tracking-tight text-gray-900 mb-4 leading-[1.08]">Glossary</h1>
        <p className="text-lg text-slate-500 leading-relaxed mb-12">{description}</p>
        <dl className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
          {terms.map((t) => (
            <div key={t.slug} className="p-6">
              <dt>
                <Link href={`/glossary/${t.slug}/`} className="text-lg font-bold text-gray-900 hover:text-primary">{t.term}</Link>
              </dt>
              <dd className="mt-1 text-sm text-slate-500 leading-relaxed">{t.definition}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
