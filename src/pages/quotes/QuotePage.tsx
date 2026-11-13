import { useEffect, useMemo } from 'react'
import { Link, useParams } from 'react-router'

import { ApiError } from '../../api/apiError'
import { usePageMeta } from '../../seo/usePageMeta'
import { ContentStatus } from '../../components/ui/ContentStatus'
import { QuoteFigure } from '../../components/ui/QuoteFigure'
import { QUOTE_KIND_LABELS } from '../../components/ui/quoteLabels'
import { QuoteMedia } from '../../components/ui/QuoteMedia'
import { NOT_FOUND_META } from '../../seo/siteMeta'
import { useArchivedQuote, useQuoteArchive } from '../../state/contentQueries'
import NotFound from '../notfound/NotFound'
import { formatQuoteDate, quotationSchema, quotePageMeta, quotePath, relatedQuotes, themePath } from './quoteText'

/** How many other quotes "Related quotes" / "More quotes" links to. */
const MORE_COUNT = 3

/**
 * One quote's own page (/quotes/{slug}): the quote with its picture or animation, its themes (each opens the list
 * filtered to that theme), when it was the quote of the day, and a few related quotes (sharing the most themes; the
 * most recent ones when none share a theme). It has its own title, description and share picture for Google and link previews, and is
 * labelled as a quotation for Google.
 *
 * Drafts, unchecked quotes and pinned / series quotes before their day answer 404 from the API: the page then shows
 * "Page not found" (and asks search engines not to list it).
 */
function QuotePage() {
  const { slug = '' } = useParams()
  const quote = useArchivedQuote(slug)
  const archive = useQuoteArchive()

  const notFound = quote.error instanceof ApiError && quote.error.status === 404
  const data = quote.data

  const meta = useMemo(() => (data ? quotePageMeta(data) : notFound ? NOT_FOUND_META : null), [data, notFound])
  usePageMeta(meta)
  useQuotationSchema(data ? quotationSchema(data) : null)

  if (notFound) return <NotFound />

  const more = data ? relatedQuotes(data, archive.data ?? [], MORE_COUNT) : []
  const anyShared = more.some((m) => m.shared > 0)

  return (
    <div className="quote-page">
      <div className="container quote-page-column">
        <Link to="/quotes" className="quote-page-back">
          <span aria-hidden="true">←</span> All quotes
        </Link>

        <ContentStatus
          isLoading={quote.isLoading}
          error={notFound ? null : quote.error}
          onRetry={() => quote.refetch()}
          placeholders={1}
          height={320}
        />

        {data && (
          <>
            <h1 className="visually-hidden">
              {data.translation ?? data.text} · {data.author}
            </h1>

            <article className={`quote-card quote-page-card${data.media ? ' quote-card-with-media' : ''}`}>
              {data.media && <QuoteMedia media={data.media} />}

              <div className="quote-body">
                <span className="section-kicker quote-kicker">
                  {data.series ? `${data.series} · ${QUOTE_KIND_LABELS[data.kind]}` : QUOTE_KIND_LABELS[data.kind]}
                </span>
                <QuoteFigure quote={data} />

                {data.themes.length > 0 && (
                  <ul className="quote-page-themes" aria-label="Themes">
                    {data.themes.map((theme) => (
                      <li key={theme}><Link to={themePath(theme)}>{theme}</Link></li>
                    ))}
                  </ul>
                )}

                {data.lastShown && (
                  <p className="quote-page-shown">
                    Quote of the day on <time dateTime={data.lastShown}>{formatQuoteDate(data.lastShown)}</time>
                  </p>
                )}
              </div>
            </article>
          </>
        )}

        {data && more.length > 0 && (
          <section className="quote-page-more" aria-labelledby="more-quotes">
            <h2 id="more-quotes">{anyShared ? 'Related quotes' : 'More quotes'}</h2>
            <ul>
              {more.map(({ quote: q }) => (
                <li key={q.id}>
                  <Link to={quotePath(q.slug)}>
                    <span className="quote-page-more-text">“{q.translation ?? q.text}”</span>
                    <span className="quote-page-more-author">{q.author}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  )
}

/** Puts the quotation labels for Google in the page's <head> while the page is open (like PersonSchema). */
function useQuotationSchema(data: Record<string, unknown> | null) {
  const json = data ? JSON.stringify(data) : null

  useEffect(() => {
    if (!json) return
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.dataset.zayun = 'quote'
    script.textContent = json
    document.head.querySelectorAll('script[data-zayun="quote"]').forEach((s) => s.remove())
    document.head.appendChild(script)
    return () => script.remove()
  }, [json])
}

export default QuotePage
