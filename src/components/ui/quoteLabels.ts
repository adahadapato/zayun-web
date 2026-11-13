/**
 * Words and codes shared by everything that shows a quote: the Home card (QuoteOfTheDay), QuoteFigure, and the quote
 * pages (/quotes and /quotes/{slug}).
 */
import type { ArchivedQuoteDto } from '../../api/contracts/dtos'
import type { QuoteKind } from '../../api/contracts/enums'

/** What's needed to show a quote: today's quote and the quote pages both have these fields. */
export type QuoteContent = Pick<ArchivedQuoteDto,
  'kind' | 'text' | 'author' | 'source' | 'language' | 'translation' | 'series' | 'story' | 'media'>

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
export const languageCode = (language: string | null) =>
  language ? LANGUAGE_CODES[language.trim().toLowerCase()] : undefined

/** What each kind is called on the quote pages. */
export const QUOTE_KIND_LABELS: Record<QuoteKind, string> = {
  Quote: 'Quote',
  Proverb: 'Proverb',
  OwnSaying: 'My saying',
}
