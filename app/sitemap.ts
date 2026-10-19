import type { MetadataRoute } from 'next'
import { blogUrl, caseStudyUrl, getAllCaseStudies, getAllGlossaryTerms, getAllPosts, getSite, glossaryUrl, postUrl } from '@/lib/content'

export const dynamic = 'force-static'

type Dated = { date: string; updated?: string; robots: { noindex: boolean } }
const lastModified = (e: Dated) => new Date(e.updated || e.date)
const newest = (entries: Dated[]) => (entries.length ? new Date(Math.max(...entries.map((e) => +lastModified(e)))) : new Date())

// Served at /resources/blog/sitemap.xml; the main domain's robots.txt lists it.
export default function sitemap(): MetadataRoute.Sitemap {
  const site = getSite()
  const posts = getAllPosts().filter((p) => !p.robots.noindex)
  const caseStudies = getAllCaseStudies().filter((c) => !c.robots.noindex)
  const terms = getAllGlossaryTerms().filter((t) => !t.robots.noindex)

  return [
    { url: blogUrl(site), lastModified: newest(posts) },
    ...posts.map((p) => ({ url: postUrl(site, p.slug), lastModified: lastModified(p) })),
    ...(caseStudies.length ? [{ url: caseStudyUrl(site), lastModified: newest(caseStudies) }] : []),
    ...caseStudies.map((c) => ({ url: caseStudyUrl(site, c.slug), lastModified: lastModified(c) })),
    ...(terms.length ? [{ url: glossaryUrl(site), lastModified: newest(terms) }] : []),
    ...terms.map((t) => ({ url: glossaryUrl(site, t.slug), lastModified: lastModified(t) })),
  ]
}
