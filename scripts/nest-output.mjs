// Runs after `next build`. Next exports the site to the root of out/, but its URLs all start with the
// /resources/blog base path. Moving the files into out/resources/blog/ makes paths on disk match URLs, so
// Netlify's normal handling applies with no rewrite rule: /resources/blog/post 301s to /resources/blog/post/
// (a relative Location header, so it also works through the marketing site's proxy).
//
// Files the pages reference from the domain root stay at the root: robots.txt (for this mirror domain only),
// /images/blog/ (post images, proxied by the marketing site) and the shared brand assets.
import fs from 'fs'
import path from 'path'
import { loadEntries } from '../lib/load.mjs'

const OUT = path.join(process.cwd(), 'out')
const NESTED = path.join(OUT, 'resources/blog')
const KEEP_AT_ROOT = new Set(['robots.txt', 'images', 'logos', 'favicon-32.png', 'apple-touch-icon.png', 'og-image.png', 'resources'])

fs.mkdirSync(NESTED, { recursive: true })
for (const entry of fs.readdirSync(OUT)) {
  if (KEEP_AT_ROOT.has(entry)) continue
  fs.renameSync(path.join(OUT, entry), path.join(NESTED, entry))
}
// Content types with no published entries yet: drop their placeholder page and section index
// (see lib/static-params.ts), so the site never shows an empty section.
for (const [collection, section] of [['case_studies', 'case-studies'], ['glossary', 'glossary']]) {
  if (loadEntries(collection).length === 0) fs.rmSync(path.join(NESTED, section), { recursive: true, force: true })
}
// Netlify serves the 404 page from the site root.
fs.copyFileSync(path.join(NESTED, '404.html'), path.join(OUT, '404.html'))
console.log('Output nested under out/resources/blog/')
