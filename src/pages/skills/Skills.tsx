import { ContentStatus } from '../../components/ui/ContentStatus';
import { useSkills } from '../../state/contentQueries';

function Skills() {
    const skills = useSkills();
    const coreExpertise = skills.data?.coreExpertise ?? [];
    const skillGroups = (skills.data?.groups ?? []).map((group, i) => ({
        ...group,
        number: String(i + 1).padStart(2, '0'),
    }));

    return (
        <main className="skills-page">
            <section className="skills-hero">
                <div className="container">
                    <span className="section-kicker">
                        Skills & Expertise
                    </span>

                    <h1>
                        Engineering software.
                        <br />
                        Researching intelligence.
                        <br />
                        <span>
                            Building systems that work.
                        </span>
                    </h1>

                    <p className="skills-intro">
                        My technical experience spans software
                        engineering, artificial intelligence,
                        scientific research and enterprise
                        systems, bringing together engineering
                        practice and intelligent technologies
                        to solve real-world problems.
                    </p>
                </div>
            </section>

            <section className="skills-core">
                <div className="container skills-core-grid">
                    <div>
                        <span className="section-kicker">
                            Core Expertise
                        </span>

                        <h2>
                            Where engineering meets
                            intelligence.
                        </h2>

                        <p>
                            My work combines software
                            engineering with applied artificial
                            intelligence, from production
                            full-stack platforms and mobile
                            applications to multimodal medical
                            AI and explainable clinical
                            decision-support research.
                        </p>
                    </div>

                    <div className="skills-core-list">
                        {coreExpertise.map(skill => (
                            <span key={skill.id}>
                                {skill.name}
                            </span>
                        ))}
                    </div>
                </div>
            </section>

            <section className="skills-capabilities">
                <div className="container">
                    <div className="skills-section-heading">
                        <div>
                            <span className="section-kicker">
                                Capabilities
                            </span>

                            <h2>
                                Technologies, methods
                                and engineering practice.
                            </h2>
                        </div>

                        <p>
                            Technical capabilities developed
                            through research, software
                            engineering and the delivery of
                            operational systems.
                        </p>
                    </div>

                    <ContentStatus
                        isLoading={skills.isLoading}
                        error={skills.error}
                        onRetry={() => skills.refetch()}
                        placeholders={2}
                        height={240}
                    />

                    <div className="skills-groups">
                        {skillGroups.map(group => (
                            <article
                                className="skill-group-card"
                                key={group.id}
                            >
                                <div className="skill-group-top">
                                    <span className="skill-group-number">
                                        {group.number}
                                    </span>

                                    <span className="skill-group-line" />
                                </div>

                                <h3>
                                    {group.title}
                                </h3>

                                <p>
                                    {group.description}
                                </p>

                                <div className="skill-group-tags">
                                    {group.skills.map(skill => (
                                        <span key={skill}>
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section className="skills-application">
                <div className="container skills-application-grid">
                    <div>
                        <span className="section-kicker">
                            Applied Expertise
                        </span>

                        <h2>
                            Skills demonstrated
                            through real work.
                        </h2>
                    </div>

                    <div className="skills-application-content">
                        <div className="skills-application-item">
                            <span>01</span>

                            <div>
                                <strong>
                                    Med-CTX
                                </strong>

                                <p>
                                    Multimodal transformers,
                                    computer vision, medical
                                    imaging, explainable AI and
                                    uncertainty-aware clinical
                                    intelligence.
                                </p>
                            </div>
                        </div>

                        <div className="skills-application-item">
                            <span>02</span>

                            <div>
                                <strong>
                                    Phloem
                                </strong>

                                <p>
                                    Full-stack cross-platform
                                    mobile engineering using
                                    .NET MAUI, C# and an
                                    ASP.NET Core REST API.
                                </p>
                            </div>
                        </div>

                        <div className="skills-application-item">
                            <span>03</span>

                            <div>
                                <strong>
                                    RCCG Hope House
                                </strong>

                                <p>
                                    Production React and
                                    TypeScript frontend,
                                    administrative platform,
                                    ASP.NET Core API, CQRS,
                                    MediatR, EF Core and CI/CD.
                                </p>
                            </div>
                        </div>

                        <div className="skills-application-item">
                            <span>04</span>

                            <div>
                                <strong>
                                    Enterprise Systems
                                </strong>

                                <p>
                                    Examination processing,
                                    biometrics, surveillance,
                                    access control, digital
                                    archiving and operational
                                    automation.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="skills-closing">
                <div className="container">
                    <span className="section-kicker">
                        Zayun
                    </span>

                    <h2>
                        Research. Engineering.
                        Intelligence. Impact.
                    </h2>

                    <p>
                        Technology is most valuable when
                        technical capability is connected
                        to a meaningful problem.
                    </p>
                </div>
            </section>
        </main>
    );
}

export default Skills;