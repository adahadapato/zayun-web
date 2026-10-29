/**
 * Every admin call (/api/admin/*), in one file like the Phloem website. All need the Admin role; the client adds the
 * token. Calls that change content return the saved item, so pages can show it without loading again.
 */
import { withQuery } from '../apiQuery'
import { del, get, post, put, upload } from '../client'
import type {
  ContactStatusCommand, CreateAwardCommand, CreateProjectCommand, CreatePresentationCommand, CreatePublicationCommand,
  CreateTextGroupCommand, DocumentFields, ProjectFields, ProjectImageFields, PublicationFields, TextGroupFields,
  UpdateAwardCommand, UpdatePresentationCommand,
} from '../contracts/commands'
import type {
  AdminOverviewDto, AwardDto, ContactInboxDto, ContactMessageDto, CoreExpertiseDto, DocumentDto, DocumentLinkDto,
  ExperienceAreaDto, PresentationDto, ProjectDto, ProjectImageDto, PublicationDto, SkillGroupDto, SkillsPageDto,
} from '../contracts/dtos'
import type { ContactMessageStatus, DocumentCategory } from '../contracts/enums'

// ───────────────────────────── Shared actions ─────────────────────────────

/** Show (true) or hide (false) an item on the website. `area` is the route, e.g. "projects", "skills/groups". */
export const setPublished = (area: string, id: string, isPublished: boolean) =>
  put<void>(`api/admin/${area}/${id}/published`, { isPublished })

/** Drag-to-reorder: every item's Id (drafts included) in the new order. */
export const reorder = (area: string, ids: string[]) => put<void>(`api/admin/${area}/order`, { ids })

/** Deletes an item. */
export const remove = (area: string, id: string) => del(`api/admin/${area}/${id}`)

// ───────────────────────────── Dashboard ─────────────────────────────

export const getOverview = (signal?: AbortSignal) => get<AdminOverviewDto>('api/admin/overview', signal)

// ───────────────────────────── Projects ─────────────────────────────

export const getAdminProjects = (signal?: AbortSignal) => get<ProjectDto[]>('api/admin/projects', signal)
export const getAdminProject = (id: string, signal?: AbortSignal) => get<ProjectDto>(`api/admin/projects/${id}`, signal)
export const createProject = (command: CreateProjectCommand) => post<ProjectDto>('api/admin/projects', command)
export const updateProject = (id: string, fields: ProjectFields) => put<ProjectDto>(`api/admin/projects/${id}`, fields)

/** Uploads a picture (resized to WebP by the API). */
export const addProjectImage = (projectId: string, file: File, fields: ProjectImageFields) =>
  upload<ProjectImageDto>('POST', `api/admin/projects/${projectId}/images`, 'file', file, {
    altText: fields.altText, label: fields.label ?? '', kind: fields.kind,
  })

export const updateProjectImage = (projectId: string, imageId: string, fields: ProjectImageFields) =>
  put<void>(`api/admin/projects/${projectId}/images/${imageId}`, fields)

export const deleteProjectImage = (projectId: string, imageId: string) =>
  del(`api/admin/projects/${projectId}/images/${imageId}`)

export const reorderProjectImages = (projectId: string, ids: string[]) =>
  put<void>(`api/admin/projects/${projectId}/images/order`, { ids })

// ───────────────────────────── Publications ─────────────────────────────

export const getAdminPublications = (signal?: AbortSignal) => get<PublicationDto[]>('api/admin/publications', signal)
export const createPublication = (command: CreatePublicationCommand) =>
  post<PublicationDto>('api/admin/publications', command)
export const updatePublication = (id: string, fields: PublicationFields) =>
  put<PublicationDto>(`api/admin/publications/${id}`, fields)

// ───────────────────────────── Presentations ─────────────────────────────

export const getAdminPresentations = (signal?: AbortSignal) =>
  get<PresentationDto[]>('api/admin/presentations', signal)
export const createPresentation = (command: CreatePresentationCommand) =>
  post<PresentationDto>('api/admin/presentations', command)
export const updatePresentation = (id: string, command: UpdatePresentationCommand) =>
  put<PresentationDto>(`api/admin/presentations/${id}`, command)
export const setPresentationImage = (id: string, file: File, altText: string) =>
  upload<PresentationDto>('PUT', `api/admin/presentations/${id}/image`, 'file', file, { altText })
export const removePresentationImage = (id: string) => del(`api/admin/presentations/${id}/image`)

// ───────────────────────────── Experience ─────────────────────────────

export const getAdminExperience = (signal?: AbortSignal) => get<ExperienceAreaDto[]>('api/admin/experience', signal)
export const createExperienceArea = (command: CreateTextGroupCommand) =>
  post<ExperienceAreaDto>('api/admin/experience', command)
export const updateExperienceArea = (id: string, fields: TextGroupFields) =>
  put<ExperienceAreaDto>(`api/admin/experience/${id}`, fields)

// ───────────────────────────── Skills ─────────────────────────────

export const getAdminSkills = (signal?: AbortSignal) => get<SkillsPageDto>('api/admin/skills', signal)
export const createSkillGroup = (command: CreateTextGroupCommand) =>
  post<SkillGroupDto>('api/admin/skills/groups', command)
export const updateSkillGroup = (id: string, fields: TextGroupFields) =>
  put<SkillGroupDto>(`api/admin/skills/groups/${id}`, fields)
export const createCoreExpertise = (name: string, isPublished: boolean) =>
  post<CoreExpertiseDto>('api/admin/skills/expertise', { name, isPublished })
export const renameCoreExpertise = (id: string, name: string) =>
  put<CoreExpertiseDto>(`api/admin/skills/expertise/${id}`, { name })

// ───────────────────────────── Awards ─────────────────────────────

export const getAdminAwards = (signal?: AbortSignal) => get<AwardDto[]>('api/admin/awards', signal)
export const createAward = (command: CreateAwardCommand) => post<AwardDto>('api/admin/awards', command)
export const updateAward = (id: string, command: UpdateAwardCommand) =>
  put<AwardDto>(`api/admin/awards/${id}`, command)
export const setAwardImage = (id: string, file: File, altText: string) =>
  upload<AwardDto>('PUT', `api/admin/awards/${id}/image`, 'file', file, { altText })
export const removeAwardImage = (id: string) => del(`api/admin/awards/${id}/image`)

// ───────────────────────────── Inbox ─────────────────────────────

export const getContactMessages = (query: { status?: ContactMessageStatus; page?: number; pageSize?: number },
                                   signal?: AbortSignal) =>
  get<ContactInboxDto>(withQuery('api/admin/contact-messages', query), signal)
export const getContactMessage = (id: string, signal?: AbortSignal) =>
  get<ContactMessageDto>(`api/admin/contact-messages/${id}`, signal)
export const setContactMessageStatus = (id: string, command: ContactStatusCommand) =>
  put<void>(`api/admin/contact-messages/${id}/status`, command)

// ───────────────────────────── Documents ─────────────────────────────

export const getDocuments = (category?: DocumentCategory, signal?: AbortSignal) =>
  get<DocumentDto[]>(withQuery('api/admin/documents', { category }), signal)
export const uploadDocument = (file: File, fields: DocumentFields) =>
  upload<DocumentDto>('POST', 'api/admin/documents', 'file', file, {
    title: fields.title, category: fields.category, notes: fields.notes ?? '',
  })
export const updateDocument = (id: string, fields: DocumentFields) =>
  put<DocumentDto>(`api/admin/documents/${id}`, fields)
export const replaceDocumentFile = (id: string, file: File) =>
  upload<DocumentDto>('PUT', `api/admin/documents/${id}/file`, 'file', file)
export const getDocumentLink = (id: string) => get<DocumentLinkDto>(`api/admin/documents/${id}/link`)
