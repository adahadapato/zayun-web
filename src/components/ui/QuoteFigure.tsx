/**
 * The words of a quote, laid out the same everywhere: the Home card (QuoteOfTheDay) and a quote's own page
 * (/quotes/{slug}). The quote, an English translation for proverbs, who said it with the source, and the one-line
 * story for illustrated series like "Nature first".
 *
 * Accessibility: real text (never part of a picture), `<figure>` + `<blockquote>` + `<figcaption>` so screen readers
 * announce it as a quote, and a `lang` on proverbs so they're read in the right language where the reader supports it.
 */
import { languageCode, type QuoteContent } from './quoteLabels'

/** The quote, translation, who said it and the story (the picture is shown separately, by QuoteMedia). */
export function QuoteFigure({ quote }: { quote: QuoteContent }) {
  const lang = languageCode(quote.language)

  return (
    <>
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
    </>
  )
}
