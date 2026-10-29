//import {
//    FaGithub,
//    FaLinkedinIn,
//} from 'react-icons/fa';

//function Contact() {
//    return (
//        <main className="contact-page">
//            <section className="contact-hero">
//                <div className="container">
//                    <span className="section-kicker">
//                        Contact
//                    </span>

//                    <h1>
//                        Let's build something
//                        <span> meaningful.</span>
//                    </h1>

//                    <p className="contact-intro">
//                        I'm always interested in thoughtful
//                        conversations around software engineering,
//                        Artificial Intelligence, research and
//                        intelligent systems.
//                    </p>
//                </div>
//            </section>

//            <section className="contact-content">
//                <div className="container contact-grid">
//                    <div className="contact-main">
//                        <span className="contact-label">
//                            Get in touch
//                        </span>

//                        <h2>
//                            Have a project, research idea
//                            or opportunity?
//                        </h2>

//                        <p>
//                            Whether you would like to discuss
//                            software development, AI research,
//                            intelligent systems, research
//                            collaboration or another technology
//                            opportunity, I would be pleased to
//                            hear from you.
//                        </p>

//                        <p>
//                            You can connect with me through
//                            LinkedIn or explore my software
//                            engineering work and public
//                            repositories on GitHub.
//                        </p>

//                        <div className="contact-actions">
//                            <a
//                                href="https://www.linkedin.com/in/enobong-adahada-2831b53ab"
//                                className="contact-primary-action"
//                                target="_blank"
//                                rel="noopener noreferrer"
//                                aria-label="Connect with Enobong Adahada on LinkedIn"
//                            >
//                                <FaLinkedinIn
//                                    size={20}
//                                    aria-hidden="true"
//                                />

//                                <span>
//                                    Connect on LinkedIn
//                                </span>

//                                <span
//                                    className="contact-arrow"
//                                    aria-hidden="true"
//                                >
//                                    ↗
//                                </span>
//                            </a>

//                            <a
//                                href="https://github.com/adahadapato/"
//                                className="contact-secondary-action"
//                                target="_blank"
//                                rel="noopener noreferrer"
//                                aria-label="View Enobong Adahada on GitHub"
//                            >
//                                <FaGithub
//                                    size={20}
//                                    aria-hidden="true"
//                                />

//                                <span>
//                                    View GitHub
//                                </span>

//                                <span
//                                    className="contact-arrow"
//                                    aria-hidden="true"
//                                >
//                                    ↗
//                                </span>
//                            </a>
//                        </div>
//                    </div>

//                    <aside className="contact-sidebar">
//                        <div className="contact-card">
//                            <span className="contact-card-label">
//                                Connect
//                            </span>

//                            <a
//                                href="https://www.linkedin.com/in/enobong-adahada-2831b53ab"
//                                className="contact-social-item"
//                                target="_blank"
//                                rel="noopener noreferrer"
//                            >
//                                <span className="contact-social-icon">
//                                    <FaLinkedinIn
//                                        size={20}
//                                        aria-hidden="true"
//                                    />
//                                </span>

//                                <span className="contact-social-copy">
//                                    <small>
//                                        LinkedIn
//                                    </small>

//                                    <strong>
//                                        Enobong Adahada
//                                    </strong>
//                                </span>

//                                <span
//                                    className="contact-social-arrow"
//                                    aria-hidden="true"
//                                >
//                                    ↗
//                                </span>
//                            </a>

//                            <a
//                                href="https://github.com/adahadapato/"
//                                className="contact-social-item"
//                                target="_blank"
//                                rel="noopener noreferrer"
//                            >
//                                <span className="contact-social-icon">
//                                    <FaGithub
//                                        size={21}
//                                        aria-hidden="true"
//                                    />
//                                </span>

//                                <span className="contact-social-copy">
//                                    <small>
//                                        GitHub
//                                    </small>

//                                    <strong>
//                                        adahadapato
//                                    </strong>
//                                </span>

//                                <span
//                                    className="contact-social-arrow"
//                                    aria-hidden="true"
//                                >
//                                    ↗
//                                </span>
//                            </a>
//                        </div>

//                        <div className="contact-card contact-focus-card">
//                            <span className="contact-card-label">
//                                Areas of interest
//                            </span>

//                            <div className="contact-focus-list">
//                                <span>
//                                    Software Engineering
//                                </span>

//                                <span>
//                                    Artificial Intelligence
//                                </span>

//                                <span>
//                                    Multimodal AI
//                                </span>

//                                <span>
//                                    Explainable AI
//                                </span>

//                                <span>
//                                    Intelligent Systems
//                                </span>

//                                <span>
//                                    Research Collaboration
//                                </span>
//                            </div>
//                        </div>
//                    </aside>
//                </div>
//            </section>

//            <section className="contact-closing">
//                <div className="container">
//                    <span className="section-kicker">
//                        Zayun
//                    </span>

//                    <h2>
//                        Research. Engineering.
//                        Intelligence. Impact.
//                    </h2>

//                    <p>
//                        Building technology with purpose.
//                    </p>
//                </div>
//            </section>
//        </main>
//    );
//}

//export default Contact;

import {
    FaEnvelope,
    FaGithub,
    FaLinkedinIn,
    FaMapMarkerAlt,
    FaPhone,
} from 'react-icons/fa';

import type { ProfileDto, PublicPersonalDetailsDto } from '../../api/contracts/dtos';
import { ProfileIcon } from '../../components/ui/ProfileIcon';
import { usePersonalDetails, useProfiles } from '../../state/contentQueries';
import { ContactForm } from './ContactForm';

/** Shown until the personal details load from the API, or if they can't be loaded. */
const fallbackEmail = 'enobong.adahada@gmail.com';
const fallbackPhones: PublicPersonalDetailsDto['phones'] = [
    { label: 'UK', number: '+44 7881 186690', link: '+447881186690' },
    { label: 'Nigeria', number: '+234 802 317 6049', link: '+2348023176049' },
];

/** Shown until the profiles load from the API, or if they can't be loaded. */
const fallbackProfiles: ProfileDto[] = [
    { id: 'linkedin', platform: 'LinkedIn', name: 'LinkedIn', url: 'https://www.linkedin.com/in/enobong-adahada-2831b53ab',
      label: 'Enobong Adahada', showInFooter: true, showOnContact: true, showOnResearch: false, displayOrder: 0, isPublished: true },
    { id: 'github', platform: 'GitHub', name: 'GitHub', url: 'https://github.com/adahadapato/',
      label: 'adahadapato', showInFooter: true, showOnContact: true, showOnResearch: false, displayOrder: 1, isPublished: true },
];

function Contact() {
    // Profiles ticked "Contact" in Admin → Profiles
    const profiles = useProfiles();
    const contactProfiles = (profiles.data ?? fallbackProfiles).filter(profile => profile.showOnContact);

    // Email, phone numbers and towns switched on in Admin → Account
    const personal = usePersonalDetails();
    const email = personal.data ? personal.data.email : fallbackEmail;
    const phones = personal.data ? personal.data.phones : fallbackPhones;
    const locations = personal.data?.locations ?? [];

    return (
        <main className="contact-page">
            <section className="contact-hero">
                <div className="container">
                    <span className="section-kicker">
                        Contact
                    </span>

                    <h1>
                        Let's build something
                        <span> meaningful.</span>
                    </h1>

                    <p className="contact-intro">
                        I'm always interested in thoughtful
                        conversations around software engineering,
                        Artificial Intelligence, research and
                        intelligent systems.
                    </p>
                </div>
            </section>

            <section className="contact-content">
                <div className="container contact-grid">
                    <div className="contact-main">
                        <span className="contact-label">
                            Get in touch
                        </span>

                        <h2>
                            Have a project, research idea
                            or opportunity?
                        </h2>

                        <p>
                            Whether you would like to discuss
                            software development, AI research,
                            intelligent systems, research
                            collaboration or another technology
                            opportunity, I would be pleased to
                            hear from you.
                        </p>

                        <p>
                            You can contact me directly by email
                            or phone, connect with me on LinkedIn,
                            or explore my software engineering
                            work and public repositories on
                            GitHub.
                        </p>

                        <div className="contact-actions">
                            <a
                                href={`mailto:${email ?? fallbackEmail}`}
                                className="contact-primary-action"
                                aria-label="Email Enobong Adahada"
                            >
                                <FaEnvelope
                                    size={18}
                                    aria-hidden="true"
                                />

                                <span>
                                    Send an Email
                                </span>

                                <span
                                    className="contact-arrow"
                                    aria-hidden="true"
                                >
                                    ↗
                                </span>
                            </a>

                            <a
                                href="https://www.linkedin.com/in/enobong-adahada-2831b53ab"
                                className="contact-secondary-action"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Connect with Enobong Adahada on LinkedIn"
                            >
                                <FaLinkedinIn
                                    size={19}
                                    aria-hidden="true"
                                />

                                <span>
                                    Connect on LinkedIn
                                </span>

                                <span
                                    className="contact-arrow"
                                    aria-hidden="true"
                                >
                                    ↗
                                </span>
                            </a>
                            <a
                                 href="https://github.com/adahadapato/"
                                  className="contact-secondary-action"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        aria-label="View Enobong Adahada on GitHub"
                                                    >
                                                        <FaGithub
                                                            size={20}
                                                            aria-hidden="true"
                                                        />

                                                        <span>
                                                            View GitHub
                                                        </span>

                                                        <span
                                                            className="contact-arrow"
                                                            aria-hidden="true"
                                                        >
                                                            ↗
                                                        </span>
                                                    </a>
                        </div>

                        <ContactForm />
                    </div>

                    <aside className="contact-sidebar">
                        {(email || phones.length > 0) && (
                            <div className="contact-card">
                                <span className="contact-card-label">
                                    Contact details
                                </span>

                                {email && (
                                    <a
                                        href={`mailto:${email}`}
                                        className="contact-social-item"
                                    >
                                        <span className="contact-social-icon">
                                            <FaEnvelope
                                                size={18}
                                                aria-hidden="true"
                                            />
                                        </span>

                                        <span className="contact-social-copy">
                                            <small>
                                                Email
                                            </small>

                                            <strong>
                                                {email}
                                            </strong>
                                        </span>

                                        <span
                                            className="contact-social-arrow"
                                            aria-hidden="true"
                                        >
                                            ↗
                                        </span>
                                    </a>
                                )}

                                {phones.map(phone => (
                                    <a
                                        key={phone.link}
                                        href={`tel:${phone.link}`}
                                        className="contact-social-item"
                                    >
                                        <span className="contact-social-icon">
                                            <FaPhone
                                                size={17}
                                                aria-hidden="true"
                                            />
                                        </span>

                                        <span className="contact-social-copy">
                                            <small>
                                                {phone.label}
                                            </small>

                                            <strong>
                                                {phone.number}
                                            </strong>
                                        </span>

                                        <span
                                            className="contact-social-arrow"
                                            aria-hidden="true"
                                        >
                                            ↗
                                        </span>
                                    </a>
                                ))}

                                {locations.map(location => (
                                    <div
                                        key={location}
                                        className="contact-social-item"
                                    >
                                        <span className="contact-social-icon">
                                            <FaMapMarkerAlt
                                                size={17}
                                                aria-hidden="true"
                                            />
                                        </span>

                                        <span className="contact-social-copy">
                                            <small>
                                                Based in
                                            </small>

                                            <strong>
                                                {location}
                                            </strong>
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {contactProfiles.length > 0 && (
                            <div className="contact-card">
                                <span className="contact-card-label">
                                    Professional profiles
                                </span>

                                {contactProfiles.map(profile => (
                                    <a
                                        key={profile.id}
                                        href={profile.url}
                                        className="contact-social-item"
                                        target="_blank"
                                        rel="noopener noreferrer me"
                                    >
                                        <span className="contact-social-icon">
                                            <ProfileIcon
                                                platform={profile.platform}
                                                size={19}
                                            />
                                        </span>

                                        <span className="contact-social-copy">
                                            <small>
                                                {profile.name}
                                            </small>

                                            <strong>
                                                {profile.label ?? 'Enobong Adahada'}
                                            </strong>
                                        </span>

                                        <span
                                            className="contact-social-arrow"
                                            aria-hidden="true"
                                        >
                                            ↗
                                        </span>
                                    </a>
                                ))}
                            </div>
                        )}

                        <div className="contact-card contact-focus-card">
                            <span className="contact-card-label">
                                Areas of interest
                            </span>

                            <div className="contact-focus-list">
                                <span>
                                    Software Engineering
                                </span>

                                <span>
                                    Artificial Intelligence
                                </span>

                                <span>
                                    Multimodal AI
                                </span>

                                <span>
                                    Explainable AI
                                </span>

                                <span>
                                    Intelligent Systems
                                </span>

                                <span>
                                    Research Collaboration
                                </span>
                            </div>
                        </div>
                    </aside>
                </div>
            </section>

            <section className="contact-closing">
                <div className="container">
                    <span className="section-kicker">
                        Zayun
                    </span>

                    <h2>
                        Research. Engineering.
                        Intelligence. Impact.
                    </h2>

                    <p>
                        Building technology with purpose.
                    </p>
                </div>
            </section>
        </main>
    );
}

export default Contact;