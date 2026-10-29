
import {
    FaExternalLinkAlt,
    FaGithub,
    FaLock,
} from 'react-icons/fa';

import type { ProjectDto } from '../../api/contracts/dtos';
import { fileUrl } from '../../api/config';
import { ContentStatus } from '../../components/ui/ContentStatus';
import { useProjects } from '../../state/contentQueries';

/** A project as the cards show it (made from the API's project). */
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

/**
 * The API's project → the card's shape. Pictures: "Gallery" pictures show as the phone gallery; otherwise the
 * "Primary" and "Secondary" pictures (or the first picture alone).
 * @param project The project from the API.
 * @param index   Its place on the page (numbers run on from Featured into Engineering).
 */
function toCard(project: ProjectDto, index: number): Project {
    const gallery = project.images.filter(i => i.kind === 'Gallery');
    const primary = project.images.find(i => i.kind === 'Primary') ?? (gallery.length ? undefined : project.images[0]);
    const secondary = project.images.find(i => i.kind === 'Secondary');

    return {
        number: String(index + 1).padStart(2, '0'),
        title: project.title,
        subtitle: project.subtitle,
        description: project.description,
        tags: project.tags,
        label: project.label,
        image: fileUrl(primary?.url),
        imageAlt: primary?.altText,
        imageLabel: primary?.label ?? undefined,
        secondaryImage: fileUrl(secondary?.url),
        secondaryImageAlt: secondary?.altText,
        secondaryImageLabel: secondary?.label ?? undefined,
        visualLabel: project.visualLabel ?? undefined,
        githubUrl: project.githubUrl ?? '',
        liveUrl: project.liveUrl ?? undefined,
        isPrivateRepo: project.isPrivateRepo,
        gallery: gallery.length
            ? gallery.map((g, i) => ({ image: fileUrl(g.url) ?? '', alt: g.altText, label: g.label ?? `Screen ${i + 1}` }))
            : undefined,
    };
}

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
                <span className="project-image-label">{project.visualLabel ?? 'Mobile application'}</span>
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
                    {project.visualLabel ?? 'Project interface'}
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
    const projects = useProjects();
    const all = projects.data ?? [];
    const featured = all.filter(p => p.category === 'Featured');
    const engineering = all.filter(p => p.category === 'Engineering');
    const featuredProjects = featured.map((p, i) => toCard(p, i));
    const engineeringProjects = engineering.map((p, i) => toCard(p, featured.length + i));

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

                    <ContentStatus
                        isLoading={projects.isLoading}
                        error={projects.error}
                        onRetry={() => projects.refetch()}
                        height={420}
                    />

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

                    <ContentStatus
                        isLoading={projects.isLoading}
                        error={null}
                        onRetry={() => projects.refetch()}
                        placeholders={1}
                        height={320}
                    />

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