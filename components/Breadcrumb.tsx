import Link from 'next/link'

// Visible trail matching the BreadcrumbList structured data. `href` values are relative to /resources/blog.
export default function Breadcrumb({ trail }: { trail: { name: string; href: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-slate-400">
      <a href="/" className="hover:text-primary">Home</a>
      <span className="mx-2">/</span>
      <Link href="/" className="hover:text-primary">Blog</Link>
      {trail.map((crumb) => (
        <span key={crumb.href}>
          <span className="mx-2">/</span>
          <Link href={crumb.href} className="hover:text-primary">{crumb.name}</Link>
        </span>
      ))}
    </nav>
  )
}
