// A static export fails on a dynamic route with no pages to generate, which is the normal state for a
// content type before its first entry is published. An empty collection renders one placeholder page that
// 404s, and scripts/nest-output.mjs deletes it (and the section) from the output.
export const PLACEHOLDER = '__empty__'

export function withPlaceholder(params: { slug: string }[]) {
  return params.length ? params : [{ slug: PLACEHOLDER }]
}
