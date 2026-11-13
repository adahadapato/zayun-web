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
import { formatQuoteDate, quotationSchema, quotePageMeta, quotePath } from './quoteText'

/** How many other quotes "More quotes" links to. */
const MORE_COUNT = 3

/**
 * One quote's own page (/quotes/{slug}): the quote with its picture or animation, when it was the quote of the day,
 * and links to a few more. It has its own title, description and share picture for Google and link previews, and is
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

  const more = (archive.data ?? []).filter((q) => q.slug !== slug).slice(0, MORE_COUNT)

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
            <h2 id="more-quotes">More quotes</h2>
            <ul>
              {more.map((q) => (
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
