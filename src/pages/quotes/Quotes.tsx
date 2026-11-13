import { Link, useSearchParams } from 'react-router'

import { fileUrl } from '../../api/config'
import type { QuoteKind } from '../../api/contracts/enums'
import { ContentStatus } from '../../components/ui/ContentStatus'
import { QUOTE_KIND_LABELS, languageCode } from '../../components/ui/quoteLabels'
import { useQuoteArchive } from '../../state/contentQueries'
import { formatQuoteDate, quotePath } from './quoteText'

/** The filter buttons, in order. "All" has no kind. */
const FILTERS: { kind: QuoteKind | null; label: string }[] = [
  { kind: null, label: 'All' },
  { kind: 'Quote', label: 'Quotes' },
  { kind: 'Proverb', label: 'Proverbs' },
  { kind: 'OwnSaying', label: 'My sayings' },
]

const isQuoteKind = (value: string | null): value is QuoteKind =>
  value === 'Quote' || value === 'Proverb' || value === 'OwnSaying'

/**
 * All quotes (/quotes): every quote of the day so far, most recent first, then the everyday quotes still to come.
 * Pinned and "Nature first" quotes only appear once their day has come (the API decides). Each one links to its own
 * page. The filter is kept in the address (?kind=Proverb), so a filtered list can be shared; the buttons for kinds
 * with no quotes yet are left out.
 */
function Quotes() {
  const archive = useQuoteArchive()
  const [searchParams, setSearchParams] = useSearchParams()

  const all = archive.data ?? []
  const kindParam = searchParams.get('kind')
  const kind = isQuoteKind(kindParam) ? kindParam : null
  const items = kind ? all.filter((q) => q.kind === kind) : all

  const filters = FILTERS
    .map((f) => ({ ...f, count: f.kind ? all.filter((q) => q.kind === f.kind).length : all.length }))
    .filter((f) => f.kind === null || f.count > 0)

  const choose = (next: QuoteKind | null) =>
    setSearchParams(next ? { kind: next } : {}, { replace: true, preventScrollReset: true })

  return (
    <div className="quotes-page">
      <section className="quotes-hero">
        <div className="container">
          <span className="section-kicker">Quotes</span>

          <h1>
            Nature first,
            <br />
            <span>then the machines.</span>
          </h1>

          <p className="quotes-intro">
            Every quote of the day from this site: words on nature, science, technology and AI, proverbs from home,
            and a few sayings of my own. Each one with who said it and where.
          </p>
        </div>
      </section>

      <section className="quotes-content">
        <div className="container">
          {filters.length > 2 && (
            <div className="quotes-filters" role="group" aria-label="Show">
              {filters.map((f) => (
                <button
                  key={f.label}
                  type="button"
                  className="quotes-filter"
                  aria-pressed={kind === f.kind}
                  onClick={() => choose(f.kind)}
                >
                  {f.label} <span className="quotes-filter-count">{f.count}</span>
                </button>
              ))}
            </div>
          )}

          <ContentStatus
            isLoading={archive.isLoading}
            error={archive.error}
            isEmpty={items.length === 0}
            emptyText="Quotes will appear here soon."
            onRetry={() => archive.refetch()}
            placeholders={4}
            height={180}
          />

          <ul className="quotes-list">
            {items.map((q) => (
              <li key={q.id} className={`quotes-item${q.media ? ' quotes-item-with-media' : ''}`}>
                {q.media && (
                  <img
                    className="quotes-item-picture"
                    src={fileUrl(q.media.thumbnailUrl ?? q.media.pictureUrl)}
                    alt=""
                    loading="lazy"
                    width={q.media.width}
                    height={q.media.height}
                  />
                )}

                <div className="quotes-item-body">
                  <p className="quotes-item-meta">
                    {q.lastShown
                      ? <>Quote of the day · <time dateTime={q.lastShown}>{formatQuoteDate(q.lastShown)}</time></>
                      : q.series ?? QUOTE_KIND_LABELS[q.kind]}
                  </p>

                  <blockquote className="quotes-item-text" lang={languageCode(q.language)}>
                    <p><Link to={quotePath(q.slug)}>“{q.text}”</Link></p>
                  </blockquote>

                  {q.translation && <p className="quotes-item-translation">In English: {q.translation}</p>}

                  <p className="quotes-item-author">
                    <span aria-hidden="true">— </span>{q.author}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  )
}

export default Quotes
