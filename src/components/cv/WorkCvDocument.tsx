import type { ReactNode } from 'react'
import type { CvPerson, CvRole, WorkCvData } from './cvTypes'

/**
 * The work CV as a printable A4 document: aimed at two pages, plain and readable by applicant tracking systems
 * (real text, simple headings, no columns for the body). Takes its data as input only, so the CV builder can reuse it.
 * Styles: src/styles/cv.css (screen: a white sheet; print: A4 pages).
 */
export function WorkCvDocument({ data }: { data: WorkCvData }) {
  return (
    <article className="cv-document" aria-label={`Work CV of ${data.person.name}`}>
      <CvHeader person={data.person} />

      {data.summary && (
        <CvSection title="Profile">
          <p className="cv-text">{data.summary}</p>
        </CvSection>
      )}

      {(data.keySkills.length > 0 || data.skillGroups.length > 0) && (
        <CvSection title="Key skills">
          {data.keySkills.length > 0 && <p className="cv-text cv-key-skills">{data.keySkills.join(' · ')}</p>}
          {data.skillGroups.length > 0 && (
            <dl className="cv-skill-groups">
              {data.skillGroups.map((group) => (
                <div key={group.title}>
                  <dt>{group.title}</dt>
                  <dd>{group.skills.join(', ')}</dd>
                </div>
              ))}
            </dl>
          )}
        </CvSection>
      )}

      {data.experience.length > 0 && (
        <CvSection title="Experience">
          {data.experience.map((role) => <CvRoleEntry key={`${role.title}-${role.dates}`} role={role} />)}
        </CvSection>
      )}

      {data.projects.length > 0 && (
        <CvSection title="Selected projects">
          <ul className="cv-lines">
            {data.projects.map((project) => (
              <li key={project.title}>
                <strong>{project.title}</strong>
                {project.subtitle && <>: {project.subtitle}</>}
                {project.tags.length > 0 && <span className="cv-muted"> ({project.tags.join(', ')})</span>}
              </li>
            ))}
          </ul>
        </CvSection>
      )}

      {data.education.length > 0 && (
        <CvSection title="Education">
          {data.education.map((q) => (
            <div key={q.title + q.year} className="cv-entry">
              <div className="cv-entry-head">
                <h3>{q.title}</h3>
                <span className="cv-dates">{q.year}</span>
              </div>
              <p className="cv-where">
                {q.institution}
                {q.location && <>, {q.location}</>}
                {q.note && <span className="cv-note"> · {q.note}</span>}
              </p>
            </div>
          ))}
        </CvSection>
      )}

      {data.teaching.length > 0 && (
        <CvSection title="Teaching and mentoring">
          {data.teaching.map((role) => <CvRoleEntry key={`${role.title}-${role.dates}`} role={role} />)}
        </CvSection>
      )}

      {data.awards.length > 0 && (
        <CvSection title="Awards">
          <ul className="cv-lines">
            {data.awards.map((award) => (
              <li key={award.title + award.year}>
                <strong>{award.title}</strong>, {award.by} <span className="cv-muted">({award.year})</span>
              </li>
            ))}
          </ul>
        </CvSection>
      )}

      {data.publications.length > 0 && (
        <CvSection title="Selected publications">
          <ul className="cv-lines">
            {data.publications.map((p) => (
              <li key={p.title}>
                {p.authors} ({p.year}). {p.title}. <em>{p.venue}</em>.
                {p.award && <strong> {p.award}.</strong>}
              </li>
            ))}
          </ul>
        </CvSection>
      )}

      {data.otherExperience.length > 0 && (
        <CvSection title="Other experience">
          <ul className="cv-lines">
            {data.otherExperience.map((role) => (
              <li key={role.title + role.dates}>
                <strong>{role.title}</strong>, {role.organisation}
                {role.location && <>, {role.location}</>} <span className="cv-muted">({role.dates})</span>
              </li>
            ))}
          </ul>
        </CvSection>
      )}
    </article>
  )
}

/** Name, headline and one line of contact details. */
export function CvHeader({ person }: { person: CvPerson }) {
  const contacts: ReactNode[] = [
    ...person.locations.map((l) => <span key={`l-${l}`}>{l}</span>),
    ...(person.email ? [<a key="email" href={`mailto:${person.email}`}>{person.email}</a>] : []),
    ...person.phones.map((p) => <a key={`p-${p.number}`} href={p.link}>{p.number}</a>),
    ...(person.website ? [<a key="web" href={person.website.url}>{person.website.label}</a>] : []),
    ...person.profiles.map((p) => (
      <a key={`pr-${p.url}`} href={p.url}>{p.name}{p.label ? `: ${p.label}` : ''}</a>
    )),
  ]

  return (
    <header className="cv-header">
      <h1>{person.name}</h1>
      {person.headline && <p className="cv-headline">{person.headline}</p>}
      {contacts.length > 0 && (
        <p className="cv-contacts">
          {contacts.map((c, i) => <span key={i} className="cv-contact">{c}</span>)}
        </p>
      )}
    </header>
  )
}

/** A titled section with a rule. */
export function CvSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="cv-section">
      <h2>{title}</h2>
      {children}
    </section>
  )
}

/** One role: title and dates on one line, organisation and place, summary, highlights. */
export function CvRoleEntry({ role }: { role: CvRole }) {
  return (
    <div className="cv-entry">
      <div className="cv-entry-head">
        <h3>{role.title}</h3>
        <span className="cv-dates">{role.dates}</span>
      </div>
      <p className="cv-where">
        {role.organisation}
        {role.location && <>, {role.location}</>}
      </p>
      {role.summary && <p className="cv-text cv-summary">{role.summary}</p>}
      {role.highlights.length > 0 && (
        <ul className="cv-bullets">
          {role.highlights.map((h) => <li key={h}>{h}</li>)}
        </ul>
      )}
    </div>
  )
}
