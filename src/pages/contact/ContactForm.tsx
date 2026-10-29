import { useState, type FormEvent } from 'react'
import { ApiError } from '../../api/apiError'
import type { SendContactMessageCommand } from '../../api/contracts/commands'
import type { ContactTopic } from '../../api/contracts/enums'
import { sendContactMessage } from '../../api/services/contactService'
import { Field, Select, TextArea } from '../../components/ui/Field'
import { StatusBanner } from '../../components/ui/StatusBanner'
import { contactTopics } from '../../components/ui/labels'
import styles from './ContactForm.module.css'

const empty: SendContactMessageCommand = { name: '', email: '', organisation: '', topic: 'Project', message: '', website: '' }

/**
 * "Send a message": saved in the admin Inbox (and emailed to Enobong when email is on). The API limits how often one
 * visitor can send. The hidden "website" field is a trap for robots: people never see it.
 */
export function ContactForm() {
  const [fields, setFields] = useState<SendContactMessageCommand>(empty)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)
  const [sent, setSent] = useState(false)

  const set = <K extends keyof SendContactMessageCommand>(k: K, v: SendContactMessageCommand[K]) =>
    setFields((f) => ({ ...f, [k]: v }))
  const err = (name: string) => error?.fieldError(name)

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setError(null)
    const result = await sendContactMessage({ ...fields, organisation: fields.organisation?.trim() || null })
    setBusy(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    setSent(true)
    setFields(empty)
  }

  if (sent) {
    return (
      <div className={styles.card} role="status">
        <span className={styles.tick} aria-hidden="true">✓</span>
        <h3>Thank you, your message has been sent.</h3>
        <p>I'll reply to you by email as soon as I can.</p>
        <button type="button" className={styles.again} onClick={() => setSent(false)}>Send another message</button>
      </div>
    )
  }

  const hasFieldErrors = !!error && Object.keys(error.fieldErrors).length > 0

  return (
    <form className={styles.card} onSubmit={onSubmit} noValidate aria-labelledby="contact-form-title">
      <div>
        <span className={styles.label}>Send a message</span>
        <h3 id="contact-form-title">Write to me here</h3>
      </div>

      <div className={styles.grid}>
        <Field label="Your name" autoComplete="name" value={fields.name} maxLength={100}
               onChange={(e) => set('name', e.target.value)} error={err('name')} />
        <Field label="Email" type="email" autoComplete="email" value={fields.email} maxLength={256}
               onChange={(e) => set('email', e.target.value)} error={err('email')} />
        <Field label="Organisation" optional autoComplete="organization" value={fields.organisation ?? ''} maxLength={150}
               onChange={(e) => set('organisation', e.target.value)} error={err('organisation')} />
        <Select label="About" value={fields.topic} options={contactTopics}
                onChange={(e) => set('topic', e.target.value as ContactTopic)} error={err('topic')} />
      </div>

      <TextArea label="Message" rows={6} value={fields.message} maxLength={4000}
                onChange={(e) => set('message', e.target.value)} error={err('message')} />

      {/* Robots fill in every field; people never see this one */}
      <div className={styles.trap} aria-hidden="true">
        <label>Website <input tabIndex={-1} autoComplete="off" value={fields.website ?? ''}
                              onChange={(e) => set('website', e.target.value)} /></label>
      </div>

      <StatusBanner isError message={error ? (hasFieldErrors ? 'Please check the fields marked in red.' : error.displayMessage) : null} />

      <button type="submit" className="contact-primary-action" disabled={busy} aria-busy={busy || undefined}>
        <span>{busy ? 'Sending…' : 'Send message'}</span>
        <span className="contact-arrow" aria-hidden="true">↗</span>
      </button>
    </form>
  )
}
