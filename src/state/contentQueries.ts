/**
 * The public site's data from the API, cached by React Query under ['content', …]. The admin area marks these out
 * of date after every change, so an edit shows on the public pages straight away in the same browser.
 * Visitors keep a page's data for 5 minutes before it's loaded again.
 */
import { useQuery } from '@tanstack/react-query'
import { unwrap } from '../api/apiError'
import {
  getArchivedQuote, getAwards, getExperience, getQuoteArchive, getProfiles, getPublicPersonalDetails, getQuoteOfTheDay, getSiteImages, getProjects, getPublications, getPresentations, getSkills,
} from '../api/services/contentService'

const FIVE_MINUTES = 5 * 60_000

export const useProjects = () => useQuery({
  queryKey: ['content', 'projects'],
  queryFn: async ({ signal }) => unwrap(await getProjects(undefined, signal)),
  staleTime: FIVE_MINUTES,
})

export const usePublications = () => useQuery({
  queryKey: ['content', 'publications'],
  queryFn: async ({ signal }) => unwrap(await getPublications(signal)),
  staleTime: FIVE_MINUTES,
})

export const usePresentations = () => useQuery({
  queryKey: ['content', 'presentations'],
  queryFn: async ({ signal }) => unwrap(await getPresentations(signal)),
  staleTime: FIVE_MINUTES,
})

export const useExperience = () => useQuery({
  queryKey: ['content', 'experience'],
  queryFn: async ({ signal }) => unwrap(await getExperience(signal)),
  staleTime: FIVE_MINUTES,
})

export const useSkills = () => useQuery({
  queryKey: ['content', 'skills'],
  queryFn: async ({ signal }) => unwrap(await getSkills(signal)),
  staleTime: FIVE_MINUTES,
})

export const useAwards = () => useQuery({
  queryKey: ['content', 'awards'],
  queryFn: async ({ signal }) => unwrap(await getAwards(signal)),
  staleTime: FIVE_MINUTES,
})

export const useProfiles = () => useQuery({
  queryKey: ['content', 'profiles'],
  queryFn: async ({ signal }) => unwrap(await getProfiles(signal)),
  staleTime: FIVE_MINUTES,
})

/** Named pictures (the owner's photo…). The admin Photo page uses the same data. */
export const useSiteImages = () => useQuery({
  queryKey: ['content', 'site-images'],
  queryFn: async ({ signal }) => unwrap(await getSiteImages(signal)),
  staleTime: FIVE_MINUTES,
})

/** Name, headline, public email and phone numbers for the website (only what's switched on in Admin → Account). */
export const usePersonalDetails = () => useQuery({
  queryKey: ['content', 'personal-details'],
  queryFn: async ({ signal }) => unwrap(await getPublicPersonalDetails(signal)),
  staleTime: FIVE_MINUTES,
})

/**
 * Today's quote for the Home and About pages. Loaded once and shared by both pages. When there's no quote (404) or the
 * API can't be reached, the pages simply leave the quote out.
 */
export const useQuoteOfTheDay = () => useQuery({
  queryKey: ['content', 'quote-of-the-day'],
  queryFn: async ({ signal }) => unwrap(await getQuoteOfTheDay(signal)),
  staleTime: FIVE_MINUTES,
})

/** The quote pages' list (/quotes). */
export const useQuoteArchive = () => useQuery({
  queryKey: ['content', 'quotes'],
  queryFn: async ({ signal }) => unwrap(await getQuoteArchive(signal)),
  staleTime: FIVE_MINUTES,
})

/** One quote's page (/quotes/{slug}). A 404 isn't tried again (see App.tsx). */
export const useArchivedQuote = (slug: string) => useQuery({
  queryKey: ['content', 'quotes', slug],
  queryFn: async ({ signal }) => unwrap(await getArchivedQuote(slug, signal)),
  staleTime: FIVE_MINUTES,
})
