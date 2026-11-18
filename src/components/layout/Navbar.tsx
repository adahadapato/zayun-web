import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';

import {
    ChevronDown,
    Menu,
    X,
} from 'lucide-react';

import { NavLink, useLocation } from 'react-router';

type NavPage = {
    label: string;
    path: string;
};

type NavGroupItem = {
    label: string;
    children: NavPage[];
    /** Not shown yet (e.g. the CV pages before they exist). */
    hidden?: boolean;
};

type NavItem = NavPage | NavGroupItem;

/**
 * The site's menu. Groups open a small list (on a phone, every group is listed open). Agreed 18 Nov 2026:
 * Home · About ▾ · Projects · Research · Quotes · CV ▾ · Contact, plus the "Let's talk" button.
 */
const navigation: NavItem[] = [
    {
        label: 'Home',
        path: '/',
    },
    {
        label: 'About',
        children: [
            { label: 'About me', path: '/about' },
            { label: 'Experience', path: '/experience' },
            { label: 'Skills', path: '/skills' },
            { label: 'Awards', path: '/awards' },
        ],
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
        label: 'Quotes',
        path: '/quotes',
    },
    {
        label: 'CV',
        hidden: true, // shown once the CV pages exist (CV1, CV2)
        children: [
            { label: 'Work CV', path: '/cv/work' },
            { label: 'Academic CV', path: '/cv/academic' },
        ],
    },
    {
        label: 'Contact',
        path: '/contact',
    },
];

const isGroup = (item: NavItem): item is NavGroupItem => 'children' in item;

/** True when the address is this page or one of its sub-pages (e.g. /quotes/some-quote for /quotes). */
const isOn = (pathname: string, path: string) =>
    path === '/' ? pathname === '/' : pathname === path || pathname.startsWith(path + '/');

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
                    aria-label="Main"
                    className={
                        menuOpen
                            ? 'nav-links nav-links-open'
                            : 'nav-links'
                    }
                >
                    {navigation.map(item =>
                        isGroup(item) ? (
                            !item.hidden && (
                                <NavGroup
                                    key={item.label}
                                    group={item}
                                    onNavigate={closeMenu}
                                />
                            )
                        ) : (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                end={item.path === '/'}
                                className={({ isActive }) =>
                                    isActive
                                        ? 'nav-link active'
                                        : 'nav-link'
                                }
                                onClick={closeMenu}
                            >
                                {item.label}
                            </NavLink>
                        )
                    )}
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

/**
 * A group in the menu, e.g. "About ▾" (a disclosure button and a list of links, not an ARIA menu, so screen readers
 * read it as ordinary links). Opens on click, tap, Enter or Space; ↓ opens it and moves into the list; ↑ / ↓ move
 * between the links; Escape closes it and returns to the button. Closes when the focus or a click leaves it, and when
 * the page changes. On a phone (the ☰ menu) the list is always shown under the group's name.
 */
function NavGroup({ group, onNavigate }: { group: NavGroupItem; onNavigate: () => void }) {
    const { pathname } = useLocation();
    // Open "on this page": when the page changes, it's closed without an extra effect
    const [openOn, setOpenOn] = useState<string | null>(null);
    const open = openOn === pathname;
    const setOpen = (value: boolean | ((current: boolean) => boolean)) =>
        setOpenOn(typeof value === 'function' ? (value(open) ? pathname : null) : value ? pathname : null);
    const panelId = useId();
    const container = useRef<HTMLDivElement>(null);
    const button = useRef<HTMLButtonElement>(null);

    const isActive = group.children.some(child => isOn(pathname, child.path));

    // Close on a click or tap outside
    useEffect(() => {
        if (!open) return;
        const onPointerDown = (event: PointerEvent) => {
            if (!container.current?.contains(event.target as Node)) setOpenOn(null);
        };
        document.addEventListener('pointerdown', onPointerDown);
        return () => document.removeEventListener('pointerdown', onPointerDown);
    }, [open]);

    const links = () =>
        Array.from(container.current?.querySelectorAll<HTMLAnchorElement>('.nav-dropdown-link') ?? []);

    const focusLink = (index: number) => {
        const all = links();
        if (all.length === 0) return;
        all[(index + all.length) % all.length].focus();
    };

    const onButtonKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            setOpen(true);
            requestAnimationFrame(() => focusLink(0));
        }
    };

    const onPanelKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
        const all = links();
        const index = all.indexOf(document.activeElement as HTMLAnchorElement);
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            focusLink(index + 1);
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            focusLink(index - 1);
        } else if (event.key === 'Home') {
            event.preventDefault();
            focusLink(0);
        } else if (event.key === 'End') {
            event.preventDefault();
            focusLink(all.length - 1);
        }
    };

    const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Escape' && open) {
            event.stopPropagation();
            setOpen(false);
            button.current?.focus();
        }
    };

    return (
        <div
            ref={container}
            className="nav-group"
            data-open={open}
            onKeyDown={onKeyDown}
            onBlur={event => {
                if (!container.current?.contains(event.relatedTarget as Node | null)) setOpen(false);
            }}
        >
            <button
                ref={button}
                type="button"
                className={isActive ? 'nav-link nav-group-toggle active' : 'nav-link nav-group-toggle'}
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpen(current => !current)}
                onKeyDown={onButtonKeyDown}
            >
                {group.label}
                <ChevronDown size={15} aria-hidden="true" className="nav-group-chevron" />
            </button>

            {/* On a phone the group's name is a plain label above its links */}
            <span className="nav-group-label">{group.label}</span>

            <ul id={panelId} className="nav-dropdown-panel" onKeyDown={onPanelKeyDown}>
                {group.children.map(child => (
                    <li key={child.path}>
                        <NavLink
                            to={child.path}
                            className={({ isActive: active }) =>
                                active ? 'nav-dropdown-link active' : 'nav-dropdown-link'
                            }
                            onClick={() => {
                                setOpen(false);
                                onNavigate();
                            }}
                        >
                            {child.label}
                        </NavLink>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Navbar;
