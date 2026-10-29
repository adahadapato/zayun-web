/**
 * Signing in to the admin area: /api/auth. Same shape as the Phloem website's auth service, without sign-up or
 * two-factor (Zayun has one kind of account: the site's admins).
 * After a successful sign-in it keeps the tokens, so the caller (SessionContext) gets the account in one step.
 */
import type { ApiResult } from '../apiError'
import { get, post, put } from '../client'
import type { ChangePasswordCommand, LoginCommand } from '../contracts/commands'
import type { AdminAccountDto, AuthTokensDto } from '../contracts/dtos'
import { tokens } from '../tokens'

/** Email + password. `remember` keeps the admin signed in after the browser closes. */
export async function login(command: LoginCommand, remember: boolean): Promise<ApiResult<AdminAccountDto>> {
  const answer = await post<AuthTokensDto>('api/auth/login', { ...command, email: command.email.trim() })
  if (!answer.ok) return answer
  tokens.save(answer.value, remember)
  return { ok: true, value: answer.value.account }
}

/** Site start: if tokens were kept, asks who is signed in (the client renews the tokens on the way if needed). */
export async function restoreSession(): Promise<AdminAccountDto | null> {
  if (!tokens.canRefresh) return null
  const me = await getMe()
  if (me.ok) return me.value
  if (me.error.isUnauthorized) tokens.clear()   // no connection: keep the tokens, try again next visit
  return null
}

/** Who is signed in. */
export const getMe = (signal?: AbortSignal) => get<AdminAccountDto>('api/auth/me', signal)

/** Signs out here and cancels the refresh token on the API (best effort: signed out here either way). */
export async function logout(): Promise<void> {
  const refreshToken = tokens.refreshToken
  tokens.clear()
  if (refreshToken) await post<void>('api/auth/logout', { refreshToken })
}

/** Changes the password. The API then ends every session, so the caller signs out locally too. */
export const changePassword = (command: ChangePasswordCommand): Promise<ApiResult<void>> =>
  put<void>('api/auth/password', command)
