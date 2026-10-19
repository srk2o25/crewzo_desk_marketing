// Runs after `next build`. Reads the exported HTML the way a crawler would (no JavaScript) and fails the
// build if any technical rule is broken: content in raw HTML, canonical + trailing slash, snippet meta,
// JSON-LD graph, sitemap and llms.txt.
import fs from 'fs'
import path from 'path'
import { ROOT, loadEntries, loadPosts, loadSite } from '../lib/load.mjs'

const OUT = path.join(ROOT, 'out/resources/blog')
const site = loadSite()
const posts = loadPosts()
const failures = []
const check = (ok, message) => ok || failures.push(message)

const read = (rel) => {
  const file = path.join(OUT, rel)
  return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null
}
const decode = (s) => s.replace(/&amp;/g, '&').replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
const jsonLd = (html) =>
  [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map((m) => JSON.parse(m[1]))
const types = (graphs) => graphs.flatMap((g) => (g['@graph'] ?? [g]).map((n) => n['@type']))

for (const post of posts) {
  const rel = `${post.slug}/index.html`
  const html = read(rel)
  if (!check(html, `${rel} was not generated`)) continue
  const text = decode(html)
  const url = `${site.url}/resources/blog/${post.slug}/`

  check(text.includes(post.title), `${rel}: title missing from raw HTML`)
  check(text.includes(post.summary), `${rel}: summary missing from raw HTML`)
  check(/<h2[^>]*>/.test(html), `${rel}: article body (H2s) missing from raw HTML`)
  check(html.includes(`<link rel="canonical" href="${url}"`), `${rel}: canonical should be ${url}`)
  check(new RegExp(`<meta name="robots" content="[^"]*max-snippet:${post.robots.maxSnippet}`).test(html), `${rel}: robots meta missing max-snippet:${post.robots.maxSnippet}`)

  let graphs = []
  try {
    graphs = jsonLd(html)
  } catch (e) {
    check(false, `${rel}: JSON-LD does not parse (${e.message})`)
  }
  const found = types(graphs)
  for (const t of ['Organization', 'WebSite', 'BlogPosting', 'BreadcrumbList']) check(found.includes(t), `${rel}: JSON-LD missing ${t}`)
  if (post.faqs.length) check(found.includes('FAQPage'), `${rel}: JSON-LD missing FAQPage`)
  if (post.product) check(found.includes('SoftwareApplication'), `${rel}: JSON-LD missing SoftwareApplication`)
  const org = graphs.flatMap((g) => g['@graph'] ?? [g]).find((n) => n['@type'] === 'Organization')
  check(org && org.sameAs?.length === site.sameAs.length, `${rel}: Organization sameAs missing`)
}

// Case studies and glossary terms: each page exists with its canonical; empty sections aren't published.
for (const [collection, section, type] of [['case_studies', 'case-studies', 'Article'], ['glossary', 'glossary', 'DefinedTerm']]) {
  const entries = loadEntries(collection)
  if (!entries.length) {
    check(!fs.existsSync(path.join(OUT, section)), `${section}/ should not be published while it has no entries`)
    continue
  }
  check(read(`${section}/index.html`), `${section}/index.html was not generated`)
  for (const e of entries) {
    const rel = `${section}/${e.slug}/index.html`
    const html = read(rel)
    if (!check(html, `${rel} was not generated`)) continue
    check(html.includes(`<link rel="canonical" href="${site.url}/resources/blog/${section}/${e.slug}/"`), `${rel}: wrong or missing canonical`)
    check(types(jsonLd(html)).includes(type), `${rel}: JSON-LD missing ${type}`)
  }
}

const index = read('index.html')
check(index && posts.every((p) => index.includes(`/resources/blog/${p.slug}/`)), 'index.html: not every post is linked from the blog index')

const sitemap = read('sitemap.xml')
if (check(sitemap, 'sitemap.xml was not generated')) {
  const locs = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1])
  check(locs.every((l) => l.endsWith('/') && l.startsWith(`${site.url}/resources/blog/`)), 'sitemap.xml: every URL must be absolute with a trailing slash')
}

const llms = read('llms.txt')
check(llms && posts.every((p) => p.robots.noindex || llms.includes(`/resources/blog/${p.slug}/`)), 'llms.txt missing or incomplete')

if (failures.length) {
  console.error(`\nBuild verification failed:\n${failures.map((f) => `  ✗ ${f}`).join('\n')}`)
  process.exit(1)
}
console.log(`Build verified: ${posts.length} post(s), raw HTML, canonicals, snippet meta, JSON-LD, sitemap and llms.txt all OK.`)
