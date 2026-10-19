// All structured data is generated here from frontmatter + site settings. Markdown never contains JSON-LD.
// Entities are linked by @id so the graph nests: BlogPosting -> author (Person) / publisher (Organization)
// -> sameAs profiles; FAQPage and BreadcrumbList hang off the same WebPage.
import {
  absolute,
  blogUrl,
  caseStudyUrl,
  externalLinks,
  getAuthor,
  glossaryUrl,
  postUrl,
  type Author,
  type CaseStudy,
  type GlossaryTerm,
  type Post,
  type Site,
} from './content'

const orgId = (site: Site) => `${site.url}/#organization`
const websiteId = (site: Site) => `${site.url}/#website`
const productId = (site: Site) => `${site.url}/#product`
const authorId = (site: Site, author: Author) =>
  author.type === 'Organization' ? orgId(site) : `${site.url}/resources/blog/#author-${author.slug}`

// The marketing site publishes the same Organization/WebSite nodes with the same @ids.
function organization(site: Site) {
  return {
    '@type': 'Organization',
    '@id': orgId(site),
    name: site.name,
    url: `${site.url}/`,
    logo: { '@type': 'ImageObject', url: absolute(site, site.logo) },
    email: site.email,
    description: site.description,
    sameAs: site.sameAs,
  }
}

function website(site: Site) {
  return { '@type': 'WebSite', '@id': websiteId(site), name: site.name, url: `${site.url}/`, publisher: { '@id': orgId(site) } }
}

function product(site: Site) {
  return {
    '@type': 'SoftwareApplication',
    '@id': productId(site),
    name: site.product.name,
    description: site.product.description,
    applicationCategory: site.product.category,
    operatingSystem: 'Web',
    url: site.product.url,
    publisher: { '@id': orgId(site) },
  }
}

function person(site: Site, author: Author) {
  return {
    '@type': 'Person',
    '@id': authorId(site, author),
    name: author.name,
    ...(author.jobTitle ? { jobTitle: author.jobTitle } : {}),
    ...(author.bio ? { description: author.bio } : {}),
    ...(author.image ? { image: absolute(site, author.image) } : {}),
    worksFor: { '@id': orgId(site) },
    sameAs: author.sameAs,
  }
}

// Inline outbound links become the article's citation list, so writers just link normally in the text.
function citations(body: string) {
  const urls = externalLinks(body)
  return urls.length ? { citation: urls.map((url) => ({ '@type': 'CreativeWork', url })) } : {}
}

type Crumb = { name: string; item: string }

// Home > Blog > ... > page
function breadcrumbs(site: Site, trail: Crumb[]) {
  const items = [{ name: 'Home', item: `${site.url}/` }, { name: 'Blog', item: blogUrl(site) }, ...trail]
  return {
    '@type': 'BreadcrumbList',
    '@id': `${items[items.length - 1].item}#breadcrumb`,
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, ...it })),
  }
}

export function postGraph(site: Site, post: Post) {
  const url = postUrl(site, post.slug)
  const author = getAuthor(post.author)
  const image = absolute(site, post.image || '/og-image.png')

  const graph: object[] = [
    organization(site),
    website(site),
    breadcrumbs(site, [{ name: post.title, item: url }]),
    {
      '@type': 'BlogPosting',
      '@id': `${url}#article`,
      identifier: post.id,
      headline: post.title,
      description: post.description,
      abstract: post.summary,
      datePublished: post.date,
      dateModified: post.updated || post.date,
      image,
      url,
      mainEntityOfPage: { '@type': 'WebPage', '@id': url },
      isPartOf: { '@id': websiteId(site) },
      author: { '@id': authorId(site, author) },
      publisher: { '@id': orgId(site) },
      keywords: post.tags.join(', '),
      inLanguage: 'en-GB',
      ...(post.product ? { about: { '@id': productId(site) } } : {}),
      ...citations(post.body),
    },
  ]

  if (author.type === 'Person') graph.push(person(site, author))
  if (post.product) graph.push(product(site))
  if (post.faqs.length) {
    graph.push({
      '@type': 'FAQPage',
      '@id': `${url}#faq`,
      isPartOf: { '@id': `${url}#article` },
      mainEntity: post.faqs.map((f) => ({
        '@type': 'Question',
        name: f.question,
        acceptedAnswer: { '@type': 'Answer', text: f.answer },
      })),
    })
  }

  return { '@context': 'https://schema.org', '@graph': graph }
}

export function blogGraph(site: Site, posts: Post[]) {
  const url = blogUrl(site)
  return {
    '@context': 'https://schema.org',
    '@graph': [
      organization(site),
      website(site),
      breadcrumbs(site, []),
      {
        '@type': 'Blog',
        '@id': `${url}#blog`,
        name: site.blog.title,
        description: site.blog.description,
        url,
        publisher: { '@id': orgId(site) },
        isPartOf: { '@id': websiteId(site) },
        blogPost: posts.map((p) => ({
          '@type': 'BlogPosting',
          '@id': `${postUrl(site, p.slug)}#article`,
          headline: p.title,
          url: postUrl(site, p.slug),
          datePublished: p.date,
        })),
      },
    ],
  }
}

export function caseStudyGraph(site: Site, cs: CaseStudy) {
  const url = caseStudyUrl(site, cs.slug)
  return {
    '@context': 'https://schema.org',
    '@graph': [
      organization(site),
      website(site),
      product(site),
      breadcrumbs(site, [
        { name: 'Case studies', item: caseStudyUrl(site) },
        { name: cs.title, item: url },
      ]),
      {
        '@type': 'Article',
        '@id': `${url}#article`,
        identifier: cs.id,
        headline: cs.title,
        description: cs.description,
        abstract: cs.summary,
        datePublished: cs.date,
        dateModified: cs.updated || cs.date,
        image: absolute(site, cs.image || '/og-image.png'),
        url,
        mainEntityOfPage: { '@type': 'WebPage', '@id': url },
        isPartOf: { '@id': websiteId(site) },
        author: { '@id': orgId(site) },
        publisher: { '@id': orgId(site) },
        about: [
          { '@type': 'Organization', name: cs.customer, ...(cs.customerUrl ? { url: cs.customerUrl } : {}) },
          { '@id': productId(site) },
        ],
        keywords: cs.tags.join(', '),
        inLanguage: 'en-GB',
        ...citations(cs.body),
      },
    ],
  }
}

export function glossaryTermGraph(site: Site, term: GlossaryTerm) {
  const url = glossaryUrl(site, term.slug)
  return {
    '@context': 'https://schema.org',
    '@graph': [
      organization(site),
      website(site),
      breadcrumbs(site, [
        { name: 'Glossary', item: glossaryUrl(site) },
        { name: term.term, item: url },
      ]),
      { '@type': 'DefinedTermSet', '@id': `${glossaryUrl(site)}#set`, name: `${site.name} glossary`, url: glossaryUrl(site) },
      {
        '@type': 'DefinedTerm',
        '@id': `${url}#term`,
        identifier: term.id,
        name: term.term,
        description: term.definition,
        url,
        inDefinedTermSet: { '@id': `${glossaryUrl(site)}#set` },
      },
    ],
  }
}

export function collectionGraph(site: Site, name: string, url: string, items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      organization(site),
      website(site),
      breadcrumbs(site, [{ name, item: url }]),
      {
        '@type': 'CollectionPage',
        '@id': `${url}#page`,
        name,
        url,
        isPartOf: { '@id': websiteId(site) },
        mainEntity: { '@type': 'ItemList', itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, url: it.url })) },
      },
    ],
  }
}
