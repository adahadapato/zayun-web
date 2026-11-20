import { Link } from 'react-router';

import { ContentStatus } from '../../components/ui/ContentStatus';
import { ROLE_KINDS, roleDates } from '../../components/ui/careerDates';
import { useAwards, useCareerRoles, useEducation, useExperience } from '../../state/contentQueries';

function Experience() {
    const experience = useExperience();
    const roles = useCareerRoles();
    const education = useEducation();
    // Roles grouped by kind (Professional, Research, Teaching and mentoring, Other), each group in date order
    const roleGroups = ROLE_KINDS
        .map(kind => ({ ...kind, roles: (roles.data ?? []).filter(role => role.kind === kind.value) }))
        .filter(group => group.roles.length > 0);
    // Featured awards fill "Recognition & Innovation"; GuidelineIQ stays as the last card
    const awards = useAwards();
    const featuredAwards = (awards.data ?? []).filter(award => award.isFeatured);
    const experienceHighlights = (experience.data ?? []).map((area, i) => ({
        ...area,
        number: String(i + 1).padStart(2, '0'),
    }));

    return (
        <main className="experience-page">
            <section className="experience-hero">
                <div className="container">
                    <span className="section-kicker">
                        Experience
                    </span>

                    <h1>
                        Building systems.
                        <br />
                        Leading technology.
                        <br />
                        <span>Advancing AI.</span>
                    </h1>

                    <p className="experience-intro">
                        My professional journey brings together
                        software engineering, technical leadership
                        and Artificial Intelligence research, with
                        a consistent focus on using technology to
                        solve meaningful real-world problems.
                    </p>
                </div>
            </section>

            <section className="experience-content">
                <div className="container">
                    <div className="experience-heading">
                        <div>
                            <span className="section-kicker">
                                Areas of Expertise
                            </span>

                            <h2>
                                Experience built through
                                solving real problems.
                            </h2>
                        </div>

                        <p>
                            From enterprise software development
                            and digital transformation to
                            multimodal AI and clinical decision
                            support.
                        </p>
                    </div>

                    <ContentStatus
                        isLoading={experience.isLoading}
                        error={experience.error}
                        onRetry={() => experience.refetch()}
                        placeholders={3}
                        height={160}
                    />

                    <div className="experience-list">
                        {experienceHighlights.map(item => (
                            <article
                                key={item.id}
                                className="experience-item"
                            >
                                <div className="experience-number">
                                    {item.number}
                                </div>

                                <div className="experience-item-content">
                                    <h3>
                                        {item.title}
                                    </h3>

                                    <p>
                                        {item.description}
                                    </p>

                                    <div className="experience-skills">
                                        {item.skills.map(skill => (
                                            <span key={skill}>
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section className="experience-content experience-roles" aria-labelledby="roles-heading">
                <div className="container">
                    <div className="experience-heading">
                        <div>
                            <span className="section-kicker">
                                Roles
                            </span>

                            <h2 id="roles-heading">
                                Where I have built,
                                researched and taught.
                            </h2>
                        </div>

                        <p>
                            Current roles first, then the path
                            that led here.
                        </p>
                    </div>

                    <ContentStatus
                        isLoading={roles.isLoading}
                        error={roles.error}
                        onRetry={() => roles.refetch()}
                        placeholders={3}
                        height={140}
                    />

                    {roleGroups.map(group => (
                        <div key={group.value} className="roles-group">
                            <h3 className="roles-group-title">
                                {group.label}
                            </h3>

                            <ol className="roles-list">
                                {group.roles.map(role => (
                                    <li key={role.id} className="role-item">
                                        <p className="role-dates">
                                            {roleDates(role)}
                                        </p>

                                        <div className="role-body">
                                            <h4>
                                                {role.title}
                                            </h4>

                                            <p className="role-where">
                                                {role.organisation}
                                                {role.location && (
                                                    <span>
                                                        {role.location}
                                                    </span>
                                                )}
                                            </p>

                                            {role.summary && (
                                                <p className="role-summary">
                                                    {role.summary}
                                                </p>
                                            )}

                                            {role.highlights.length > 0 && (
                                                <ul className="role-highlights">
                                                    {role.highlights.map(highlight => (
                                                        <li key={highlight}>
                                                            {highlight}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    ))}
                </div>
            </section>

            <section className="experience-content experience-education" aria-labelledby="education-heading">
                <div className="container">
                    <div className="experience-heading">
                        <div>
                            <span className="section-kicker">
                                Education
                            </span>

                            <h2 id="education-heading">
                                The learning behind
                                the work.
                            </h2>
                        </div>
                    </div>

                    <ContentStatus
                        isLoading={education.isLoading}
                        error={education.error}
                        onRetry={() => education.refetch()}
                        placeholders={2}
                        height={110}
                    />

                    <ol className="roles-list education-list">
                        {(education.data ?? []).map(qualification => (
                            <li key={qualification.id} className="role-item">
                                <p className="role-dates">
                                    {qualification.year ?? 'In progress'}
                                </p>

                                <div className="role-body">
                                    <h3>
                                        {qualification.degree}, {qualification.subject}
                                    </h3>

                                    <p className="role-where">
                                        {qualification.institution}
                                        {qualification.location && (
                                            <span>
                                                {qualification.location}
                                            </span>
                                        )}
                                    </p>

                                    {qualification.note && (
                                        <p className="role-summary">
                                            {qualification.note}
                                        </p>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ol>
                </div>
            </section>

            <section className="experience-research">
                <div className="container experience-research-grid">
                    <div>
                        <span className="section-kicker">
                            Recognition & Innovation
                        </span>

                        <h2>
                            Recognition for
                            impact and innovation.
                        </h2>

                        <Link
                            to="/awards"
                            className="experience-awards-link"
                        >
                            See all awards ›
                        </Link>
                    </div>

                    <div className="experience-research-cards">
                        {featuredAwards.map(award => (
                            <article
                                key={award.id}
                                className="experience-feature-card"
                            >
                                <span>
                                    {award.year}
                                </span>

                                <h3>
                                    {award.title}
                                </h3>

                                <p>
                                    {award.description}
                                </p>
                            </article>
                        ))}

                        <article className="experience-feature-card">
                            <span>
                                2026
                            </span>

                            <h3>
                                GuidelineIQ
                            </h3>

                            <p>
                                AI clinical decision support
                                work exploring evidence-grounded
                                AI and semantic retrieval for
                                healthcare.
                            </p>
                        </article>
                    </div>
                </div>
            </section>

            <section className="experience-philosophy">
                <div className="container">
                    <span className="section-kicker">
                        The Thread
                    </span>

                    <h2>
                        Research. Engineering.
                        <br />
                        Real-world impact.
                    </h2>

                    <p>
                        Across each stage of my career, the
                        objective has remained consistent:
                        understand the problem, build the right
                        technology and create something that
                        delivers meaningful value.
                    </p>
                </div>
            </section>
        </main>
    );
}

export default Experience;