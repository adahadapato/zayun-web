/**
 * What the API sends back, exactly as the Zayun API's DTOs (camelCase JSON, enums as names, dates as ISO strings).
 * Keep in step with Zayun.Application/Features/<Area>/Dtos.
 */
import type {
  ContactMessageStatus, ContactTopic, DocumentCategory, PresentationType, ProjectCategory, ProjectImageKind,
  ProfilePlatform, PublicationType, TagCheckStatus,
} from './enums'

// ───────────────────────────── Shared ─────────────────────────────

/** One page of a list. */
export interface PagedResult<T> {
  items: T[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
  hasPrevious: boolean
  hasNext: boolean
}

// ───────────────────────────── Sign-in ─────────────────────────────

/** The signed-in admin. */
export interface AdminAccountDto {
  userId: string
  email: string
  firstName: string
  lastName: string
  roles: string[]
}

/** A signed-in session. */
export interface AuthTokensDto {
  accessToken: string
  accessTokenExpiresAt: string
  refreshToken: string
  refreshTokenExpiresAt: string
  account: AdminAccountDto
}

// ───────────────────────────── Projects ─────────────────────────────

/** One project picture (links are absolute). */
export interface ProjectImageDto {
  id: string
  url: string
  thumbnailUrl: string | null
  width: number
  height: number
  altText: string
  label: string | null
  kind: ProjectImageKind
  displayOrder: number
}

/** A project. */
export interface ProjectDto {
  id: string
  slug: string
  title: string
  subtitle: string
  description: string
  category: ProjectCategory
  label: string
  visualLabel: string | null
  githubUrl: string | null
  liveUrl: string | null
  isPrivateRepo: boolean
  tags: string[]
  images: ProjectImageDto[]
  displayOrder: number
  isPublished: boolean
  updatedAt: string
}

// ───────────────────────────── Research ─────────────────────────────

/** One "read it here" link. */
export interface PublicationLinkDto {
  label: string
  url: string
  isPrimary: boolean
}

/** A publication. */
export interface PublicationDto {
  id: string
  title: string
  authors: string
  venue: string
  year: number
  type: PublicationType
  award: string | null
  links: PublicationLinkDto[]
  displayOrder: number
  isPublished: boolean
}

/** A presentation's picture. */
export interface PresentationImageDto {
  url: string
  thumbnailUrl: string | null
  width: number
  height: number
  altText: string
}

/** A presentation. */
export interface PresentationDto {
  id: string
  title: string
  eventName: string
  year: number
  type: PresentationType
  image: PresentationImageDto | null
  displayOrder: number
  isPublished: boolean
}

// ───────────────────────────── Experience and skills ─────────────────────────────

/** An experience area. */
export interface ExperienceAreaDto {
  id: string
  title: string
  description: string
  skills: string[]
  displayOrder: number
  isPublished: boolean
}

/** A skill group (same shape as an experience area). */
export type SkillGroupDto = ExperienceAreaDto

/** One core expertise item. */
export interface CoreExpertiseDto {
  id: string
  name: string
  displayOrder: number
  isPublished: boolean
}

/** Everything the Skills page shows. */
export interface SkillsPageDto {
  groups: SkillGroupDto[]
  coreExpertise: CoreExpertiseDto[]
}

// ───────────────────────────── Awards ─────────────────────────────

/** An award's certificate or photo. */
export interface AwardImageDto {
  url: string
  thumbnailUrl: string | null
  width: number
  height: number
  altText: string
}

/** An award. `isFeatured` ones are also shown on About and Experience. */
export interface AwardDto {
  id: string
  title: string
  awardedBy: string
  year: number
  description: string
  url: string | null
  isFeatured: boolean
  image: AwardImageDto | null
  displayOrder: number
  isPublished: boolean
}

// ───────────────────────────── Profiles ─────────────────────────────

/** An online profile (ORCID, ResearchGate, LinkedIn…) and where it's shown. */
export interface ProfileDto {
  id: string
  platform: ProfilePlatform
  name: string
  url: string
  /** A short line, e.g. the ORCID iD. */
  label: string | null
  showInFooter: boolean
  showOnContact: boolean
  showOnResearch: boolean
  displayOrder: number
  isPublished: boolean
}

// ───────────────────────────── Tags ─────────────────────────────

/** A tag in the shared list (project tags, experience and skill-group skills), with where it's used. */
export interface TagDto {
  id: string
  name: string
  /** The UPPERCASE key used to spot duplicates. */
  normalizedName: string
  /** Other keys that mean this tag (old names). */
  aliases: string[]
  projects: number
  experienceAreas: number
  skillGroups: number
  usedBy: number
}

/** One page of tags, plus the totals for the filter tabs. */
export interface TagListDto {
  tags: PagedResult<TagDto>
  total: number
  used: number
  unused: number
}

/** The tag check while typing. */
export interface TagCheckDto {
  status: TagCheckStatus
  /** The name to use: the existing tag's, or the usual spelling of a new one. */
  name: string
  tagId: string | null
  /** A short line for the admin, e.g. "Same as \"REST API\"." */
  message: string
  checkedByAi: boolean
}

// ───────────────────────────── Inbox ─────────────────────────────

/** A Contact message. */
export interface ContactMessageDto {
  id: string
  name: string
  email: string
  organisation: string | null
  topic: ContactTopic
  message: string
  status: ContactMessageStatus
  staffNote: string | null
  sentAt: string
  handledAt: string | null
}

/** One page of the inbox plus the counts for its tabs. */
export interface ContactInboxDto {
  messages: PagedResult<ContactMessageDto>
  newCount: number
  repliedCount: number
  closedCount: number
}

// ───────────────────────────── Documents ─────────────────────────────

/** A private document (no link: ask for one). */
export interface DocumentDto {
  id: string
  title: string
  category: DocumentCategory
  notes: string | null
  fileName: string
  contentType: string
  fileSizeBytes: number
  uploadedAt: string
  updatedAt: string | null
}

/** A short-lived download link. */
export interface DocumentLinkDto {
  url: string
  expiresAt: string
}

// ───────────────────────────── Dashboard ─────────────────────────────

/** How many items, and how many the website shows. */
export interface ContentCountDto {
  total: number
  published: number
}

/** The admin dashboard's numbers. */
export interface AdminOverviewDto {
  projects: ContentCountDto
  publications: ContentCountDto
  presentations: ContentCountDto
  experienceAreas: ContentCountDto
  skillGroups: ContentCountDto
  coreExpertise: ContentCountDto
  awards: ContentCountDto
  newMessages: number
  documents: number
}
