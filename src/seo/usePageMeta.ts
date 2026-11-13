import { useEffect } from 'react'
import { useLocation } from 'react-router'
import { DEFAULT_SHARE_IMAGE, SITE_NAME, SITE_URL, normalisePath, type PageMeta } from './siteMeta'

/** Alt text of the Zayun share picture (public/og-image.png). */
const DEFAULT_SHARE_IMAGE_ALT = 'The Zayun logo: a glowing brain made of connected points, beside the word ZAYUN'

/**
 * For a page that sets its own words (e.g. a quote's page): the same tags as PageMetaTags, from the page's data.
 * @param meta The words; null while the page is still loading (the tags are left as they are).
 */
export function usePageMeta(meta: PageMeta | null) {
  const { pathname } = useLocation()
  useHeadTags(meta, normalisePath(pathname))
}

/** Writes the tags for a page (does nothing while meta is null). Used by PageMetaTags and usePageMeta. */
export function useHeadTags(meta: PageMeta | null, path: string) {
  useEffect(() => {
    if (!meta) return

    const url = `${SITE_URL}${path === '/' ? '/' : path}`
    const image = meta.image ?? DEFAULT_SHARE_IMAGE
    const ownImage = meta.image !== undefined

    document.title = meta.title

    setMeta('name', 'description', meta.description)
    setMeta('name', 'robots', meta.noIndex ? 'noindex' : null)

    setMeta('property', 'og:type', 'website')
    setMeta('property', 'og:site_name', SITE_NAME)
    setMeta('property', 'og:locale', 'en_GB')
    setMeta('property', 'og:title', meta.title)
    setMeta('property', 'og:description', meta.description)
    setMeta('property', 'og:url', meta.noIndex ? null : url)
    setMeta('property', 'og:image', image)
    // The size is only known for the Zayun share picture
    setMeta('property', 'og:image:width', ownImage ? null : '1200')
    setMeta('property', 'og:image:height', ownImage ? null : '630')
    setMeta('property', 'og:image:alt', meta.imageAlt ?? (ownImage ? null : DEFAULT_SHARE_IMAGE_ALT))

    setMeta('name', 'twitter:card', 'summary_large_image')
    setMeta('name', 'twitter:title', meta.title)
    setMeta('name', 'twitter:description', meta.description)
    setMeta('name', 'twitter:image', image)

    setCanonical(meta.noIndex ? null : url)
  }, [meta, path])
}

/** Adds, updates or (content null) removes one <meta> tag. */
function setMeta(attribute: 'name' | 'property', key: string, content: string | null) {
  let tag = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`)
  if (content === null) {
    tag?.remove()
    return
  }
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute(attribute, key)
    document.head.appendChild(tag)
  }
  tag.content = content
}

/** Adds, updates or (href null) removes <link rel="canonical">. */
function setCanonical(href: string | null) {
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (href === null) {
    link?.remove()
    return
  }
  if (!link) {
    link = document.createElement('link')
    link.rel = 'canonical'
    document.head.appendChild(link)
  }
  link.href = href
}
