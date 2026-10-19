import type { Metadata } from 'next'
import Link from 'next/link'
import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import { collectionGraph } from '@/lib/jsonld'
import { caseStudyUrl, getAllCaseStudies, getSite } from '@/lib/content'

const site = getSite()
const description = 'How MSPs use Crewzo Desk to run their service desk inside Microsoft Teams.'

export const metadata: Metadata = {
  title: 'Case studies',
  description,
  alternates: { canonical: caseStudyUrl(site) },
  openGraph: { title: `Case studies | ${site.name}`, description, url: caseStudyUrl(site) },
}

// Removed from the output by scripts/nest-output.mjs while there are no case studies.
export default function CaseStudiesIndex() {
  const items = getAllCaseStudies().filter((cs) => !cs.robots.noindex)

  return (
    <section className="pt-32 pb-24 px-6">
      <JsonLd data={collectionGraph(site, 'Case studies', caseStudyUrl(site), items.map((cs) => ({ name: cs.title, url: caseStudyUrl(site, cs.slug) })))} />
      <div className="max-w-3xl mx-auto">
        <Breadcrumb trail={[]} />
        <h1 className="mt-8 text-4xl lg:text-5xl font-black tracking-tight text-gray-900 mb-4 leading-[1.08]">Case studies</h1>
        <p className="text-lg text-slate-500 leading-relaxed mb-12">{description}</p>
        <div className="space-y-6">
          {items.map((cs) => (
            <Link key={cs.slug} href={`/case-studies/${cs.slug}/`} className="block bg-white rounded-2xl border border-slate-200 p-7 hover:border-primary hover:shadow-md transition-all">
              <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">{cs.customer}</p>
              <h2 className="text-xl font-black text-gray-900 mb-2">{cs.title}</h2>
              <p className="text-sm text-slate-500 leading-relaxed">{cs.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
