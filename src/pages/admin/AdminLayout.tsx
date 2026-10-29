import { useQuery } from '@tanstack/react-query'
import { useEffect, type ReactNode } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router'
import { unwrap } from '../../api/apiError'
import { getOverview } from '../../api/services/adminService'
import { useSession } from '../../state/SessionContext'
import styles from './Admin.module.css'

/** Small line icons for the menu (24×24, drawn with the current colour). */
const icon = (d: ReactNode) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
       strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{d}</svg>
)

const ICONS = {
  overview: icon(<><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>),
  projects: icon(<><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" /></>),
  publications: icon(<><path d="M4 4h11l5 5v11H4Z" /><path d="M15 4v5h5M8 13h8M8 17h5" /></>),
  presentations: icon(<><rect x="3" y="4" width="18" height="12" rx="1.5" /><path d="M12 16v4M8 20h8" /></>),
  experience: icon(<><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" /></>),
  skills: icon(<><path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9Z" /></>),
  inbox: icon(<><path d="M3 13h5l1.5 3h5L16 13h5" /><path d="M5 5h14l2 8v6H3v-6Z" /></>),
  documents: icon(<><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>),
  awards: icon(<><circle cx="12" cy="9" r="6" /><path d="m8.5 13.8-1.5 7.2 5-3 5 3-1.5-7.2" /></>),
  tags: icon(<><path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9Z" /><circle cx="7.5" cy="7.5" r="1.5" /></>),
  profiles: icon(<><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></>),
  account: icon(<><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>),
  site: icon(<><path d="M14 4h6v6M20 4l-9 9" /><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" /></>),
  signOut: icon(<><path d="M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4M10 16l-4-4 4-4M6 12h10" /></>),
}

/** The menu, in groups: the website's content, then private things. */
const MENU: { group?: string; to: string; label: string; icon: ReactNode; end?: boolean }[] = [
  { to: '/admin', label: 'Overview', icon: ICONS.overview, end: true },
  { group: 'Website', to: '/admin/projects', label: 'Projects', icon: ICONS.projects },
  { to: '/admin/publications', label: 'Publications', icon: ICONS.publications },
  { to: '/admin/presentations', label: 'Presentations', icon: ICONS.presentations },
  { to: '/admin/experience', label: 'Experience', icon: ICONS.experience },
  { to: '/admin/skills', label: 'Skills', icon: ICONS.skills },
  { to: '/admin/awards', label: 'Awards', icon: ICONS.awards },
  { to: '/admin/tags', label: 'Tags', icon: ICONS.tags },
  { to: '/admin/profiles', label: 'Profiles', icon: ICONS.profiles },
  { group: 'Private', to: '/admin/inbox', label: 'Inbox', icon: ICONS.inbox },
  { to: '/admin/documents', label: 'Documents', icon: ICONS.documents },
  { to: '/admin/account', label: 'Account', icon: ICONS.account },
]

/**
 * The admin area: the menu on the left (a row that scrolls sideways on a phone) and the page on the right.
 * Inbox shows how many new messages wait. Search engines are asked not to list these pages.
 */
export default function AdminLayout() {
  const { account, logout } = useSession()
  const navigate = useNavigate()
  const overview = useQuery({
    queryKey: ['admin', 'overview'],
    queryFn: async ({ signal }) => unwrap(await getOverview(signal)),
  })
  const newMessages = overview.data?.newMessages ?? 0

  useEffect(() => {
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex, nofollow'
    document.head.appendChild(meta)
    return () => meta.remove()
  }, [])

  const signOut = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  const link = ({ isActive }: { isActive: boolean }) => (isActive ? `${styles.navLink} ${styles.navOn}` : styles.navLink)

  return (
    <div className={styles.shell}>
      <aside className={styles.side}>
        <Link to="/admin" className={styles.brand}>
          <img src="/zayun-icon.png" alt="" />
          <span><strong>ZAYUN</strong><small>Admin</small></span>
        </Link>

        <nav aria-label="Admin" className={styles.nav}>
          {MENU.map((m) => (
            <div key={m.to} style={{ display: 'contents' }}>
              {m.group && <p className={styles.navGroup}>{m.group}</p>}
              <NavLink to={m.to} end={m.end} className={link}>
                {m.icon} {m.label}
                {m.to === '/admin/inbox' && newMessages > 0 && (
                  <span className={styles.navCount} aria-label={`${newMessages} new`}>{newMessages}</span>
                )}
              </NavLink>
            </div>
          ))}
        </nav>

        <div className={styles.sideFoot}>
          {account && (
            <p className={styles.who}>
              <strong>{account.firstName} {account.lastName}</strong>
              <span>{account.email}</span>
            </p>
          )}
          <a href="/" target="_blank" rel="noreferrer" className={styles.navLink}>{ICONS.site} View site</a>
          <button type="button" className={styles.sideButton} onClick={signOut}>{ICONS.signOut} Sign out</button>
        </div>
      </aside>

      <main className={styles.main} id="admin-main">
        <Outlet />
      </main>
    </div>
  )
}
