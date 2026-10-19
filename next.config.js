/** @type {import('next').NextConfig} */
const nextConfig = {
  // Every page is pre-rendered to plain HTML at build time. No server, no client-side rendering of content.
  output: 'export',
  // Served on the main domain at /resources/blog/ via a Netlify proxy on the marketing site.
  basePath: '/resources/blog',
  // One URL shape everywhere: /resources/blog/<slug>/
  trailingSlash: true,
  // Stops Next picking up a stray lockfile higher up the disk as the project root.
  outputFileTracingRoot: import.meta.dirname,
  images: {
    unoptimized: true,
  },
}

export default nextConfig
