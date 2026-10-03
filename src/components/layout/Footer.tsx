import {
    FaGithub,
    FaLinkedinIn,
} from 'react-icons/fa';

import { Link } from 'react-router-dom';

const currentYear = new Date().getFullYear();

const socialLinks = [
    {
        name: 'GitHub',
        href: 'https://github.com/adahadapato/',
        icon: FaGithub,
    },
    {
        name: 'LinkedIn',
        href: 'https://www.linkedin.com/in/enobong-adahada-2831b53ab',
        icon: FaLinkedinIn,
    },
];

function Footer() {
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
                    {socialLinks.map(item => {
                        const Icon = item.icon;

                        return (
                            <a
                                key={item.name}
                                href={item.href}
                                className="footer-social-link"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`Visit Enobong Adahada on ${item.name}`}
                            >
                                <Icon
                                    size={19}
                                    aria-hidden="true"
                                />

                                <span>
                                    {item.name}
                                </span>
                            </a>
                        );
                    })}
                </div>

                <div className="footer-right">
                    <p>
                        &copy; {currentYear} Enobong Adahada
                    </p>

                    <p>
                        All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;