const skillGroups = [
    {
        number: '01',
        title: 'Software Engineering',
        description:
            'Designing and developing production software, APIs, full-stack platforms and cross-platform applications using modern engineering practices.',
        skills: [
            'C#',
            '.NET',
            'ASP.NET Core',
            'REST APIs',
            'React',
            'TypeScript',
            '.NET MAUI',
            'Python',
            'Django',
            'SQL Server',
            'Entity Framework Core',
            'CQRS',
            'MediatR',
            'Clean Architecture',
            'CI/CD',
        ],
    },
    {
        number: '02',
        title: 'Artificial Intelligence & Machine Learning',
        description:
            'Researching and developing intelligent systems with particular focus on multimodal learning, computer vision and trustworthy AI.',
        skills: [
            'Python',
            'PyTorch',
            'Machine Learning',
            'Deep Learning',
            'Transformers',
            'Vision Transformers',
            'Swin Transformer',
            'Computer Vision',
            'Medical Imaging',
            'Multimodal AI',
            'Explainable AI',
            'Uncertainty Quantification',
        ],
    },
    {
        number: '03',
        title: 'Data & Intelligent Systems',
        description:
            'Building systems that transform complex data into useful operational, analytical and decision-support capabilities.',
        skills: [
            'Semantic Retrieval',
            'Clinical Decision Support',
            'Data Processing',
            'OMR Processing',
            'Biometric Systems',
            'Identity Verification',
            'Real-Time Monitoring',
            'Process Automation',
            'Enterprise Systems',
            'Device Integration',
        ],
    },
    {
        number: '04',
        title: 'Research & Technical Practice',
        description:
            'Applying rigorous research and evaluation methods to the development and communication of scientific and intelligent systems.',
        skills: [
            'Experimental Design',
            'Model Evaluation',
            'Scientific Software',
            'Research Methodology',
            'Academic Writing',
            'Technical Communication',
            'Peer-Reviewed Research',
            'Research Presentation',
        ],
    },
    {
        number: '05',
        title: 'Architecture & Technical Leadership',
        description:
            'Translating organisational and technical requirements into maintainable systems while supporting modernisation and digital transformation.',
        skills: [
            'Software Architecture',
            'System Design',
            'API Architecture',
            'Requirements Analysis',
            'Legacy Modernisation',
            'Digital Transformation',
            'Technical Delivery',
            'System Integration',
        ],
    },
];

const coreExpertise = [
    'Software Engineering',
    'Full-Stack Development',
    'Artificial Intelligence',
    'Multimodal AI',
    'Explainable AI',
    'Computer Vision',
    'Intelligent Systems',
    'AI for Healthcare',
];

function Skills() {
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
                            <span key={skill}>
                                {skill}
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

                    <div className="skills-groups">
                        {skillGroups.map(group => (
                            <article
                                className="skill-group-card"
                                key={group.number}
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