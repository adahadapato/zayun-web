import { useLocation } from 'react-router'
import { NOT_FOUND_META, PAGE_META, hasOwnMeta, normalisePath } from '../../seo/siteMeta'
import { useHeadTags } from '../../seo/usePageMeta'

/**
 * Keeps the page's <head> right for the page being shown: title, description, canonical address
 * (the one official address of the page, so "/about/" and "/about?x=1" count as "/about"),
 * the link-preview tags (Open Graph for LinkedIn/WhatsApp/Facebook, Twitter card for X)
 * and "noindex" on the not-found page. Invisible on the page. The words live in src/seo/siteMeta.ts.
 *
 * Pages that set their own words (one quote's page) are left alone here: they call usePageMeta (src/seo/usePageMeta.ts) themselves.
 */
export function PageMetaTags() {
  const { pathname } = useLocation()
  const path = normalisePath(pathname)
  const ownMeta = hasOwnMeta(path)

  useHeadTags(ownMeta ? null : (PAGE_META[path] ?? NOT_FOUND_META), path)
  return null
}
