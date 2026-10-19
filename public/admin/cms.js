/* global CMS, createClass, h */
// Editor customisations, loaded after Decap:
//   - a self-filling `uuid` field for each entry's permanent ID
//   - preview pane templates that render entries with the site's own look while you type
// Styles come from preview.css, generated at build time by `npm run css:preview` from these class names
// and the site's Tailwind config. Markup mirrors app/[slug]/page.tsx and friends; keep them roughly in sync.

const el = (tag, className, ...children) => h(tag, { className }, ...children)

const summaryBox = (label, text) =>
  text
    ? el('section', 'mb-10 rounded-2xl border border-blue-100 bg-blue-50/60 p-6', label ? el('p', 'text-xs font-bold text-primary uppercase tracking-widest mb-2', label) : null, el('p', 'text-slate-700 leading-relaxed', text))
    : null

const body = (props) =>
  el('div', 'prose prose-slate max-w-none prose-headings:font-black prose-headings:tracking-tight prose-a:text-primary prose-table:text-sm', props.widgetFor('body'))

const cover = (props, data) =>
  data.image ? h('img', { src: String(props.getAsset(data.image)), alt: data.imageAlt || '', className: 'mb-10 w-full rounded-2xl' }) : null

const page = (...children) => el('div', 'min-h-screen bg-[#f9fafb] font-sans text-gray-900 antialiased px-6 py-12', el('div', 'max-w-3xl mx-auto', ...children))

const PostPreview = createClass({
  render() {
    const data = this.props.entry.get('data').toJS()
    const faqs = (data.faqs || []).filter((f) => f && f.question)
    return page(
      el('header', 'mb-10 pb-10 border-b border-slate-100', el('h1', 'text-4xl lg:text-5xl font-black tracking-tight text-gray-900 mb-4 leading-[1.08]', data.title || 'Untitled post'), el('p', 'text-sm text-slate-400', data.date || '')),
      summaryBox('In short', data.summary),
      cover(this.props, data),
      body(this.props),
      faqs.length
        ? el(
            'section',
            'mt-16 pt-10 border-t border-slate-100',
            el('h2', 'text-2xl font-black tracking-tight text-gray-900 mb-6', 'Frequently asked questions'),
            ...faqs.map((f) => el('div', 'mb-6', el('h3', 'text-lg font-bold text-gray-900 mb-2', f.question), el('p', 'text-slate-600 leading-relaxed', f.answer || '')))
          )
        : null
    )
  },
})

const CaseStudyPreview = createClass({
  render() {
    const data = this.props.entry.get('data').toJS()
    const results = (data.results || []).filter((r) => r && r.value)
    const quote = data.quote || {}
    return page(
      el(
        'header',
        'mb-10 pb-10 border-b border-slate-100',
        el('p', 'text-xs font-bold text-primary uppercase tracking-widest mb-3', ['Case study', data.customer, data.industry].filter(Boolean).join(' · ')),
        el('h1', 'text-4xl lg:text-5xl font-black tracking-tight text-gray-900 mb-4 leading-[1.08]', data.title || 'Untitled case study')
      ),
      summaryBox('In short', data.summary),
      results.length
        ? el('section', 'mb-10 grid grid-cols-1 sm:grid-cols-3 gap-4', ...results.map((r) => el('div', 'rounded-2xl border border-slate-200 bg-white p-5 text-center', el('p', 'text-3xl font-black text-gray-900', r.value), el('p', 'mt-1 text-sm text-slate-500', r.label || ''))))
        : null,
      cover(this.props, data),
      body(this.props),
      quote.text
        ? el('figure', 'mt-12 rounded-2xl border-l-4 border-primary bg-white p-6', el('blockquote', 'text-lg text-gray-900 leading-relaxed', `“${quote.text}”`), quote.name ? el('figcaption', 'mt-3 text-sm text-slate-500', [quote.name, quote.role, data.customer].filter(Boolean).join(', ')) : null)
        : null
    )
  },
})

const GlossaryPreview = createClass({
  render() {
    const data = this.props.entry.get('data').toJS()
    return page(
      el('header', 'mb-8', el('p', 'text-xs font-bold text-primary uppercase tracking-widest mb-3', 'Glossary'), el('h1', 'text-4xl lg:text-5xl font-black tracking-tight text-gray-900 leading-[1.08]', `What is ${data.term || '…'}?`)),
      data.definition ? el('section', 'mb-10 rounded-2xl border border-blue-100 bg-blue-50/60 p-6', el('p', 'text-lg text-slate-800 leading-relaxed', data.definition)) : null,
      body(this.props)
    )
  },
})

CMS.registerPreviewStyle('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap')
CMS.registerPreviewStyle('/resources/blog/admin/preview.css')
CMS.registerPreviewTemplate('posts', PostPreview)
CMS.registerPreviewTemplate('case_studies', CaseStudyPreview)
CMS.registerPreviewTemplate('glossary', GlossaryPreview)

// Permanent ID for every entry: generated once when the entry is created, read-only afterwards. Unlike the
// slug or file name it never changes, so it can map content across a migration or a URL change.
const UuidControl = createClass({
  componentDidMount() {
    if (!this.props.value) this.props.onChange(crypto.randomUUID())
  },
  render() {
    return h('input', { type: 'text', id: this.props.forID, className: this.props.classNameWrapper, value: this.props.value || '', readOnly: true })
  },
})
CMS.registerWidget('uuid', UuidControl)
