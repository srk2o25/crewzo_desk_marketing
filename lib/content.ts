import { loadAuthors, loadEntries, loadSite } from './load.mjs'
import { renderMarkdown } from './markdown.mjs'

export const BASE_PATH = '/resources/blog'

export type Site = {
  name: string
  url: string
  logo: string
  email: string
  description: string
  sameAs: string[]
  product: { name: string; description: string; category: string; url: string }
  blog: { title: string; description: string }
}

export type Author = {
  slug: string
  name: string
  type: 'Person' | 'Organization'
  jobTitle: string
  bio: string
  image?: string
  sameAs: string[]
}

export type Post = {
  id: string
  title: string
  slug: string
  description: string
  summary: string
  date: string
  updated?: string
  author: string
  tags: string[]
  image?: string
  imageAlt: string
  product: boolean
  faqs: { question: string; answer: string }[]
  robots: { maxSnippet: number; noindex: boolean }
  body: string
}

export type CaseStudy = {
  id: string
  title: string
  slug: string
  description: string
  summary: string
  date: string
  updated?: string
  customer: string
  customerUrl?: string
  industry: string
  results: { value: string; label: string }[]
  quote: { text: string; name: string; role: string }
  tags: string[]
  image?: string
  imageAlt: string
  robots: { maxSnippet: number; noindex: boolean }
  body: string
}

export type GlossaryTerm = {
  id: string
  term: string
  slug: string
  description: string
  definition: string
  date: string
  updated?: string
  robots: { maxSnippet: number; noindex: boolean }
  body: string
}

export const getSite = (): Site => loadSite() as Site
export const getAuthors = (): Record<string, Author> => loadAuthors() as Record<string, Author>
export const getAllPosts = (): Post[] => loadEntries('posts') as Post[]
export const getAllCaseStudies = (): CaseStudy[] => loadEntries('case_studies') as CaseStudy[]
export const getAllGlossaryTerms = (): GlossaryTerm[] =>
  (loadEntries('glossary') as GlossaryTerm[]).sort((a, b) => a.term.localeCompare(b.term))

export function getAuthor(slug: string): Author {
  const author = getAuthors()[slug]
  if (!author) throw new Error(`Unknown author "${slug}" — add content/authors/${slug}.yml`)
  return author
}

export async function getPost(slug: string) {
  const post = getAllPosts().find((p) => p.slug === slug)
  if (!post) return null
  return { ...post, html: await renderMarkdown(post.body) }
}

export const postUrl = (site: Site, slug: string) => `${site.url}${BASE_PATH}/${slug}/`
export const caseStudyUrl = (site: Site, slug?: string) => `${site.url}${BASE_PATH}/case-studies/${slug ? `${slug}/` : ''}`
export const glossaryUrl = (site: Site, slug?: string) => `${site.url}${BASE_PATH}/glossary/${slug ? `${slug}/` : ''}`
export const renderBody = (markdown: string) => renderMarkdown(markdown)

// Outbound links written inline in a body, used as the citation list in structured data.
export function externalLinks(markdown: string) {
  const urls = [...markdown.matchAll(/\]\((https:\/\/[^)\s]+)\)/g)].map((m) => m[1])
  return [...new Set(urls)].filter((u) => !/^https:\/\/(www\.)?(crewzo\.co\.in)\//.test(u))
}
export const blogUrl = (site: Site) => `${site.url}${BASE_PATH}/`
export const absolute = (site: Site, pathname: string) => (/^https?:\/\//.test(pathname) ? pathname : `${site.url}${pathname}`)

export function formatDate(date: string) {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
}
