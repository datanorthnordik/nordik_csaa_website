/**
 * Living History blogs are addressed in the URL by a slug derived from their
 * heading. The API only fetches a blog by numeric id, so the slug is resolved
 * back to an id by matching against the blog list (see blogsApi.getBlogBySlug).
 */
export function slugifyBlogHeading(heading: string): string {
  return heading
    .toLowerCase()
    .normalize('NFKD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function blogDetailPath(blog: { heading: string }): string {
  return `/living-history-hub/${slugifyBlogHeading(blog.heading)}`
}
