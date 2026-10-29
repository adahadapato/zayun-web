/**
 * Who is signed in, for every page: the admin account from the API and the roles from the sign-in token.
 * Same job as the Phloem website's SessionContext.
 *
 * - On start, a kept sign-in is restored (status "loading" until then, so the admin area doesn't flash "Log in").
 * - When the sign-in runs out and can't be renewed, the admin is shown as signed out.
 * - Visitors of the public website are never signed in; nothing here runs for them unless tokens were kept.
 */
import { useQueryClient } from '@tanstack/react-query'
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { AdminAccountDto } from '../api/contracts/dtos'
import { Roles } from '../api/contracts/roles'
import { getMe, logout as apiLogout, restoreSession } from '../api/services/authService'
import { tokens } from '../api/tokens'

type Status = 'loading' | 'signedOut' | 'signedIn'

interface SessionState {
  status: Status
  /** The signed-in admin, or null. */
  account: AdminAccountDto | null
  /** True for admins. */
  isAdmin: boolean
  /** Checks a role from the sign-in token. */
  isInRole: (role: string) => boolean
  /** After a successful sign-in: shows the admin as signed in. */
  signedIn: (account: AdminAccountDto) => void
  /** Reloads the account. */
  refreshAccount: () => Promise<void>
  /** Signs out here and on the API. */
  logout: () => Promise<void>
  /** Forgets the sign-in here only (the API has already ended it, e.g. after a password change). */
  forget: () => void
}

const SessionContext = createContext<SessionState | null>(null)

export function SessionProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [status, setStatus] = useState<Status>(tokens.canRefresh ? 'loading' : 'signedOut')
  const [account, setAccount] = useState<AdminAccountDto | null>(null)
  const [roles, setRoles] = useState<string[]>(tokens.roles)

  const showSignedOut = useCallback(() => {
    setAccount(null)
    setRoles([])
    setStatus('signedOut')
    queryClient.removeQueries({ queryKey: ['admin'] })   // no admin data stays in the cache
  }, [queryClient])

  // Start: restore a kept sign-in
  useEffect(() => {
    if (!tokens.canRefresh) return
    let active = true
    restoreSession().then((restored) => {
      if (!active) return
      if (restored) {
        setAccount(restored)
        setRoles(tokens.roles)
        setStatus('signedIn')
      } else {
        setStatus('signedOut')
      }
    })
    return () => {
      active = false
    }
  }, [])

  // The sign-in ran out and couldn't be renewed
  useEffect(() => tokens.onExpired(showSignedOut), [showSignedOut])

  const value = useMemo<SessionState>(() => {
    const isInRole = (role: string) =>
      status === 'signedIn' && roles.some((r) => r.toLowerCase() === role.toLowerCase())

    return {
      status,
      account,
      isAdmin: isInRole(Roles.Admin),
      isInRole,
      signedIn: (signedInAccount) => {
        setAccount(signedInAccount)
        setRoles(tokens.roles)
        setStatus('signedIn')
      },
      refreshAccount: async () => {
        const result = await getMe()
        if (result.ok) {
          setAccount(result.value)
          setRoles(tokens.roles)
        }
      },
      logout: async () => {
        await apiLogout()
        showSignedOut()
      },
      forget: () => {
        tokens.clear()
        showSignedOut()
      },
    }
  }, [status, account, roles, showSignedOut])

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

/** The signed-in admin. Use inside {@link SessionProvider}. */
// eslint-disable-next-line react-refresh/only-export-components
export function useSession(): SessionState {
  const state = useContext(SessionContext)
  if (!state) throw new Error('useSession must be used inside <SessionProvider>.')
  return state
}
