/**
 * What the public website shows: projects, research, experience, skills and awards. No sign-in; the API caches these, and
 * only returns published items.
 */
import { withQuery } from '../apiQuery'
import { get } from '../client'
import type {
  AwardDto, ExperienceAreaDto, PresentationDto, ProjectDto, PublicationDto, SkillsPageDto,
} from '../contracts/dtos'
import type { ProjectCategory } from '../contracts/enums'

/** Published projects in order (optionally one category), with their pictures. */
export const getProjects = (category?: ProjectCategory, signal?: AbortSignal) =>
  get<ProjectDto[]>(withQuery('api/projects', { category }), signal)

/** One published project by its web address. */
export const getProject = (slug: string, signal?: AbortSignal) =>
  get<ProjectDto>(`api/projects/${encodeURIComponent(slug)}`, signal)

/** Published publications in order. */
export const getPublications = (signal?: AbortSignal) => get<PublicationDto[]>('api/publications', signal)

/** Published presentations in order. */
export const getPresentations = (signal?: AbortSignal) => get<PresentationDto[]>('api/presentations', signal)

/** Published experience areas in order. */
export const getExperience = (signal?: AbortSignal) => get<ExperienceAreaDto[]>('api/experience', signal)

/** Published skill groups and core expertise. */
export const getSkills = (signal?: AbortSignal) => get<SkillsPageDto>('api/skills', signal)

/** Published awards in order (the featured ones are also shown on About and Experience). */
export const getAwards = (signal?: AbortSignal) => get<AwardDto[]>('api/awards', signal)
