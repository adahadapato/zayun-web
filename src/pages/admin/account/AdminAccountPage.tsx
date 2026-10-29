import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { ApiError } from '../../../api/apiError'
import { changePassword } from '../../../api/services/authService'
import { Button } from '../../../components/ui/Button'
import { Field } from '../../../components/ui/Field'
import { StatusBanner } from '../../../components/ui/StatusBanner'
import { useSession } from '../../../state/SessionContext'
import styles from '../Admin.module.css'
import { AdminHead } from '../AdminParts'
import { PersonalDetailsSection } from './PersonalDetailsSection'
import { PhotoSection } from './PhotoSection'

/**
 * The admin account: your photo, personal details (phones, addresses…), who is signed in, and Change password. After a change the API signs out every device, so this
 * one goes to Sign in with a note.
 */
export default function AdminAccountPage() {
  const { account, forget } = useSession()
  const navigate = useNavigate()
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [repeat, setRepeat] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    if (next !== repeat) {
      setError(new ApiError(400, 'Local.Mismatch', 'The new passwords are not the same.', { repeat: ['The new passwords are not the same.'] }))
      return
    }
    setBusy(true)
    const result = await changePassword({ currentPassword: current, newPassword: next })
    setBusy(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    forget()
    navigate('/login?changed=1', { replace: true })
  }

  return (
    <>
      <AdminHead eyebrow="Private" title="Account"
                 sub="You: your photo and details for the website, your sign-in, and your password." />

      <PhotoSection />
      <PersonalDetailsSection />

      {account && (
        <section className={styles.panel} aria-labelledby="who">
          <div className={styles.panelHead}><h2 id="who">Signed in as</h2></div>
          <dl className={styles.facts}>
            <dt>Name</dt><dd>{account.firstName} {account.lastName}</dd>
            <dt>Email</dt><dd>{account.email}</dd>
            <dt>Role</dt><dd>{account.roles.join(', ')}</dd>
          </dl>
        </section>
      )}

      <form className={`${styles.panel} ${styles.form}`} onSubmit={onSubmit} noValidate style={{ maxWidth: 560 }}>
        <div className={styles.panelHead}>
          <div>
            <h2>Change password</h2>
            <p>You'll be signed out everywhere and asked to sign in again.</p>
          </div>
        </div>
        <Field label="Current password" type="password" autoComplete="current-password" value={current}
               onChange={(e) => setCurrent(e.target.value)} error={error?.fieldError('currentPassword')} />
        <Field label="New password" type="password" autoComplete="new-password" value={next}
               onChange={(e) => setNext(e.target.value)} error={error?.fieldError('newPassword')}
               hint="At least 10 characters, with upper and lower case letters and a number." />
        <Field label="New password again" type="password" autoComplete="new-password" value={repeat}
               onChange={(e) => setRepeat(e.target.value)} error={error?.fieldError('repeat')} />
        {error && !Object.keys(error.fieldErrors).length && <StatusBanner message={error.displayMessage} isError />}
        <div className={styles.actions}>
          <Button type="submit" busy={busy} busyText="Changing…" disabled={!current || !next || !repeat}>
            Change password
          </Button>
        </div>
      </form>
    </>
  )
}
