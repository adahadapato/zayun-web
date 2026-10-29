import type { ProjectDto } from '../../../api/contracts/dtos'

/** The cached list of projects (one project: [...projectsKey, id]). */
export const projectsKey = ['admin', 'projects'] as const

/** The main picture of a project, for its row (the first "Primary", else the first picture). */
export const coverOf = (project: ProjectDto) =>
  project.images.find((i) => i.kind === 'Primary') ?? project.images[0]
