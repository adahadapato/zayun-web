import { useEffect, useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router'
import { ApiError } from '../../api/apiError'
import { login } from '../../api/services/authService'
import { Button } from '../../components/ui/Button'
import { Field } from '../../components/ui/Field'
import { PageLoading } from '../../components/ui/PageLoading'
import { StatusBanner } from '../../components/ui/StatusBanner'
import { useSession } from '../../state/SessionContext'
import styles from './Auth.module.css'
import { safeReturnTo } from './returnTo'

/**
 * Sign in to the admin area: email, password (with the eye) and "Keep me signed in". There's no sign-up: the admin
 * account is made by the API's seed data. Afterwards: back to the page that was asked for (?returnTo=…), else /admin.
 */
export default function LoginPage() {
  const { signedIn, status: sessionStatus } = useSession()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const returnTo = safeReturnTo(params.get('returnTo'))

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)
  const [message, setMessage] = useState<string | null>(params.get('changed') === '1'
    ? 'Your password has been changed. Please sign in with your new password.'
    : null)

  useEffect(() => {
    document.title = 'Sign in · Zayun admin'
  }, [])

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setMessage(null)
    if (!email.trim() || !password) {
      setError(new ApiError(400, 'Local.Missing', 'Please enter your email and password.'))
      return
    }
    setBusy(true)
    setError(null)
    const result = await login({ email, password }, remember)
    setBusy(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    signedIn(result.value)
    navigate(returnTo, { replace: true })
  }

  if (sessionStatus === 'loading') return <div className={styles.page}><PageLoading /></div>
  if (sessionStatus === 'signedIn' && !busy) return <Navigate to={returnTo} replace />

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <Link to="/" className={styles.brand} aria-label="Zayun home">
          <img src="/zayun-icon.png" alt="" width="52" height="52" />
        </Link>

        <form className={styles.card} onSubmit={onSubmit} noValidate>
          <div className={styles.heading}>
            <p className={styles.eyebrow}>Admin</p>
            <h1>Welcome back</h1>
            <p>Sign in to manage zayun.net.</p>
          </div>

          <Field label="Email" type="email" autoComplete="username" value={email} autoFocus
                 onChange={(e) => setEmail(e.target.value)} error={error?.fieldError('email')} />
          <Field label="Password" type="password" autoComplete="current-password" value={password}
                 onChange={(e) => setPassword(e.target.value)} error={error?.fieldError('password')} />

          <label className={styles.remember}>
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
            Keep me signed in on this device
          </label>

          <StatusBanner message={message} />
          {error && !error.fieldError('email') && !error.fieldError('password') &&
            <StatusBanner message={error.displayMessage} isError />}

          <Button type="submit" full busy={busy} busyText="Signing in…">Sign in</Button>
        </form>

        <Link to="/" className={styles.backLink}>‹ Back to zayun.net</Link>
      </div>
    </div>
  )
}
