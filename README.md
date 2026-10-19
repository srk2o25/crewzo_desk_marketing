# Crewzo Desk content (blog)

The blog at **https://crewzo.co.in/resources/blog/**. Entries are written in Decap CMS and stored as plain Markdown in this repo. They're built into static HTML with Next.js and served on the main domain through a proxy rule on the landing page (the `crewzodesk` folder: see `_redirects`).

**Editor:** https://crewzo.co.in/resources/blog/admin/ (log in with a GitHub account that has write access to this repo).

## Content types

| Type | Folder | URL | Notes |
| --- | --- | --- | --- |
| Post | `content/posts/` | `/resources/blog/<slug>/` | Articles |
| Case study | `content/case-studies/` | `/resources/blog/case-studies/<slug>/` | Real customers and measured results only |
| Glossary term | `content/glossary/` | `/resources/blog/glossary/<slug>/` | Page titled "What is <term>?" |

A type with no published entries has no pages, index or sitemap entry. Its section appears automatically with the first entry.

To add another type:
1. Add its fields to `lib/schema.mjs` (`COLLECTIONS`).
2. Add a matching collection to `public/admin/config.yml`.
3. Add pages under `app/`.

The build fails if steps 1 and 2 disagree (`scripts/check-config.mjs`).

```
content/<type>/<slug>.md     one file per entry, flat, no dates in names
content/authors/<slug>.yml   authors (Person schema + sameAs)
content/settings/site.yml    organisation + product entity
public/images/blog/          every image, one central folder
public/admin/                Decap CMS: config.yml (the forms) and cms.js (ID field, styled previews)
lib/schema.mjs               the frontmatter contract for every type
lib/jsonld.ts                all JSON-LD, generated from frontmatter, never written in Markdown
scripts/check-config.mjs     editor forms and schema must match (runs before every build)
scripts/lint-content.mjs     content rules (runs before every build)
scripts/verify-build.mjs     checks the exported HTML like a crawler would (runs after every build)
```

Every entry has a permanent `id` (a UUID the editor fills in once). It never changes when a slug or URL does, so it's the key for mapping content during a migration.

## Publishing flow

1. **Save** in the editor makes a draft: a `cms/…` branch plus a pull request. Netlify builds a deploy preview.
2. Move it to **In review**. The reviewer reads it in the editor's styled preview or on the deploy preview.
3. Move it to **Ready**, then **Publish**. Decap merges into `main` and Netlify deploys in about a minute.

There's no staging step for content. If a build fails, Netlify keeps the previous version live.

| Level | Rules |
| --- | --- |
| Error: blocks publishing | Lowercase-hyphenated slug matching the filename, no date prefix · valid frontmatter, unique ID · no H1 in the body · no MDX, shortcodes, wikilinks, JSX or `<script>` · images under `/images/blog/` with alt text · internal links root-relative, lowercase, trailing slash · external links https |
| Warning: writing guidance | H2/H3 phrased as a reader's question · ~60-word answer right under each H2/H3 · summary/definition ≤ 60 words · FAQ questions end in `?`, answers ≤ 60 words · paragraphs ≤ 120 words, not opening with "This/It/However…" · posts: at least one list or table, one internal link, and an inline link for facts and figures |

## Writing guide

- **Title** is the question the post answers. **Summary** is the direct answer in about 60 words, shown at the top of the page and in `llms.txt`. **Meta description** is the search result and link preview text.
- **Headings** are questions a reader would type. Answer in the first paragraph under each one.
- **Every paragraph should stand alone.** Name the subject instead of writing "this" or "it".
- **Link sources inline**, in the sentence that uses them. Outbound links are added to the structured data automatically.
- **FAQs** are optional follow-up questions about the topic, not about Crewzo Desk.
- **Rich layout** uses standard HTML inside Markdown: `<table>`, `<figure>`, `<details>`. Wrap text you don't want quoted in `<div data-nosnippet>…</div>`.

## Local development

```bash
npm install
npm run cms          # editor at http://localhost:3000/resources/blog/admin/index.html, saving straight to files
npm run dev          # site only, at http://localhost:3000/resources/blog/
npm run build        # config check -> lint -> llms.txt -> static export -> verify
npm run test:lint    # self-test: the lint must reject scripts/fixtures/
```

In local mode (`npm run cms`), the editor uses this folder instead of GitHub: no login, no drafts or pull requests. Commit and push the changes yourself.

`SITE_URL=https://new-domain.example npm run build` rebuilds every canonical, sitemap and JSON-LD URL for the new domain.
