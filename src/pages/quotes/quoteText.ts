/**
 * Small helpers shared by the quote pages (/quotes and /quotes/{slug}): dates, the words for search engines and link
 * previews, and the quotation labels for Google (schema.org Quotation).
 */
import type { ArchivedQuoteDto } from '../../api/contracts/dtos'
import { fileUrl } from '../../api/config'
import { SITE_URL, shorten, type PageMeta } from '../../seo/siteMeta'

/** "2026-11-13" → "13 November 2026" (read as a calendar date, so no time zone can move it a day). */
export function formatQuoteDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
  })
}

/** A quote's own address on the website. */
export const quotePath = (slug: string) => `/quotes/${slug}`

/** The /quotes list filtered to one theme. */
export const themePath = (theme: string) => `/quotes?theme=${encodeURIComponent(theme)}`

/**
 * Up to `count` quotes to show under a quote: the ones sharing the most themes first, then the most recently shown
 * (the list arrives most recent first, so for equal scores its order is kept).
 */
export function relatedQuotes(quote: ArchivedQuoteDto, all: ArchivedQuoteDto[], count: number) {
  const themes = new Set(quote.themes.map((t) => t.toLowerCase()))
  return all
    .filter((q) => q.slug !== quote.slug)
    .map((q, position) => ({ q, position, shared: q.themes.filter((t) => themes.has(t.toLowerCase())).length }))
    .sort((a, b) => b.shared - a.shared || a.position - b.position)
    .slice(0, count)
    .map(({ q, shared }) => ({ quote: q, shared }))
}

/**
 * The title, description and share picture of a quote's page, e.g.
 * title "“Nothing in biology makes sense except in…” · Theodosius Dobzhansky | Zayun".
 * The English translation is used for proverbs, so the title is readable.
 */
export function quotePageMeta(quote: ArchivedQuoteDto): PageMeta {
  const words = quote.translation ?? quote.text
  const description =
    `“${quote.text}”` +
    (quote.translation ? ` In English: “${quote.translation}”` : '') +
    ` — ${quote.author}${quote.source ? `, ${quote.source}` : ''}.`

  return {
    title: `“${shorten(words, 48)}” · ${quote.author} | Zayun`,
    // The description written (or drafted with AI) in Admin → Quotes, otherwise one made from the words
    description: shorten(quote.searchDescription ?? description, 160),
    image: quote.media ? fileUrl(quote.media.pictureUrl) : undefined,
    imageAlt: quote.media?.altText,
  }
}

/**
 * schema.org Quotation for Google: the words, who said them, the source and the page. Proverbs have no single author,
 * so they get no creator; the owner's own sayings point to the Person on the site (see PersonSchema).
 */
export function quotationSchema(quote: ArchivedQuoteDto): Record<string, unknown> {
  const creator =
    quote.kind === 'Proverb'
      ? undefined
      : quote.kind === 'OwnSaying'
        ? { '@type': 'Person', name: quote.author, url: SITE_URL }
        : { '@type': 'Person', name: quote.author }

  return {
    '@context': 'https://schema.org',
    '@type': 'Quotation',
    text: quote.text,
    ...(quote.translation ? { description: `In English: ${quote.translation}` } : {}),
    ...(quote.language ? { inLanguage: quote.language } : {}),
    ...(creator ? { creator } : {}),
    ...(quote.source ? { citation: quote.source } : {}),
    ...(quote.themes.length ? { keywords: quote.themes.join(', ') } : {}),
    ...(quote.media ? { image: fileUrl(quote.media.pictureUrl) } : {}),
    url: `${SITE_URL}${quotePath(quote.slug)}`,
    isPartOf: { '@type': 'WebSite', name: 'Zayun', url: SITE_URL },
  }
}
