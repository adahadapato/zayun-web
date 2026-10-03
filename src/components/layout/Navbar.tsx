import { useState } from 'react';

import {
    Menu,
    X,
} from 'lucide-react';

import { NavLink } from 'react-router-dom';

const navigation = [
    {
        label: 'Home',
        path: '/',
    },
    {
        label: 'About',
        path: '/about',
    },
    {
        label: 'Experience',
        path: '/experience',
    },
    {
        label: 'Projects',
        path: '/projects',
    },
    {
        label: 'Research',
        path: '/research',
    },
    {
        label: 'Contact',
        path: '/contact',
    },
];

function Navbar() {
    const [menuOpen, setMenuOpen] =
        useState(false);

    const closeMenu = () => {
        setMenuOpen(false);
    };

    return (
        <header className="navbar">
            <div className="container navbar-inner">
                <NavLink
                    to="/"
                    className="brand"
                    aria-label="Zayun home"
                    onClick={closeMenu}
                >
                    <img
                        src="/ZAYUN-logo.png"
                        alt="Zayun"
                        className="brand-logo"
                    />
                </NavLink>

                <nav
                    className={
                        menuOpen
                            ? 'nav-links nav-links-open'
                            : 'nav-links'
                    }
                >
                    {navigation.map(item => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                isActive
                                    ? 'nav-link active'
                                    : 'nav-link'
                            }
                            onClick={closeMenu}
                        >
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <NavLink
                    to="/contact"
                    className="nav-contact"
                    onClick={closeMenu}
                >
                    Let's talk
                </NavLink>

                <button
                    type="button"
                    className="mobile-menu-button"
                    aria-label={
                        menuOpen
                            ? 'Close navigation'
                            : 'Open navigation'
                    }
                    aria-expanded={menuOpen}
                    onClick={() =>
                        setMenuOpen(current => !current)
                    }
                >
                    {menuOpen ? (
                        <X size={25} />
                    ) : (
                        <Menu size={25} />
                    )}
                </button>
            </div>
        </header>
    );
}

export default Navbar;