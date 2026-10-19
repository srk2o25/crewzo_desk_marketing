// Rendered Markdown body, styled like the rest of the site.
export default function Prose({ html }: { html: string }) {
  return (
    <div
      className="prose prose-slate max-w-none prose-headings:font-black prose-headings:tracking-tight prose-a:text-primary hover:prose-a:text-primary-dark prose-table:text-sm"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
