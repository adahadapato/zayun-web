/**
 * What the website sends, exactly as the Zayun API's commands and request bodies (camelCase JSON, enums as names).
 * Keep in step with Zayun.Application/Features/<Area>/Commands and Zayun.Presentation/Endpoints.
 */
import type {
  ContactMessageStatus, ContactTopic, DocumentCategory, PresentationType, ProfilePlatform, ProjectCategory,
  ProjectImageKind, PublicationType,
} from './enums'
import type { PublicationLinkDto } from './dtos'

// ───────────────────────────── Sign-in ─────────────────────────────

export interface LoginCommand {
  email: string
  password: string
}

export interface ChangePasswordCommand {
  currentPassword: string
  newPassword: string
}

// ───────────────────────────── Projects ─────────────────────────────

/** A project's editable fields (PUT /api/admin/projects/{id}). */
export interface ProjectFields {
  title: string
  /** Empty = made from the title. */
  slug: string | null
  subtitle: string
  description: string
  category: ProjectCategory
  label: string
  visualLabel: string | null
  githubUrl: string | null
  liveUrl: string | null
  isPrivateRepo: boolean
  tags: string[]
}

/** POST /api/admin/projects. */
export interface CreateProjectCommand extends ProjectFields {
  isPublished: boolean
}

/** A picture's editable fields. */
export interface ProjectImageFields {
  altText: string
  label: string | null
  kind: ProjectImageKind
}

// ───────────────────────────── Research ─────────────────────────────

/** A publication's editable fields. */
export interface PublicationFields {
  title: string
  authors: string
  venue: string
  year: number
  type: PublicationType
  award: string | null
  links: PublicationLinkDto[]
}

export interface CreatePublicationCommand extends PublicationFields {
  isPublished: boolean
}

/** A presentation's editable fields. */
export interface PresentationFields {
  title: string
  eventName: string
  year: number
  type: PresentationType
}

export interface CreatePresentationCommand extends PresentationFields {
  isPublished: boolean
}

export interface UpdatePresentationCommand extends PresentationFields {
  /** New alt text for the picture; null leaves it as it is. */
  imageAlt: string | null
}

// ───────────────────────────── Experience and skills ─────────────────────────────

/** An experience area's or a skill group's editable fields. */
export interface TextGroupFields {
  title: string
  description: string
  skills: string[]
}

export interface CreateTextGroupCommand extends TextGroupFields {
  isPublished: boolean
}

// ───────────────────────────── Awards ─────────────────────────────

/** An award's editable fields. */
export interface AwardFields {
  title: string
  awardedBy: string
  year: number
  description: string
  url: string | null
  isFeatured: boolean
}

export interface CreateAwardCommand extends AwardFields {
  isPublished: boolean
}

export interface UpdateAwardCommand extends AwardFields {
  /** New alt text for the picture; null leaves it as it is. */
  imageAlt: string | null
}

// ───────────────────────────── Profiles ─────────────────────────────

/** An online profile's editable fields. */
export interface ProfileFields {
  platform: ProfilePlatform
  name: string
  url: string
  label: string | null
  showInFooter: boolean
  showOnContact: boolean
  showOnResearch: boolean
}

export interface CreateProfileCommand extends ProfileFields {
  isPublished: boolean
}

// ───────────────────────────── Contact ─────────────────────────────

/** POST /api/contact/messages. */
export interface SendContactMessageCommand {
  name: string
  email: string
  organisation: string | null
  topic: ContactTopic
  message: string
  /** Hidden from people: only robots fill it in. */
  website?: string
}

export interface ContactStatusCommand {
  status: ContactMessageStatus
  note: string | null
}

// ───────────────────────────── Documents ─────────────────────────────

export interface DocumentFields {
  title: string
  category: DocumentCategory
  notes: string | null
}
