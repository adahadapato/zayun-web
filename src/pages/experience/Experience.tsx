import { ContentStatus } from '../../components/ui/ContentStatus';
import { useExperience } from '../../state/contentQueries';

function Experience() {
    const experience = useExperience();
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
                                Professional Journey
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
                    </div>

                    <div className="experience-research-cards">
                        <article className="experience-feature-card">
                            <span>
                                2022
                            </span>

                            <h3>
                                NECO Staff Productivity Award
                            </h3>

                            <p>
                                Most Hardworking, Dedicated and
                                Committed Staff of the Year -
                                ICT Department, National
                                Examinations Council (NECO).
                            </p>
                        </article>

                        <article className="experience-feature-card">
                            <span>
                                2025
                            </span>

                            <h3>
                                Best Paper Award
                            </h3>

                            <p>
                                ICCVDM 2025 recognition for
                                research into transformer-based
                                multimodal AI for explainable
                                breast cancer image segmentation.
                            </p>
                        </article>

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