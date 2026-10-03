import biometricSystemImage from '../../assets/projects/biometric-system.png';
import cdxDevelopmentToolImage from '../../assets/projects/cdx-development-tool.png';
import medCtxInputImage from '../../assets/research/med-ctx-input.png';
import medCtxOutputImage from '../../assets/research/med-ctx-output.png';
import necoOmrSystemImage from '../../assets/projects/neco-omr-system.png';
import nvrSystemImage from '../../assets/projects/nvr-system.png';
import rccgHopeHouseImage from '../../assets/projects/rccg-hope-house.png';
import timeAttendanceSystemImage from '../../assets/projects/time-attendance-system.png';

type Project = {
    number: string;
    title: string;
    subtitle: string;
    description: string;
    tags: string[];
    label: string;
    image?: string;
    imageAlt?: string;
    secondaryImage?: string;
    secondaryImageAlt?: string;
};

const featuredProjects: Project[] = [
    {
        number: '01',
        title: 'GuidelineIQ™',
        subtitle: 'AI Clinical Decision Support',
        description:
            'An AI-driven clinical decision support project exploring evidence-grounded intelligence and semantic retrieval for healthcare decision-making.',
        tags: [
            'Artificial Intelligence',
            'Semantic Retrieval',
            'Healthcare AI',
            'Clinical Decision Support',
        ],
        label: 'AI Innovation',
    },
    {
        number: '02',
        title: 'CDx Development Tool',
        subtitle: 'Scientific Software Modernisation',
        description:
            'Modernisation of a legacy MATLAB-based scientific application into Python, including conversion of computational logic and visualisations and development of a Django-based API to support distributed access.',
        tags: [
            'Python',
            'Django',
            'PyCharm',
            'API Development',
            'Data Visualisation',
            'MATLAB Migration',
        ],
        image: cdxDevelopmentToolImage,
        imageAlt:
            'CDx Development Tool showing scientific modelling and data visualisations',
        label: 'Brunel University London',
    },
    {
        number: '03',
        title: 'RCCG Hope House',
        subtitle: 'Full-Stack Digital Platform',
        description:
            'A production digital platform combining a public-facing website with administrative content management, service administration, live-service access, contact and prayer workflows, and automated deployment.',
        tags: [
            'React',
            'TypeScript',
            'ASP.NET Core',
            'C#',
            'CQRS',
            'MediatR',
            'EF Core',
            'CI/CD',
        ],
        image: rccgHopeHouseImage,
        imageAlt:
            'RCCG Hope House production digital platform homepage',
        label: 'Full-Stack Engineering',
    },
    {
        number: '04',
        title: 'Med-CTX',
        subtitle: 'Explainable Multimodal Medical AI',
        description:
            'A transformer-based multimodal AI framework combining breast ultrasound imaging with radiology reports for explainable breast cancer image segmentation and clinically interpretable model outputs.',
        tags: [
            'Multimodal AI',
            'Transformers',
            'Computer Vision',
            'Medical Imaging',
            'Explainable AI',
        ],
        image: medCtxInputImage,
        imageAlt:
            'Med-CTX clinical context input containing imaging and pathology information',
        secondaryImage: medCtxOutputImage,
        secondaryImageAlt:
            'Med-CTX AI-generated clinical explanation showing assessment confidence and decision guidance',
        label: 'AI Research',
    },
];

const engineeringProjects: Project[] = [
    {
        number: '05',
        title: 'NECO Examination Data Processing',
        subtitle: 'OMR Scanning & Monitoring',
        description:
            'A real-time examination data capture and monitoring solution supporting OMR scanning workflows, operator access, examination filtering, progress monitoring and identification of missing records.',
        tags: [
            'C#',
            '.NET',
            'OMR',
            'Data Processing',
            'Real-Time Monitoring',
            'Examination Systems',
        ],
        image: necoOmrSystemImage,
        imageAlt:
            'Examination OMR scanning and monitoring application',
        label: 'Enterprise Systems',
    },
    {
        number: '06',
        title: 'Multimodal Biometric Identity System',
        subtitle: 'Fingerprint & Facial Identity Verification',
        description:
            'A multimodal biometric data capture and identity-management system combining fingerprint and facial features for identity verification. The application supports candidate enrolment, biometric capture, verification, operator administration and integration with biometric capture devices.',
        tags: [
            'Multimodal Biometrics',
            'Fingerprint Recognition',
            'Facial Recognition',
            'Identity Verification',
            'Biometric Enrolment',
            'Device Integration',
        ],
        image: biometricSystemImage,
        imageAlt:
            'Multimodal biometric identity capture and verification application',
        label: 'Identity Technology',
    },
    {
        number: '07',
        title: 'Network Video Surveillance',
        subtitle: 'Multi-Camera Monitoring System',
        description:
            'A network video surveillance solution supporting multiple camera sources and configurable monitoring views within a central desktop environment.',
        tags: [
            'NVR',
            'Network Cameras',
            'Video Monitoring',
            'Desktop Software',
            'Security Systems',
        ],
        image: nvrSystemImage,
        imageAlt:
            'Network video surveillance application with multi-camera monitoring grid',
        label: 'Security Technology',
    },
    {
        number: '08',
        title: 'Automated Operations System',
        subtitle: 'Enterprise API & Process Automation',
        description:
            'An enterprise operations API developed to improve the provision and exchange of organisational data across departments while supporting more efficient digital workflows.',
        tags: [
            'C#',
            'ASP.NET Core',
            'REST API',
            'Enterprise Systems',
            'Process Automation',
        ],
        label: 'Enterprise Software',
    },
    {
        number: '09',
        title: 'Digital Archiving System',
        subtitle: 'Document & Script Tracking',
        description:
            'A digital archiving and tracking solution designed to improve document traceability and support faster investigation and resolution of operational enquiries.',
        tags: [
            'C#',
            '.NET',
            'ASP.NET Core',
            'Document Management',
            'Digital Transformation',
        ],
        label: 'Enterprise Software',
    },
    {
        number: '10',
        title: 'Biometric Time, Attendance & Access Control',
        subtitle: 'Real-Time Workforce & Security Management',
        description:
            'An integrated biometric time, attendance and access-control system using iClock 7, with real-time remote device monitoring and communication through HTTP sockets. The system supports personnel enrolment, attendance management, access control, device-status monitoring and remote operational oversight.',
        tags: [
            'iClock 7',
            'Biometrics',
            'Time & Attendance',
            'Access Control',
            'HTTP Sockets',
            'Real-Time Monitoring',
            'Device Integration',
        ],
        image: timeAttendanceSystemImage,
        imageAlt:
            'Biometric time attendance and access control management dashboard',
        label: 'Biometric Systems',
    },
];

function ProjectVisual({
    project,
}: {
    project: Project;
}) {
    if (
        project.image &&
        project.secondaryImage
    ) {
        return (
            <div className="project-image project-image-pair">
                <div className="project-pair-item">
                    <span className="project-pair-label">
                        Clinical Context
                    </span>

                    <img
                        src={project.image}
                        alt={
                            project.imageAlt ??
                            project.title
                        }
                        loading="lazy"
                    />
                </div>

                <div className="project-pair-flow">
                    <span aria-hidden="true">
                        ↓
                    </span>
                </div>

                <div className="project-pair-item">
                    <span className="project-pair-label">
                        AI Explanation
                    </span>

                    <img
                        src={project.secondaryImage}
                        alt={
                            project.secondaryImageAlt ??
                            project.title
                        }
                        loading="lazy"
                    />
                </div>

                <div
                    className="project-image-overlay"
                    aria-hidden="true"
                />

                <span className="project-image-label">
                    Research output
                </span>
            </div>
        );
    }

    if (project.image) {
        return (
            <div className="project-image">
                <img
                    src={project.image}
                    alt={
                        project.imageAlt ??
                        project.title
                    }
                    loading="lazy"
                />

                <div
                    className="project-image-overlay"
                    aria-hidden="true"
                />

                <span className="project-image-label">
                    Project interface
                </span>
            </div>
        );
    }

    return (
        <div className="project-placeholder-visual">
            <div
                className="project-visual-grid"
                aria-hidden="true"
            />

            <div
                className="project-visual-orbit"
                aria-hidden="true"
            />

            <div className="project-visual-content">
                <span>
                    {project.number}
                </span>

                <strong>
                    {project.title}
                </strong>

                <small>
                    {project.subtitle}
                </small>
            </div>
        </div>
    );
}

function ProjectTags({
    tags,
}: {
    tags: string[];
}) {
    return (
        <div className="project-tags">
            {tags.map(tag => (
                <span key={tag}>
                    {tag}
                </span>
            ))}
        </div>
    );
}

function FeaturedProjectCard({
    project,
}: {
    project: Project;
}) {
    return (
        <article className="featured-project-card">
            <ProjectVisual
                project={project}
            />

            <div className="featured-project-content">
                <div className="project-card-top">
                    <span className="project-number">
                        {project.number}
                    </span>

                    <span className="project-label">
                        {project.label}
                    </span>
                </div>

                <div className="project-main-content">
                    <span className="project-subtitle">
                        {project.subtitle}
                    </span>

                    <h3>
                        {project.title}
                    </h3>

                    <p>
                        {project.description}
                    </p>
                </div>

                <ProjectTags
                    tags={project.tags}
                />
            </div>
        </article>
    );
}

function EngineeringProjectCard({
    project,
}: {
    project: Project;
}) {
    return (
        <article className="engineering-project-card">
            <ProjectVisual
                project={project}
            />

            <div className="engineering-project-content">
                <div className="project-card-top">
                    <span className="project-number">
                        {project.number}
                    </span>

                    <span className="project-label">
                        {project.label}
                    </span>
                </div>

                <span className="project-subtitle">
                    {project.subtitle}
                </span>

                <h3>
                    {project.title}
                </h3>

                <p>
                    {project.description}
                </p>

                <ProjectTags
                    tags={project.tags}
                />
            </div>
        </article>
    );
}

function Projects() {
    return (
        <main className="projects-page">
            <section className="projects-hero">
                <div className="container">
                    <span className="section-kicker">
                        Projects
                    </span>

                    <h1>
                        Researching.
                        <br />
                        Engineering.
                        <br />
                        <span>
                            Building.
                        </span>
                    </h1>

                    <p className="projects-intro">
                        A selection of AI research,
                        scientific software, full-stack
                        platforms and enterprise systems
                        developed across healthcare,
                        research, identity, security and
                        organisational technology.
                    </p>
                </div>
            </section>

            <section className="featured-projects">
                <div className="container">
                    <div className="projects-section-heading">
                        <div>
                            <span className="section-kicker">
                                Featured Work
                            </span>

                            <h2>
                                Technology built around
                                real problems.
                            </h2>
                        </div>

                        <p>
                            Selected work spanning clinical
                            AI, multimodal research,
                            scientific software modernisation
                            and production full-stack
                            engineering.
                        </p>
                    </div>

                    <div className="featured-project-list">
                        {featuredProjects.map(
                            project => (
                                <FeaturedProjectCard
                                    key={project.number}
                                    project={project}
                                />
                            )
                        )}
                    </div>
                </div>
            </section>

            <section className="engineering-projects">
                <div className="container">
                    <div className="engineering-heading">
                        <div>
                            <span className="section-kicker">
                                Enterprise & Engineering
                            </span>

                            <h2>
                                Systems developed
                                across the years.
                            </h2>
                        </div>

                        <p>
                            Engineering work spanning
                            examination processing,
                            multimodal biometrics,
                            surveillance, automation,
                            access control and enterprise
                            information management.
                        </p>
                    </div>

                    <div className="engineering-project-grid">
                        {engineeringProjects.map(
                            project => (
                                <EngineeringProjectCard
                                    key={project.number}
                                    project={project}
                                />
                            )
                        )}
                    </div>
                </div>
            </section>

            <section className="projects-journey">
                <div className="container projects-journey-grid">
                    <div>
                        <span className="section-kicker">
                            The Journey
                        </span>

                        <h2>
                            From enterprise software
                            to intelligent systems.
                        </h2>
                    </div>

                    <div className="projects-journey-content">
                        <p>
                            My work has evolved from
                            building operational and
                            enterprise systems to
                            researching and developing
                            intelligent technologies that
                            bring together software
                            engineering, artificial
                            intelligence and real-world
                            domain knowledge.
                        </p>

                        <p>
                            The technologies have changed,
                            but the objective remains
                            consistent: understand the
                            problem, engineer the right
                            solution and build technology
                            that delivers meaningful value.
                        </p>
                    </div>
                </div>
            </section>
        </main>
    );
}

export default Projects;