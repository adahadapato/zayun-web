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
 * page. The filters are kept in the address (?kind=Proverb, ?theme=Nature from a theme on a quote's page), so a
 * filtered list can be shared; the buttons for kinds with no quotes yet are left out.
 */
function Quotes() {
  const archive = useQuoteArchive()
  const [searchParams, setSearchParams] = useSearchParams()

  const all = archive.data ?? []
  const kindParam = searchParams.get('kind')
  const kind = isQuoteKind(kindParam) ? kindParam : null
  // ?theme=Nature (from a theme on a quote's page), any letter case
  const theme = searchParams.get('theme')?.trim() || null
  const themeKey = theme?.toLowerCase()
  const inTheme = themeKey ? all.filter((q) => q.themes.some((t) => t.toLowerCase() === themeKey)) : all
  const themeName = themeKey ? (inTheme[0]?.themes.find((t) => t.toLowerCase() === themeKey) ?? theme) : null
  const items = kind ? inTheme.filter((q) => q.kind === kind) : inTheme

  const filters = FILTERS
    .map((f) => ({ ...f, count: f.kind ? inTheme.filter((q) => q.kind === f.kind).length : inTheme.length }))
    .filter((f) => f.kind === null || f.count > 0)

  /** Changes one part of the filter (kind or theme), keeping the other. */
  const update = (changes: { kind?: QuoteKind | null; theme?: string | null }) => {
    const next = { kind, theme: themeName, ...changes }
    const params: Record<string, string> = {}
    if (next.kind) params.kind = next.kind
    if (next.theme) params.theme = next.theme
    setSearchParams(params, { replace: true, preventScrollReset: true })
  }
  const choose = (next: QuoteKind | null) => update({ kind: next })

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

          {themeName && (
            <p className="quotes-theme">
              <span>Theme: <strong>{themeName}</strong></span>
              <button type="button" className="quotes-theme-clear" onClick={() => update({ theme: null })}>
                Show all themes
              </button>
            </p>
          )}

          <ContentStatus
            isLoading={archive.isLoading}
            error={archive.error}
            isEmpty={items.length === 0}
            emptyText={themeName ? `No quotes with the theme ${themeName} yet.` : 'Quotes will appear here soon.'}
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

                  {q.themes.length > 0 && <p className="quotes-item-themes">{q.themes.join(' · ')}</p>}

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
