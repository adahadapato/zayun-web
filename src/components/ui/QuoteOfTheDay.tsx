/**
 * Today's quote from the API (GET /api/quotes/today): the same quote for everyone all day, changing at UK midnight.
 *
 * Two looks:
 * - `card` (Home, below the hero): the quote, who said it, the source, a translation for proverbs, the one-line
 *   story for illustrated series like "Nature first", and the picture or animation when the quote has one
 *   (see QuoteMedia).
 * - `line` (About, under the intro): a quieter single line with the quote and who said it.
 *
 * Shows nothing while loading, when there's no quote (404) or when the API can't be reached: a missing quote should
 * never leave an empty box or an error on the page.
 *
 * Accessibility: real text (never part of a picture), `<figure>` + `<blockquote>` + `<figcaption>` so screen readers
 * announce it as a quote, and a `lang` on proverbs so they're read in the right language where the reader supports it.
 */
import type { QuoteOfTheDayDto } from '../../api/contracts/dtos'
import { useQuoteOfTheDay } from '../../state/contentQueries'
import { QuoteMedia } from './QuoteMedia'

/** Language names as typed in Admin → Quotes → their language codes (ISO 639), for the `lang` attribute. */
const LANGUAGE_CODES: Record<string, string> = {
  annang: 'anw',
  efik: 'efi',
  ibibio: 'ibb',
  igbo: 'ig',
  yoruba: 'yo',
  hausa: 'ha',
  'nigerian pidgin': 'pcm',
  pidgin: 'pcm',
  latin: 'la',
  french: 'fr',
}

/** The `lang` code for a language name, or undefined when it's English or not in the list. */
const languageCode = (language: string | null) =>
  language ? LANGUAGE_CODES[language.trim().toLowerCase()] : undefined

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
  const lang = languageCode(quote.language)
  const kicker = quote.series ? `${quote.series} · Quote of the day` : 'Quote of the day'

  return (
    <section className="quote-section" aria-label="Quote of the day">
      <div className="container">
        <div className={`quote-card${quote.media ? ' quote-card-with-media' : ''}`}>
          {quote.media && <QuoteMedia media={quote.media} />}

          <div className="quote-body">
            <span className="section-kicker quote-kicker">{kicker}</span>

            {/* The figure holds only the quote and its caption (a figcaption must be the figure's last child) */}
            <figure className="quote-figure">
              <blockquote className="quote-text" lang={lang}>
                <p>{quote.text}</p>
              </blockquote>

              {quote.translation && (
                <p className="quote-translation">
                  <span className="quote-language">In English:</span> {quote.translation}
                </p>
              )}

              <figcaption className="quote-author">
                <span className="quote-dash" aria-hidden="true">—</span>
                <span>{quote.author}</span>
                {quote.source && (
                  <>
                    <span className="quote-separator" aria-hidden="true">·</span>
                    <cite>{quote.source}</cite>
                  </>
                )}
              </figcaption>
            </figure>

            {quote.story && (
              <p className="quote-story">
                <span className="quote-story-label">The story</span>
                {quote.story}
              </p>
            )}
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
