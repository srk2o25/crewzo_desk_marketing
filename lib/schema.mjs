// Content contract. Shared by the site build (lib/content.ts) and the content lint (scripts/lint-content.mjs),
// so a post that passes the lint is exactly a post the site can render. Mirrors public/admin/config.yml.
import { z } from 'zod'

export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
export const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
export const MAX_ANSWER_WORDS = 60

export const wordCount = (text) => (text.trim().match(/\S+/g) ?? []).length

// YAML turns unquoted 2026-09-10 into a Date. Decap may write either form, so fold both back to a string.
export function normalizeDates(data) {
  const out = { ...data }
  for (const key of ['date', 'updated']) {
    if (out[key] instanceof Date) out[key] = out[key].toISOString().slice(0, 10)
  }
  return out
}

const imagePath = z
  .string()
  .regex(/^\/images\/blog\/[a-z0-9]+(?:-[a-z0-9]+)*\.(png|jpe?g|webp|gif|svg|avif)$/, {
    message: 'must be a lowercase-hyphenated file under /images/blog/',
  })

const robots = z
  .object({
    maxSnippet: z.number().int().min(-1).default(-1),
    noindex: z.boolean().default(false),
  })
  .default({})
const optionalDate = z.string().regex(DATE_RE, { message: 'use YYYY-MM-DD' }).optional().or(z.literal(''))
// Permanent entry ID (UUID), set once by the editor's uuid field; survives slug and URL changes.
const id = z.string().uuid({ message: 'must be a UUID (the editor fills this in automatically)' })
const slug = z.string().regex(SLUG_RE, { message: 'lowercase letters, numbers and single hyphens only' })
const description = z.string().trim().min(70).max(160)
const image = imagePath.optional().or(z.literal(''))

function crossFieldChecks(entry, ctx) {
  if (entry.image && !entry.imageAlt?.trim()) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['imageAlt'], message: 'required when image is set' })
  }
  if (entry.updated && entry.updated < entry.date) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['updated'], message: 'cannot be earlier than date' })
  }
}

// Base objects (without refinements) are exported so scripts/check-config.mjs can compare their fields
// with public/admin/config.yml. Word limits and question phrasing are writing guidance, checked as
// warnings by the content lint, so they aren't enforced here.
export const postFields = z
  .object({
    id,
    title: z.string().trim().min(10).max(90),
    slug,
    description,
    summary: z.string().trim().min(1),
    date: z.string().regex(DATE_RE, { message: 'use YYYY-MM-DD' }),
    updated: optionalDate,
    author: z.string().regex(SLUG_RE),
    tags: z.array(z.string().regex(SLUG_RE)).default([]),
    image,
    imageAlt: z.string().optional().default(''),
    product: z.boolean().default(false),
    faqs: z.array(z.object({ question: z.string().trim().min(1), answer: z.string().trim().min(1) })).default([]),
    robots,
  })
  .strict()
export const postSchema = postFields.superRefine(crossFieldChecks)

export const caseStudyFields = z
  .object({
    id,
    title: z.string().trim().min(10).max(90),
    slug,
    description,
    summary: z.string().trim().min(1),
    date: z.string().regex(DATE_RE, { message: 'use YYYY-MM-DD' }),
    updated: optionalDate,
    customer: z.string().trim().min(1),
    customerUrl: z.string().url().startsWith('https://').optional().or(z.literal('')),
    industry: z.string().optional().default(''),
    results: z.array(z.object({ value: z.string().trim().min(1), label: z.string().trim().min(1) })).default([]),
    quote: z
      .object({ text: z.string().optional().default(''), name: z.string().optional().default(''), role: z.string().optional().default('') })
      .default({}),
    tags: z.array(z.string().regex(SLUG_RE)).default([]),
    image,
    imageAlt: z.string().optional().default(''),
    robots,
  })
  .strict()
export const caseStudySchema = caseStudyFields.superRefine(crossFieldChecks)

export const glossaryFields = z
  .object({
    id,
    term: z.string().trim().min(2).max(60),
    slug,
    description,
    definition: z.string().trim().min(1),
    date: z.string().regex(DATE_RE, { message: 'use YYYY-MM-DD' }),
    updated: optionalDate,
    robots,
  })
  .strict()
export const glossarySchema = glossaryFields.superRefine(crossFieldChecks)

// Every content type the site publishes. `urlPrefix` is the path under /resources/blog/.
export const COLLECTIONS = {
  posts: { label: 'post', folder: 'content/posts', schema: postSchema, fields: postFields, urlPrefix: '', answerField: 'summary' },
  case_studies: { label: 'case study', folder: 'content/case-studies', schema: caseStudySchema, fields: caseStudyFields, urlPrefix: 'case-studies/', answerField: 'summary' },
  glossary: { label: 'glossary term', folder: 'content/glossary', schema: glossarySchema, fields: glossaryFields, urlPrefix: 'glossary/', answerField: 'definition' },
}
// Post slugs that would collide with a section path.
export const RESERVED_SLUGS = ['case-studies', 'glossary', 'admin', 'images', 'tags', 'page']

export const authorFields = z
  .object({
    name: z.string().min(1),
    type: z.enum(['Person', 'Organization']),
    jobTitle: z.string().optional().default(''),
    bio: z.string().optional().default(''),
    image: imagePath.optional().or(z.literal('')).or(z.string().startsWith('/logos/')),
    sameAs: z.array(z.string().url()).default([]),
  })
  .strict()
export const authorSchema = authorFields

export const siteSchema = z
  .object({
    name: z.string(),
    url: z.string().url(),
    logo: z.string(),
    email: z.string().email(),
    description: z.string(),
    sameAs: z.array(z.string().url()),
    product: z.object({ name: z.string(), description: z.string(), category: z.string().default('BusinessApplication'), url: z.string().url() }),
    blog: z.object({ title: z.string(), description: z.string() }),
  })
  .strict()
