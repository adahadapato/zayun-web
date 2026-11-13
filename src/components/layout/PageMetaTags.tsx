import { useEffect } from 'react'
import { useLocation } from 'react-router'
import {
  DEFAULT_SHARE_IMAGE,
  NOT_FOUND_META,
  PAGE_META,
  SITE_NAME,
  SITE_URL,
  normalisePath,
} from '../../seo/siteMeta'

/**
 * Keeps the page's <head> right for the page being shown: title, description, canonical address
 * (the one official address of the page, so "/about/" and "/about?x=1" count as "/about"),
 * the link-preview tags (Open Graph for LinkedIn/WhatsApp/Facebook, Twitter card for X)
 * and "noindex" on the not-found page. Invisible on the page. The words live in src/seo/siteMeta.ts.
 */
export function PageMetaTags() {
  const { pathname } = useLocation()
  const path = normalisePath(pathname)
  const meta = PAGE_META[path] ?? NOT_FOUND_META
  const url = `${SITE_URL}${path === '/' ? '/' : path}`

  useEffect(() => {
    document.title = meta.title

    setMeta('name', 'description', meta.description)
    setMeta('name', 'robots', meta.noIndex ? 'noindex' : null)

    setMeta('property', 'og:type', 'website')
    setMeta('property', 'og:site_name', SITE_NAME)
    setMeta('property', 'og:locale', 'en_GB')
    setMeta('property', 'og:title', meta.title)
    setMeta('property', 'og:description', meta.description)
    setMeta('property', 'og:url', meta.noIndex ? null : url)
    setMeta('property', 'og:image', DEFAULT_SHARE_IMAGE)
    setMeta('property', 'og:image:width', '1200')
    setMeta('property', 'og:image:height', '630')
    setMeta('property', 'og:image:alt', 'The Zayun logo: a glowing brain made of connected points, beside the word ZAYUN')

    setMeta('name', 'twitter:card', 'summary_large_image')
    setMeta('name', 'twitter:title', meta.title)
    setMeta('name', 'twitter:description', meta.description)
    setMeta('name', 'twitter:image', DEFAULT_SHARE_IMAGE)

    setCanonical(meta.noIndex ? null : url)
  }, [meta, url])

  return null
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
