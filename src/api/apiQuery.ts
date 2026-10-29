/**
 * Builds a path with a query string, leaving out empty values. Same helper as the Phloem website.
 * @example withQuery('api/admin/contact-messages', { status: 'New', search: '', page: 2 }) → "api/admin/contact-messages?status=New&page=2"
 */
export function withQuery(path: string,
                          params: Record<string, string | number | boolean | null | undefined>): string {
  const query = new URLSearchParams()
  for (const [name, value] of Object.entries(params)) {
    if (value === null || value === undefined || value === '') continue
    query.set(name, String(value))
  }
  const text = query.toString()
  return text ? `${path}?${text}` : path
}
