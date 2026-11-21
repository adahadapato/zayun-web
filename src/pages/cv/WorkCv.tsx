import { Link } from 'react-router'
import type {
  AwardDto, CareerRoleDto, CoreExpertiseDto, ProfileDto, ProjectDto, PublicationDto, PublicPersonalDetailsDto,
  QualificationDto, SkillGroupDto,
} from '../../api/contracts/dtos'
import { WorkCvDocument } from '../../components/cv/WorkCvDocument'
import type { CvRole, WorkCvData } from '../../components/cv/cvTypes'
import { roleDates } from '../../components/ui/careerDates'
import { ContentStatus } from '../../components/ui/ContentStatus'
import { SITE_URL } from '../../seo/siteMeta'
import {
  useAwards, useCareerRoles, useEducation, usePersonalDetails, useProfiles, useProjects, usePublications, useSkills,
} from '../../state/contentQueries'

/** Profiles a work CV links to (the academic ones go on the academic CV). */
const WORK_PROFILES = new Set(['LinkedIn', 'GitHub'])

/** How many skills of each group, publications and project tags the work CV shows (to stay near two pages). */
const SKILLS_PER_GROUP = 7
const MAX_PUBLICATIONS = 3
const TAGS_PER_PROJECT = 4

/**
 * The work CV (/cv/work): built from the website's own data, so it's always up to date. "Save as PDF" opens the
 * browser's print window, where the page prints as clean A4 pages (src/styles/cv.css).
 */
export default function WorkCv() {
  const person = usePersonalDetails()
  const profiles = useProfiles()
  const roles = useCareerRoles()
  const education = useEducation()
  const projects = useProjects()
  const awards = useAwards()
  const publications = usePublications()
  const skills = useSkills()

  const all = [person, profiles, roles, education, projects, awards, publications, skills]
  const isLoading = all.some((q) => q.isLoading)
  const error = all.find((q) => q.error)?.error ?? null

  const data = person.data && !isLoading
    ? toWorkCv({
        person: person.data,
        profiles: profiles.data ?? [],
        roles: roles.data ?? [],
        education: education.data ?? [],
        projects: projects.data ?? [],
        awards: awards.data ?? [],
        publications: publications.data ?? [],
        coreExpertise: skills.data?.coreExpertise ?? [],
        skillGroups: skills.data?.groups ?? [],
      })
    : null

  return (
    <div className="cv-page">
      <div className="cv-toolbar container">
        <div>
          <span className="section-kicker">CV</span>
          <h1 className="cv-toolbar-title">Work CV</h1>
          <p className="cv-toolbar-hint">
            Always up to date: built from this website. To keep a copy, choose <strong>Save as PDF</strong>, then
            "Save as PDF" as the printer.
          </p>
        </div>
        <div className="cv-toolbar-actions">
          <button type="button" className="cv-button" onClick={() => window.print()} disabled={!data}>
            Save as PDF
          </button>
          <Link to="/experience" className="cv-link">Back to Experience</Link>
        </div>
      </div>

      <div className="container">
        <ContentStatus isLoading={isLoading} error={error} onRetry={() => all.forEach((q) => void q.refetch())}
                       placeholders={1} height={600} />
      </div>

      {data && (
        <div className="cv-sheet">
          <WorkCvDocument data={data} />
        </div>
      )}
    </div>
  )
}

/** The website's data → the work CV's shape. */
function toWorkCv(d: {
  person: PublicPersonalDetailsDto
  profiles: ProfileDto[]
  roles: CareerRoleDto[]
  education: QualificationDto[]
  projects: ProjectDto[]
  awards: AwardDto[]
  publications: PublicationDto[]
  coreExpertise: CoreExpertiseDto[]
  skillGroups: SkillGroupDto[]
}): WorkCvData {
  const role = (r: CareerRoleDto): CvRole => ({
    title: r.title,
    organisation: r.organisation,
    location: r.location,
    dates: roleDates(r),
    summary: r.summary,
    highlights: r.highlights,
  })
  const ofKind = (...kinds: CareerRoleDto['kind'][]) => d.roles.filter((r) => kinds.includes(r.kind)).map(role)

  return {
    person: {
      name: d.person.fullName,
      headline: d.person.headline,
      email: d.person.email,
      phones: d.person.phones,
      locations: d.person.locations,
      website: { label: SITE_URL.replace(/^https?:\/\//, ''), url: SITE_URL },
      profiles: d.profiles.filter((p) => WORK_PROFILES.has(p.platform)).map((p) => ({ name: p.name, url: p.url })),
    },
    summary: null, // CV3 adds an editable summary per CV
    keySkills: d.coreExpertise.map((c) => c.name),
    skillGroups: d.skillGroups.map((g) => ({ title: g.title, skills: g.skills.slice(0, SKILLS_PER_GROUP) })),
    // Jobs and research posts, in date order (the API sends roles current first, then newest)
    experience: ofKind('Professional', 'Research'),
    projects: d.projects
      .filter((p) => p.category === 'Featured')
      .map((p) => ({ title: p.title, subtitle: p.subtitle, tags: p.tags.slice(0, TAGS_PER_PROJECT) })),
    education: d.education.map((q) => ({
      title: `${q.degree}, ${q.subject}`,
      institution: q.institution,
      location: withoutRepeats(q.location, q.institution),
      year: q.year ? String(q.year) : 'In progress',
      note: q.note,
    })),
    teaching: ofKind('Teaching'),
    awards: d.awards.filter((a) => a.isFeatured).map((a) => ({ title: a.title, by: a.awardedBy, year: a.year })),
    publications: [...d.publications]
      .sort((a, b) => b.year - a.year)
      .slice(0, MAX_PUBLICATIONS)
      .map((p) => ({ authors: p.authors, title: p.title, venue: p.venue, year: p.year, award: p.award })),
    otherExperience: ofKind('Other'),
  }
}

/**
 * The place without the parts the name already says: "Federal University of Technology, Minna" + "Minna, Nigeria"
 * → "Nigeria", so the CV doesn't read "Minna, Minna, Nigeria".
 */
function withoutRepeats(location: string | null, name: string): string | null {
  if (!location) return null
  const said = name.toLowerCase()
  const rest = location.split(',').map((part) => part.trim()).filter((part) => part && !said.includes(part.toLowerCase()))
  return rest.length > 0 ? rest.join(', ') : null
}
