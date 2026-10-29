/** Names people see for the API's values. Kept in one place so every page says the same. */
import type {
  ContactMessageStatus, ContactTopic, DocumentCategory, PresentationType, ProjectCategory, ProjectImageKind,
  PublicationType,
} from '../../api/contracts/enums'

type Option<T extends string> = { value: T; label: string }

export const projectCategories: Option<ProjectCategory>[] = [
  { value: 'Featured', label: 'Featured project' },
  { value: 'Engineering', label: 'Engineering project' },
]

export const projectImageKinds: Option<ProjectImageKind>[] = [
  { value: 'Primary', label: 'Main picture' },
  { value: 'Secondary', label: 'Second picture' },
  { value: 'Gallery', label: 'Gallery' },
]

export const publicationTypes: Option<PublicationType>[] = [
  { value: 'ConferencePaper', label: 'Conference paper' },
  { value: 'JournalArticle', label: 'Journal article' },
  { value: 'BookChapter', label: 'Book chapter' },
  { value: 'Preprint', label: 'Preprint' },
  { value: 'Thesis', label: 'Thesis' },
]

export const presentationTypes: Option<PresentationType>[] = [
  { value: 'Poster', label: 'Poster' },
  { value: 'Oral', label: 'Oral presentation' },
  { value: 'Conference', label: 'Conference' },
  { value: 'InvitedTalk', label: 'Invited talk' },
  { value: 'Workshop', label: 'Workshop' },
]

export const contactTopics: Option<ContactTopic>[] = [
  { value: 'Project', label: 'A project' },
  { value: 'Research', label: 'Research collaboration' },
  { value: 'Opportunity', label: 'Job or opportunity' },
  { value: 'Speaking', label: 'Speaking or event' },
  { value: 'Other', label: 'Something else' },
]

export const contactStatusText: Record<ContactMessageStatus, string> = {
  New: 'New',
  Replied: 'Replied',
  Closed: 'Closed',
}

export const documentCategories: Option<DocumentCategory>[] = [
  { value: 'Cv', label: 'CV' },
  { value: 'Certificate', label: 'Certificate' },
  { value: 'Transcript', label: 'Transcript' },
  { value: 'Paper', label: 'Paper' },
  { value: 'Identity', label: 'Identity' },
  { value: 'Contract', label: 'Contract' },
  { value: 'Other', label: 'Other' },
]

/** The label for a value from one of the lists above. */
export const labelOf = <T extends string>(options: Option<T>[], value: T) =>
  options.find((o) => o.value === value)?.label ?? value

/** "24 Oct 2026, 19:05" in the person's own time zone (the API sends UTC). */
export function dateTimeText(iso: string): string {
  return new Date(iso).toLocaleString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

/** "24 Oct 2026". */
export function dateText(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

/** "1.4 MB", "820 KB". */
export function fileSizeText(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}
