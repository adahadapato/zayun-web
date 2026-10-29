/**
 * Every address on the website, in one place (same structure as the Phloem website).
 * Pages load only when opened (React Router's `lazy`), so visitors of the public site never download the admin area.
 * Each page file has a default export.
 */
import type { ComponentType } from 'react'
import { createBrowserRouter, Navigate, type RouteObject } from 'react-router'
import { Roles } from './api/contracts/roles'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import MainLayout from './layouts/MainLayout'

/** Loads a page file only when its address is opened. */
const page = (load: () => Promise<{ default: ComponentType }>): Pick<RouteObject, 'lazy'> => ({
  lazy: async () => ({ Component: (await load()).default }),
})

export const router = createBrowserRouter([
  // The public website
  {
    element: <MainLayout />,
    children: [
      { index: true, ...page(() => import('./pages/home/Home')) },
      { path: 'about', ...page(() => import('./pages/about/About')) },
      { path: 'experience', ...page(() => import('./pages/experience/Experience')) },
      { path: 'projects', ...page(() => import('./pages/projects/Projects')) },
      { path: 'research', ...page(() => import('./pages/research/Research')) },
      { path: 'skills', ...page(() => import('./pages/skills/Skills')) },
      { path: 'awards', ...page(() => import('./pages/awards/Awards')) },
      { path: 'contact', ...page(() => import('./pages/contact/Contact')) },
    ],
  },

  // Signing in to the admin area (no public link: go to /admin or /login)
  { path: 'login', ...page(() => import('./pages/auth/LoginPage')) },

  // The admin area: signed-in admins only (others are sent to Log in, then back)
  {
    element: <ProtectedRoute role={Roles.Admin} />,
    children: [
      {
        path: 'admin',
        ...page(() => import('./pages/admin/AdminLayout')),
        children: [
          { index: true, ...page(() => import('./pages/admin/AdminOverviewPage')) },
          { path: 'projects', ...page(() => import('./pages/admin/projects/AdminProjectsPage')) },
          { path: 'projects/new', ...page(() => import('./pages/admin/projects/AdminProjectEditorPage')) },
          { path: 'projects/:projectId', ...page(() => import('./pages/admin/projects/AdminProjectEditorPage')) },
          { path: 'publications', ...page(() => import('./pages/admin/research/AdminPublicationsPage')) },
          { path: 'presentations', ...page(() => import('./pages/admin/research/AdminPresentationsPage')) },
          { path: 'experience', ...page(() => import('./pages/admin/experience/AdminExperiencePage')) },
          { path: 'skills', ...page(() => import('./pages/admin/skills/AdminSkillsPage')) },
          { path: 'awards', ...page(() => import('./pages/admin/awards/AdminAwardsPage')) },
          { path: 'inbox', ...page(() => import('./pages/admin/inbox/AdminInboxPage')) },
          { path: 'documents', ...page(() => import('./pages/admin/documents/AdminDocumentsPage')) },
          { path: 'account', ...page(() => import('./pages/admin/account/AdminAccountPage')) },
        ],
      },
    ],
  },

  // Anything else goes to the home page (as before)
  { path: '*', element: <Navigate to="/" replace /> },
])
