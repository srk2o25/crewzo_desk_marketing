// Reads and validates content files. Plain JS so both Next.js and the Node lint/build scripts can use it.
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import yaml from 'js-yaml'
import { COLLECTIONS, authorSchema, normalizeDates, siteSchema } from './schema.mjs'

export const ROOT = process.cwd()
export const POSTS_DIR = path.join(ROOT, COLLECTIONS.posts.folder)
const AUTHORS_DIR = path.join(ROOT, 'content/authors')
const SITE_FILE = path.join(ROOT, 'content/settings/site.yml')

const formatIssues = (error) => error.issues.map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`).join('; ')

export function loadSite() {
  const site = siteSchema.parse(yaml.load(fs.readFileSync(SITE_FILE, 'utf8')))
  // SITE_URL lets the domain move (crewzo.co.in -> a new domain) happen with an env var, not a content edit.
  const url = (process.env.SITE_URL || site.url).replace(/\/$/, '')
  return { ...site, url }
}

export function loadAuthors() {
  /** @type {Record<string, any>} */
  const authors = {}
  for (const file of fs.readdirSync(AUTHORS_DIR).filter((f) => f.endsWith('.yml'))) {
    const slug = file.replace(/\.yml$/, '')
    const result = authorSchema.safeParse(yaml.load(fs.readFileSync(path.join(AUTHORS_DIR, file), 'utf8')))
    if (!result.success) throw new Error(`content/authors/${file}: ${formatIssues(result.error)}`)
    authors[slug] = { slug, ...result.data }
  }
  return authors
}

// Returns { file, slug, data, body, errors } for every .md file of a collection, valid or not.
// `dir` overrides the collection's folder (the lint uses it for test fixtures).
export function readEntries(collection = 'posts', dir) {
  const { folder, schema } = COLLECTIONS[collection]
  const from = dir ?? path.join(ROOT, folder)
  if (!fs.existsSync(from)) return []
  return fs
    .readdirSync(from)
    .filter((f) => f.endsWith('.md'))
    .map((file) => {
      const { data, content } = matter(fs.readFileSync(path.join(from, file), 'utf8'))
      const result = schema.safeParse(normalizeDates(data))
      return {
        file,
        slug: file.replace(/\.md$/, ''),
        data: result.success ? result.data : null,
        body: content,
        errors: result.success ? [] : result.error.issues.map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`),
      }
    })
}

// Valid entries only, newest first. Throws on invalid content so a bad entry fails the build.
export function loadEntries(collection = 'posts') {
  const files = readEntries(collection)
  const bad = files.filter((f) => f.errors.length)
  if (bad.length) {
    throw new Error(bad.map((f) => `${COLLECTIONS[collection].folder}/${f.file}: ${f.errors.join('; ')}`).join('\n'))
  }
  return files.map((f) => ({ ...f.data, body: f.body })).sort((a, b) => (a.date < b.date ? 1 : -1))
}

export const loadPosts = () => loadEntries('posts')
