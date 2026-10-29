/**
 * The public site's data from the API, cached by React Query under ['content', …]. The admin area marks these out
 * of date after every change, so an edit shows on the public pages straight away in the same browser.
 * Visitors keep a page's data for 5 minutes before it's loaded again.
 */
import { useQuery } from '@tanstack/react-query'
import { unwrap } from '../api/apiError'
import {
  getExperience, getProjects, getPublications, getPresentations, getSkills,
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
