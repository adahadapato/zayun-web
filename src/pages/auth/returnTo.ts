/**
 * Where to go after signing in: the `?returnTo=` page (set by ProtectedRoute, e.g. an admin page), or the admin Overview.
 * Only pages on THIS site are allowed ("/admin/projects", not "https://…" or "//evil.com"), so a link can't be used to send
 * people to another website after they sign in.
 */
export function safeReturnTo(value: string | null): string {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) return '/admin'
  return value
}
