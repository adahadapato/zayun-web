import { ArrowUpRight, Award as AwardIcon } from 'lucide-react';

import { ApiImage } from '../../components/ui/ApiImage';
import { ContentStatus } from '../../components/ui/ContentStatus';
import { useAwards } from '../../state/contentQueries';

/** Awards and recognition, newest first in the admin's order, each with an optional certificate or photo. */
function Awards() {
    const awards = useAwards();
    const items = awards.data ?? [];

    return (
        <main className="awards-page">
            <section className="awards-hero">
                <div className="container">
                    <span className="section-kicker">
                        Awards
                    </span>

                    <h1>
                        Recognition for
                        <br />
                        <span>impact and innovation.</span>
                    </h1>

                    <p className="awards-intro">
                        Awards and recognition received across
                        research, software engineering and public
                        service technology.
                    </p>
                </div>
            </section>

            <section className="awards-content">
                <div className="container">
                    <ContentStatus
                        isLoading={awards.isLoading}
                        error={awards.error}
                        isEmpty={items.length === 0}
                        emptyText="Awards will appear here soon."
                        onRetry={() => awards.refetch()}
                        height={240}
                    />

                    <div className="awards-list">
                        {items.map(award => (
                            <article
                                key={award.id}
                                className={`award-card${award.image ? ' award-card-with-image' : ''}`}
                            >
                                <div className="award-card-content">
                                    <div className="award-card-top">
                                        <span className="award-icon">
                                            <AwardIcon size={22} aria-hidden="true" />
                                        </span>

                                        <span className="award-year">
                                            {award.year}
                                        </span>
                                    </div>

                                    <span className="award-by">
                                        {award.awardedBy}
                                    </span>

                                    <h2>
                                        {award.title}
                                    </h2>

                                    <p>
                                        {award.description}
                                    </p>

                                    {award.url && (
                                        <a
                                            href={award.url}
                                            className="award-link"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            Read more
                                            <ArrowUpRight size={16} aria-hidden="true" />
                                        </a>
                                    )}
                                </div>

                                {award.image && (
                                    <a
                                        href={award.image.url}
                                        className="award-image"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={`Open the picture: ${award.image.altText}`}
                                    >
                                        <ApiImage
                                            src={award.image.thumbnailUrl ?? award.image.url}
                                            alt={award.image.altText}
                                            width={award.image.width}
                                            height={award.image.height}
                                        />
                                    </a>
                                )}
                            </article>
                        ))}
                    </div>
                </div>
            </section>
        </main>
    );
}

export default Awards;
