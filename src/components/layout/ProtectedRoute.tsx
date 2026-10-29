import { Navigate, Outlet, useLocation } from 'react-router'
import { useSession } from '../../state/SessionContext'
import { PageLoading } from '../ui/PageLoading'

/**
 * Pages that need a signed-in admin. Signed out → Log in, then straight back to the page they wanted (?returnTo=…).
 * Optionally limited to a role (or any of several roles); a signed-in person without it goes to the home page.
 */
export function ProtectedRoute({ role }: { role?: string | string[] }) {
  const { status, isInRole } = useSession()
  const location = useLocation()

  // A kept sign-in is still being restored: wait, so the page doesn't flash "Log in"
  if (status === 'loading') return <PageLoading />

  if (status === 'signedOut') {
    const returnTo = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?returnTo=${returnTo}`} replace />
  }

  const allowed = role === undefined ? [] : Array.isArray(role) ? role : [role]
  if (allowed.length > 0 && !allowed.some(isInRole)) return <Navigate to="/" replace />

  return <Outlet />
}
