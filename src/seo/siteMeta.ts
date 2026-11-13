/**
 * What search engines and link previews (Google, LinkedIn, WhatsApp, X…) show for each public page:
 * the title in the browser tab and in Google, the short description under it, and the picture on a shared link.
 * One place to edit the words. Keep titles under about 60 characters and descriptions under about 155.
 *
 * public/sitemap.xml lists the same addresses: add a page here → add it there too.
 */

/** The live address of the website (no slash at the end). */
export const SITE_URL = 'https://zayun.net'

export const SITE_NAME = 'Zayun'

/** The picture shown when a page is shared (1200 × 630, in /public). */
export const DEFAULT_SHARE_IMAGE = `${SITE_URL}/og-image.png`

export interface PageMeta {
  title: string
  description: string
  /** true: ask search engines not to list this page (e.g. "page not found"). */
  noIndex?: boolean
  /** The picture for link previews (full address); the Zayun share picture when left out. */
  image?: string
  /** What the picture shows, for screen readers in link previews. */
  imageAlt?: string
}

/** Every public page, by its address. */
export const PAGE_META: Record<string, PageMeta> = {
  '/': {
    title: 'Enobong Adahada · Software Engineer & AI Researcher | Zayun',
    description:
      'Zayun is the home of Enobong Adahada: software engineering, AI research, explainable and multimodal AI, and education.',
  },
  '/about': {
    title: 'About Enobong Adahada | Zayun',
    description:
      'About Enobong Adahada: building intelligent systems with real-world purpose, from software engineering to AI research and teaching.',
  },
  '/experience': {
    title: 'Experience · Building Systems, Leading Technology | Zayun',
    description:
      "Enobong Adahada's professional journey: the roles, teams and systems behind a career in software engineering and technology leadership.",
  },
  '/projects': {
    title: 'Projects · Research and Engineering | Zayun',
    description:
      'Projects by Enobong Adahada: software and AI work from research prototypes to production systems.',
  },
  '/research': {
    title: 'Research · Multimodal and Explainable AI | Zayun',
    description:
      'Research on multimodal, explainable and uncertainty-aware AI, with a focus on medical imaging and clinically grounded decision support.',
  },
  '/skills': {
    title: 'Skills & Expertise | Zayun',
    description:
      "Enobong Adahada's skills and expertise across software engineering, artificial intelligence and research.",
  },
  '/awards': {
    title: 'Awards · Recognition for Impact and Innovation | Zayun',
    description: 'Awards and recognition received by Enobong Adahada for impact and innovation in technology and research.',
  },
  '/quotes': {
    title: 'Quotes on Nature, Science and AI | Zayun',
    description:
      'Quotes, proverbs and sayings on nature, science, technology and AI: every quote of the day from zayun.net, with sources.',
  },
  '/contact': {
    title: 'Contact Enobong Adahada | Zayun',
    description: 'Get in touch with Enobong Adahada about software engineering, AI research, speaking or collaboration.',
  },
}

/**
 * Addresses whose page sets its own words (e.g. one quote's page, /quotes/{slug}): the layout leaves their tags to
 * the page (see usePageMeta).
 */
export const PAGES_WITH_OWN_META = ['/quotes/']

/** True when the page at this (normalised) address sets its own words. */
export const hasOwnMeta = (path: string) => PAGES_WITH_OWN_META.some((prefix) => path.startsWith(prefix))

/** Shown for any address that isn't a page. Not listed by search engines. */
export const NOT_FOUND_META: PageMeta = {
  title: 'Page not found | Zayun',
  description: "This page doesn't exist on zayun.net.",
  noIndex: true,
}

/** "/about/" and "/about" are the same page. */
export function normalisePath(pathname: string): string {
  const trimmed = pathname.replace(/\/+$/, '')
  return trimmed === '' ? '/' : trimmed.toLowerCase()
}

/** Cuts text to a length at a word, adding "…", for titles and descriptions. */
export function shorten(text: string, maxLength: number): string {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (clean.length <= maxLength) return clean
  const cut = clean.slice(0, maxLength - 1)
  const lastSpace = cut.lastIndexOf(' ')
  return `${(lastSpace > maxLength / 2 ? cut.slice(0, lastSpace) : cut).replace(/[\s,;:.\u2013\u2014-]+$/, '')}…`
}
