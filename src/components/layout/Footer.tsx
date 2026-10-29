import { Link } from 'react-router';

import type { ProfileDto } from '../../api/contracts/dtos';
import { ProfileIcon } from '../ui/ProfileIcon';
import { useProfiles } from '../../state/contentQueries';

import { useSession } from '../../state/SessionContext';

const currentYear = new Date().getFullYear();

/** Shown until the profiles load from the API, or if they can't be loaded. */
const fallbackProfiles: Pick<ProfileDto, 'id' | 'platform' | 'name' | 'url'>[] = [
    { id: 'github', platform: 'GitHub', name: 'GitHub', url: 'https://github.com/adahadapato/' },
    { id: 'linkedin', platform: 'LinkedIn', name: 'LinkedIn', url: 'https://www.linkedin.com/in/enobong-adahada-2831b53ab' },
];

function Footer() {
    const { isAdmin } = useSession();
    const profiles = useProfiles();
    // Profiles ticked "Footer" in Admin → Profiles
    const footerProfiles = profiles.data
        ? profiles.data.filter(profile => profile.showInFooter)
        : fallbackProfiles;

    return (
        <footer className="footer">
            <div className="container footer-content">
                <div className="footer-introduction">
                    <Link
                        to="/"
                        className="footer-brand"
                    >
                        ZAYUN
                        <span>.</span>
                    </Link>

                    <p>
                        Technology, research and ideas
                        built with purpose.
                    </p>
                </div>

                <div className="footer-socials">
                    {footerProfiles.map(profile => (
                        <a
                            key={profile.id}
                            href={profile.url}
                            className="footer-social-link"
                            target="_blank"
                            rel="noopener noreferrer me"
                            aria-label={`Visit Enobong Adahada on ${profile.name}`}
                        >
                            <ProfileIcon
                                platform={profile.platform}
                                size={17}
                            />

                            <span>
                                {profile.name}
                            </span>
                        </a>
                    ))}
                </div>

                <div className="footer-right">
                    <p>
                        &copy; {currentYear} Enobong Adahada
                    </p>

                    <p>
                        All rights reserved.
                    </p>

                    {/* A quiet way into the admin area (signed in: straight to the dashboard) */}
                    <Link
                        to={isAdmin ? '/admin' : '/login'}
                        className="footer-admin-link"
                    >
                        {isAdmin ? 'Admin dashboard' : 'Admin sign in'}
                    </Link>
                </div>
            </div>
        </footer>
    );
}

export default Footer;