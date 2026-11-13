/**
 * Today's quote from the API (GET /api/quotes/today): the same quote for everyone all day, changing at UK midnight.
 *
 * Two looks:
 * - `card` (Home, below the hero): the full quote (QuoteFigure), the picture or animation when the quote has one
 *   (QuoteMedia), and links to the quote's own page and to all quotes (/quotes).
 * - `line` (About, under the intro): a quieter single line with the quote and who said it.
 *
 * Shows nothing while loading, when there's no quote (404) or when the API can't be reached: a missing quote should
 * never leave an empty box or an error on the page.
 */
import { Link } from 'react-router'
import type { QuoteOfTheDayDto } from '../../api/contracts/dtos'
import { useQuoteOfTheDay } from '../../state/contentQueries'
import { QuoteFigure } from './QuoteFigure'
import { languageCode } from './quoteLabels'
import { QuoteMedia } from './QuoteMedia'

type QuoteOfTheDayProps = {
  /** `card` for Home, `line` for About. */
  variant: 'card' | 'line'
}

export function QuoteOfTheDay({ variant }: QuoteOfTheDayProps) {
  const { data: quote } = useQuoteOfTheDay()
  if (!quote) return null

  return variant === 'card' ? <QuoteCard quote={quote} /> : <QuoteLine quote={quote} />
}

/** Home: the full card. */
function QuoteCard({ quote }: { quote: QuoteOfTheDayDto }) {
  const kicker = quote.series ? `${quote.series} · Quote of the day` : 'Quote of the day'

  return (
    <section className="quote-section" aria-label="Quote of the day">
      <div className="container">
        <div className={`quote-card${quote.media ? ' quote-card-with-media' : ''}`}>
          {quote.media && <QuoteMedia media={quote.media} />}

          <div className="quote-body">
            <span className="section-kicker quote-kicker">{kicker}</span>
            <QuoteFigure quote={quote} />

            {/* Links (also how search engines find the quote pages from the home page) */}
            <p className="quote-links">
              {quote.slug && <Link to={`/quotes/${quote.slug}`}>This quote's page</Link>}
              <Link to="/quotes">All quotes <span aria-hidden="true">→</span></Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

/** About: one quiet line. */
function QuoteLine({ quote }: { quote: QuoteOfTheDayDto }) {
  const lang = languageCode(quote.language)

  return (
    <figure className="about-quote">
      <span className="about-quote-label">Today's quote</span>
      <blockquote className="about-quote-text" lang={lang}>
        <p>{quote.text}</p>
      </blockquote>
      <figcaption className="about-quote-author">
        <span aria-hidden="true">— </span>
        {quote.author}
        {quote.translation && <span className="about-quote-translation"> ({quote.translation})</span>}
      </figcaption>
    </figure>
  )
}
