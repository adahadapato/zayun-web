/**
 * What a CV is made of, independent of where the data comes from. The CV layouts only take these shapes, so the same
 * layouts serve the owner's CVs (data from the API), the free CV builder (data typed by a visitor) and, later, the
 * Job finder's tailored CVs.
 */

/** The person at the top of the CV. */
export interface CvPerson {
  name: string
  /** One line under the name, e.g. "Software Engineer and AI Researcher". */
  headline?: string | null
  email?: string | null
  phones: { label: string; number: string; link: string }[]
  /** "London, United Kingdom" etc. */
  locations: string[]
  /** e.g. "zayun.net" */
  website?: { label: string; url: string } | null
  /** e.g. LinkedIn, GitHub, ORCID. */
  profiles: { name: string; url: string; label?: string | null }[]
}

/** A role (job, research, teaching, other). */
export interface CvRole {
  title: string
  organisation: string
  location?: string | null
  /** Ready to show, e.g. "2006 – 2024" or "2025 – Present". */
  dates: string
  summary?: string | null
  highlights: string[]
}

/** A qualification. */
export interface CvQualification {
  /** e.g. "M.Tech, Computer Science" */
  title: string
  institution: string
  location?: string | null
  /** e.g. "2023" or "In progress" */
  year: string
  note?: string | null
}

/** A project, one line. */
export interface CvProject {
  title: string
  subtitle?: string | null
  tags: string[]
}

/** An award, one line. */
export interface CvAward {
  title: string
  by: string
  year: number
}

/** A publication, in a short citation style. */
export interface CvPublication {
  authors: string
  title: string
  venue: string
  year: number
  /** e.g. "Best Paper Award" */
  award?: string | null
}

/** A group of skills, e.g. "Software Engineering: C#, .NET, …". */
export interface CvSkillGroup {
  title: string
  skills: string[]
}

/** Everything the work CV shows, in its order. Empty lists leave their section out. */
export interface WorkCvData {
  person: CvPerson
  /** A short professional summary (optional; editable in the admin area from CV3). */
  summary?: string | null
  keySkills: string[]
  skillGroups: CvSkillGroup[]
  experience: CvRole[]
  projects: CvProject[]
  education: CvQualification[]
  teaching: CvRole[]
  awards: CvAward[]
  publications: CvPublication[]
  /** Shown one line each, without highlights. */
  otherExperience: CvRole[]
}
