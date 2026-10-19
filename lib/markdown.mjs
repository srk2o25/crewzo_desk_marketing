// Markdown -> HTML at build time. Plain CommonMark + GFM tables, plus standard HTML blocks
// (sanitised) for anything richer. No MDX, no shortcodes.
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'
import rehypeSlug from 'rehype-slug'
import rehypeStringify from 'rehype-stringify'
import { visit } from 'unist-util-visit'

// Default GitHub-style allowlist, plus the HTML blocks authors may use and the data-nosnippet attribute.
const schema = {
  ...defaultSchema,
  clobberPrefix: '',
  tagNames: [...defaultSchema.tagNames, 'figure', 'figcaption', 'section', 'aside', 'mark', 'abbr', 'cite', 'time'],
  attributes: {
    ...defaultSchema.attributes,
    '*': [...(defaultSchema.attributes['*'] ?? []), 'dataNosnippet', 'className', 'id'],
    time: ['dateTime'],
    abbr: ['title'],
    th: [...(defaultSchema.attributes.th ?? []), 'scope'],
  },
}

function rehypeLinksAndImages() {
  return (tree) => {
    visit(tree, 'element', (node) => {
      if (node.tagName === 'img') {
        node.properties.loading = 'lazy'
        node.properties.decoding = 'async'
      }
      if (node.tagName === 'a' && typeof node.properties.href === 'string' && /^https?:\/\//.test(node.properties.href)) {
        // Outbound citations stay followable; no nofollow, no referrer stripping.
        node.properties.rel = ['noopener']
      }
    })
  }
}

export async function renderMarkdown(markdown) {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeSanitize, schema)
    .use(rehypeSlug)
    .use(rehypeLinksAndImages)
    .use(rehypeStringify)
    .process(markdown)
  return String(file)
}
