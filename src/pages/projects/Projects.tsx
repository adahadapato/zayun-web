
import {
    FaExternalLinkAlt,
    FaGithub,
    FaLock,
} from 'react-icons/fa';

import biometricSystemImage from '../../assets/projects/biometric-system.png';
import cdxDevelopmentToolImage from '../../assets/projects/cdx-development-tool.png';
import medCtxInputImage from '../../assets/research/med-ctx-input.png';
import medCtxOutputImage from '../../assets/research/med-ctx-output.png';
import necoOmrSystemImage from '../../assets/projects/neco-omr-system.png';
import nvrSystemImage from '../../assets/projects/nvr-system.png';
import rccgHopeHouseImage from '../../assets/projects/rccg-hope-house.png';
import rccgHopeHouseAdminImage from '../../assets/projects/rccg-hope-house-admin.png';
import timeAttendanceSystemImage from '../../assets/projects/time-attendance-system.png';
import phloemMarketplaceImage from '../../assets/projects/phloem-marketplace.png';
import phloemPlatformOverviewImage from '../../assets/projects/phloem-platform-overview.png';
import phloemCrossBorderDeliveryImage from '../../assets/projects/phloem-cross-border-delivery.png';
import phloemSellerDashboardImage from '../../assets/projects/phloem-seller-dashboard.png';
import phloemAdminDashboardImage from '../../assets/projects/phloem-admin-dashboard.png';

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
    imageLabel?: string;
    secondaryImageLabel?: string;
    visualLabel?: string;
    githubUrl: string;
    liveUrl?: string;
    isPrivateRepo: boolean;
    gallery?: {
        image: string;
        alt: string;
        label: string;
    }[];
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
        githubUrl: '',
        isPrivateRepo: true,
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
        githubUrl: '',
        isPrivateRepo: true,
        label: 'Brunel University London',
    },
    {
        number: '03',
        title: 'RCCG Hope House',
        subtitle: 'Full-Stack Digital Platform',
        description:
            'A production full-stack digital platform comprising a public-facing React website, a dedicated administrative application and an ASP.NET Core REST API backend. The platform supports ministries, events, devotionals, sermons, galleries, annual content, prayer and contact workflows, with CQRS/MediatR architecture, EF Core persistence and automated CI/CD deployment.',
        tags: [
            'React',
            'TypeScript',
            'ASP.NET Core',
            'C#',
            'REST API',
            'CQRS',
            'MediatR',
            'EF Core',
            'Admin Portal',
            'CI/CD',
        ],
        image: rccgHopeHouseImage,
        imageAlt:
            'RCCG Hope House public-facing website',
        secondaryImage: rccgHopeHouseAdminImage,
        secondaryImageAlt:
            'RCCG Hope House administration dashboard for managing website content and services',
        imageLabel: 'Public Website',
        secondaryImageLabel: 'Admin Platform',
        visualLabel: 'Full-Stack Platform',
        githubUrl: 'https://github.com/adahadapato/rccg-hope-house-web-api/',
        liveUrl: 'https://rccghopehouse.org.uk/',
        isPrivateRepo: false,
        label: 'Full-Stack Engineering',
    },
    {
        number: '04',
        title: 'Phloem',
        subtitle: 'Full-Stack Cross-Platform Mobile Platform',
        description:
            'A full-stack cross-platform marketplace developed for a client, connecting African food sellers with local and diaspora customers. Built with .NET MAUI and C#, with an ASP.NET Core REST API powering the backend, the platform integrates food discovery, seller onboarding and commerce, cross-border delivery, order management and administrative operations within a unified system.',
        tags: [
            '.NET MAUI',
            'C#',
            'ASP.NET Core',
            'REST API',
            'Full-Stack Development',
            'Marketplace',
            'Seller Management',
            'Logistics',
        ],
        image: phloemMarketplaceImage,
        imageAlt:
            'Phloem mobile marketplace home screen showing food discovery and popular dishes',
        gallery: [
            { image: phloemMarketplaceImage, alt: 'Phloem mobile marketplace home screen showing food discovery and popular dishes', label: 'Marketplace' },
            { image: phloemPlatformOverviewImage, alt: 'Phloem platform overview describing its African food marketplace and diaspora delivery mission', label: 'Platform' },
            { image: phloemCrossBorderDeliveryImage, alt: 'Phloem cross-border delivery workflow for sending African food to the United Kingdom', label: 'Delivery' },
            { image: phloemSellerDashboardImage, alt: 'Phloem seller dashboard showing orders, balance and product sales management', label: 'Seller' },
            { image: phloemAdminDashboardImage, alt: 'Phloem admin dashboard showing seller approval and management controls', label: 'Admin' },
        ],
        githubUrl: '',
        isPrivateRepo: true,
        label: 'Client Mobile Application',
    },
    {
        number: '05',
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
        visualLabel: 'Research Output',
        githubUrl: 'https://github.com/adahadapato/med-ctx',
        isPrivateRepo: false,
        label: 'AI Research',
    },
];

const engineeringProjects: Project[] = [
    {
        number: '06',
        title: 'NECO Examination Data Processing',
        subtitle: 'OMR Scanning & Monitoring',
        description:
            'A real-time examination data capture and monitoring solution supporting OMR data capture workflows, operator access, examination filtering, ' +
            'progress monitoring and identification of missing records.',
        tags: [
            'C#',
            '.NET',
            'OMR',
            'Data Processing',
            'Real-Time Monitoring',
            'Examination Management Systems',
        ],
        image: necoOmrSystemImage,
        imageAlt:
            'Examination OMR data capture and monitoring application',
        githubUrl: '',
        isPrivateRepo: true,
        label: 'Enterprise Systems',
    },
    {
        number: '07',
        title: 'Multimodal Biometric Identity System',
        subtitle: 'Fingerprint & Facial Identity Verification',
        description:
            'A multimodal biometric data capture and identity-management system combining fingerprint and facial features for identity verification. ' +
            'The application supports data enrolment, biometric capture, verification, operator administration and integration with biometric capture devices.',
        tags: [
            'C#',
            'Windows Forms',
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
        githubUrl: '',
        isPrivateRepo: true,
        label: 'Identity Technology',
    },
    {
        number: '08',
        title: 'Network Video Surveillance',
        subtitle: 'Multi-Camera Monitoring System',
        description:
            'A network video surveillance solution supporting multiple camera sources and configurable monitoring views within a central desktop environment.',
        tags: [
            'C#',
            '.NET',
            'NVR',
            'Network Cameras',
            'Video Monitoring',
            'Desktop Software',
            'Security Systems',
        ],
        image: nvrSystemImage,
        imageAlt:
            'Network video surveillance application with multi-camera monitoring grid',
        githubUrl: '',
        isPrivateRepo: true,
        label: 'Security Technology',
    },
    {
        number: '09',
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
            'MS SQL',
        ],
        githubUrl: '',
        isPrivateRepo: true,
        label: 'Enterprise Software',
    },
    {
        number: '10',
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
        githubUrl: '',
        isPrivateRepo: true,
        label: 'Enterprise Software',
    },
    {
        number: '11',
        title: 'Biometric Time, Attendance & Access Control',
        subtitle: 'Real-Time Workforce & Security Management',
        description:
            'An integrated biometric time, attendance and access-control system using iClock 700, with real-time remote device monitoring and communication through HTTP sockets. The system supports personnel enrolment, attendance management, access control, device-status monitoring and remote operational oversight.',
        tags: [
            'C#',
            'WPF',
            'iClock 700',
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
        githubUrl: '',
        isPrivateRepo: true,
        label: 'Biometric Systems',
    },
];

function ProjectVisual({
    project,
}: {
    project: Project;
}) {
    if (project.gallery?.length) {
        return (
            <div className="project-image project-mobile-gallery">
                <div className="project-mobile-gallery-track">
                    {project.gallery.map(item => (
                        <figure className="project-mobile-shot" key={item.label}>
                            <div className="project-mobile-shot-frame">
                                <img src={item.image} alt={item.alt} loading="lazy" />
                            </div>
                            <figcaption>{item.label}</figcaption>
                        </figure>
                    ))}
                </div>
                <div className="project-image-overlay" aria-hidden="true" />
                <span className="project-image-label">Mobile application</span>
            </div>
        );
    }

    if (
        project.image &&
        project.secondaryImage
    ) {
        return (
            <div className="project-image project-image-pair">
                <div className="project-pair-item">
                    <span className="project-pair-label">
                        {project.imageLabel ?? 'Clinical Context'}
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
                        {project.secondaryImageLabel ?? 'AI Explanation'}
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
                    {project.visualLabel ?? 'Project Interface'}
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

function ProjectActions({
    project,
}: {
    project: Project;
}) {
    return (
        <div className="project-actions">
            <span
                className={`project-repository-status ${project.isPrivateRepo
                        ? 'project-repository-status-private'
                        : 'project-repository-status-public'
                    }`}
            >
                {project.isPrivateRepo && (
                    <FaLock
                        size={11}
                        aria-hidden="true"
                    />
                )}

                {project.isPrivateRepo
                    ? 'Private Repository'
                    : 'Public Repository'}
            </span>

            <div className="project-action-links">
                {project.liveUrl && (
                    <a
                        href={project.liveUrl}
                        className="project-action-link project-action-link-live"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`View ${project.title} live`}
                    >
                        <FaExternalLinkAlt
                            size={13}
                            aria-hidden="true"
                        />

                        <span>
                            View Live
                        </span>
                    </a>
                )}

                {!project.isPrivateRepo &&
                    project.githubUrl && (
                        <a
                            href={project.githubUrl}
                            className="project-action-link"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`View ${project.title} source code on GitHub`}
                        >
                            <FaGithub
                                size={16}
                                aria-hidden="true"
                            />

                            <span>
                                View Code
                            </span>
                        </a>
                    )}
            </div>
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

                <ProjectActions
                    project={project}
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

                <ProjectActions
                    project={project}
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
                        scientific software, cross-platform
                        mobile applications, full-stack
                        platforms and enterprise systems
                        developed across healthcare,
                        commerce, research, identity,
                        security and organisational technology.
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
                            cross-platform mobile development,
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