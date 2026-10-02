import {
    ArrowRight,
    GraduationCap,
} from 'lucide-react';

import { Link } from 'react-router-dom';

function SoftwareEngineeringIcon() {
    return (
        <svg
            viewBox="0 0 64 64"
            className="expertise-custom-icon software-icon"
            aria-hidden="true"
        >
            <rect
                x="5"
                y="8"
                width="54"
                height="48"
                rx="8"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
            />

            <path
                d="M25 22L15 32L25 42"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            <path
                d="M39 22L49 32L39 42"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            <path
                d="M36 17L28 47"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
            />
        </svg>
    );
}

function AiResearchIcon() {
    return (
        <svg
            viewBox="0 0 64 64"
            className="expertise-custom-icon ai-icon"
            aria-hidden="true"
        >
            <path
                d="
                    M31 10
                    C26 5 18 8 18 15
                    C12 15 9 20 11 26
                    C5 30 7 39 14 41
                    C12 48 18 54 25 51
                    C27 55 31 54 32 50
                    V14
                    C32 12 32 11 31 10
                    Z
                "
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            <path
                d="
                    M33 10
                    C38 5 46 8 46 15
                    C52 15 55 20 53 26
                    C59 30 57 39 50 41
                    C52 48 46 54 39 51
                    C37 55 33 54 32 50
                    V14
                    C32 12 32 11 33 10
                    Z
                "
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            <path
                d="M18 18C24 18 26 22 26 26"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
            />

            <path
                d="M14 32C20 29 25 32 26 37"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
            />

            <path
                d="M19 44C24 46 27 43 27 40"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
            />

            <path
                d="M46 18C40 18 38 22 38 26"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
            />

            <path
                d="M50 32C44 29 39 32 38 37"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
            />

            <path
                d="M45 44C40 46 37 43 37 40"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
            />
        </svg>
    );
}

const expertise = [
    {
        icon: SoftwareEngineeringIcon,
        title: 'Software Engineering',
        type: 'software',
    },
    {
        icon: AiResearchIcon,
        title: 'AI & Research',
        type: 'ai',
    },
    {
        icon: GraduationCap,
        title: 'Education & Mentoring',
        type: 'education',
    },
];

function Home() {
    return (
        <>
            <section className="hero">
                <div className="hero-image" />

                <div className="hero-overlay" />

                <div className="container hero-content">
                    <div className="hero-copy">
                        <div className="hero-eyebrow">
                            <span>Software</span>

                            <span className="hero-dot">
                                •
                            </span>

                            <span>AI Research</span>

                            <span className="hero-dot">
                                •
                            </span>

                            <span>Explainable AI</span>

                            <span className="hero-dot">
                                •
                            </span>

                            <span>Multimodal AI</span>

                            <span className="hero-dot">
                                •
                            </span>

                            <span>Education</span>
                        </div>

                        <h1>
                            Building
                            <span> technology </span>
                            with purpose
                            <strong>.</strong>
                        </h1>

                        <p className="hero-introduction">
                            I'm{' '}
                            <strong>
                                Enobong Adahada
                            </strong>
                            , an AI researcher, software
                            engineer and educator exploring{' '}
                            <em>
                                multimodal and explainable AI
                            </em>{' '}
                            for medical imaging and clinical
                            decision support.
                        </p>

                        <div className="hero-actions">
                            <Link
                                to="/projects"
                                className="button button-primary"
                            >
                                Explore my work

                                <ArrowRight size={18} />
                            </Link>

                            <Link
                                to="/about"
                                className="button button-secondary"
                            >
                                About me
                            </Link>
                        </div>

                        <div className="hero-expertise">
                            {expertise.map(item => {
                                const Icon = item.icon;

                                return (
                                    <div
                                        className={`hero-expertise-item ${item.type}`}
                                        key={item.title}
                                    >
                                        <Icon size={42} />

                                        <span>
                                            {item.title}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>

            <section className="intro-section">
                <div className="container intro-grid">
                    <div>
                        <span className="section-kicker">
                            About Zayun
                        </span>

                        <h2>
                            Research.
                            <br />
                            Engineering.
                            <br />
                            Education.
                            <br />
                            Impact.
                        </h2>
                    </div>

                    <div className="intro-copy">
                        <p>
                            My work sits at the intersection
                            of artificial intelligence,
                            software engineering, research
                            and education.
                        </p>

                        <p>
                            I develop intelligent systems
                            and explore multimodal,
                            explainable and trustworthy AI
                            approaches with applications in
                            medical imaging and clinical
                            decision support, while
                            combining technology with
                            teaching and knowledge sharing.
                        </p>

                        <Link
                            to="/about"
                            className="text-link"
                        >
                            Discover my journey

                            <ArrowRight size={17} />
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
}

export default Home;