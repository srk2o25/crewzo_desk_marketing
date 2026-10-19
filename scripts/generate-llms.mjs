// Writes public/llms.txt (https://llmstxt.org) from frontmatter, so it can never drift from the content.
// Served at /resources/blog/llms.txt. The marketing site's root /llms.txt links here.
import fs from 'fs'
import path from 'path'
import { ROOT, loadEntries, loadSite } from '../lib/load.mjs'

const site = loadSite()
const blog = `${site.url}/resources/blog/`
const published = (collection) => loadEntries(collection).filter((e) => !e.robots.noindex)

const posts = published('posts')
const caseStudies = published('case_studies')
const terms = published('glossary').sort((a, b) => a.term.localeCompare(b.term))

const section = (title, items) => (items.length ? [`## ${title}`, '', ...items, ''] : [])

const lines = [
  `# ${site.blog.title}`,
  '',
  `> ${site.blog.description}`,
  '',
  `${site.name}: ${site.description} Main site: ${site.url}/`,
  '',
  ...section('Articles', posts.map((p) => `- [${p.title}](${blog}${p.slug}/): ${p.summary}`)),
  ...section('Case studies', caseStudies.map((c) => `- [${c.title}](${blog}case-studies/${c.slug}/): ${c.summary}`)),
  ...section('Glossary', terms.map((t) => `- [${t.term}](${blog}glossary/${t.slug}/): ${t.definition}`)),
  '## Optional',
  '',
  `- [Blog index](${blog})`,
  `- [Sitemap](${blog}sitemap.xml)`,
  '',
]

fs.writeFileSync(path.join(ROOT, 'public/llms.txt'), lines.join('\n'))
console.log(`llms.txt: ${posts.length} article(s), ${caseStudies.length} case stud(ies), ${terms.length} term(s)`)
