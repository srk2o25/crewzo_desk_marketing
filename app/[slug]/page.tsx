import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Cta from '@/components/Cta'
import JsonLd from '@/components/JsonLd'
import Prose from '@/components/Prose'
import { postGraph } from '@/lib/jsonld'
import { absolute, formatDate, getAllPosts, getAuthor, getPost, getSite, postUrl } from '@/lib/content'

const site = getSite()

export const dynamicParams = false

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }))
}

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) return {}

  const url = postUrl(site, post.slug)
  const image = absolute(site, post.image || '/og-image.png')

  return {
    title: post.title,
    description: post.description,
    keywords: post.tags,
    authors: [{ name: getAuthor(post.author).name }],
    alternates: { canonical: url },
    // Snippet controls come from frontmatter. Default -1 = no limit, so answer engines can quote freely.
    robots: {
      index: !post.robots.noindex,
      follow: true,
      'max-snippet': post.robots.maxSnippet,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.description,
      url,
      publishedTime: post.date,
      modifiedTime: post.updated || post.date,
      tags: post.tags,
      images: [{ url: image, alt: post.imageAlt || post.title }],
    },
    twitter: { card: 'summary_large_image', title: post.title, description: post.description, images: [image] },
  }
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) notFound()

  const author = getAuthor(post.author)

  return (
    <article className="pt-32 pb-24 px-6">
      <JsonLd data={postGraph(site, post)} />

      <div className="max-w-3xl mx-auto">
        <nav aria-label="Breadcrumb" className="text-sm text-slate-400">
          <a href="/" className="hover:text-primary">Home</a>
          <span className="mx-2">/</span>
          <Link href="/" className="hover:text-primary">Blog</Link>
        </nav>

        <header className="mt-8 mb-10 pb-10 border-b border-slate-100">
          <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-gray-900 mb-4 leading-[1.08]">{post.title}</h1>
          <p className="text-sm text-slate-400">
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            {post.updated && post.updated !== post.date && (
              <> · Updated <time dateTime={post.updated}>{formatDate(post.updated)}</time></>
            )}
            {' · '}
            {author.name}
          </p>
        </header>

        {/* The 60-word answer to the post's headline question: the block answer engines lift first. */}
        <section aria-label="Summary" className="mb-10 rounded-2xl border border-blue-100 bg-blue-50/60 p-6">
          <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">In short</p>
          <p className="text-slate-700 leading-relaxed">{post.summary}</p>
        </section>

        {post.image && (
          <img src={post.image} alt={post.imageAlt} className="mb-10 w-full rounded-2xl" width={1200} height={630} fetchPriority="high" />
        )}

        <Prose html={post.html} />

        {post.faqs.length > 0 && (
          <section className="mt-16 pt-10 border-t border-slate-100" aria-labelledby="faq">
            <h2 id="faq" className="text-2xl font-black tracking-tight text-gray-900 mb-6">Frequently asked questions</h2>
            <div className="space-y-6">
              {post.faqs.map((faq) => (
                <div key={faq.question}>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{faq.question}</h3>
                  <p className="text-slate-600 leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <Cta />
      </div>
    </article>
  )
}
