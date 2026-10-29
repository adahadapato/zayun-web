import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useSearchParams } from 'react-router'
import { ApiError, unwrap } from '../../../api/apiError'
import type { ContactMessageDto } from '../../../api/contracts/dtos'
import type { ContactMessageStatus } from '../../../api/contracts/enums'
import { getContactMessages, remove, setContactMessageStatus } from '../../../api/services/adminService'
import { Button } from '../../../components/ui/Button'
import { TextArea } from '../../../components/ui/Field'
import { ListStatus } from '../../../components/ui/ListStatus'
import { Pager } from '../../../components/ui/Pager'
import { StatusBanner } from '../../../components/ui/StatusBanner'
import { contactStatusText, contactTopics, dateTimeText, labelOf } from '../../../components/ui/labels'
import styles from '../Admin.module.css'
import { AdminHead, ConfirmDelete } from '../AdminParts'

const TABS: { value: ContactMessageStatus | 'All'; label: string }[] = [
  { value: 'New', label: 'New' },
  { value: 'Replied', label: 'Replied' },
  { value: 'Closed', label: 'Closed' },
  { value: 'All', label: 'All' },
]

const PAGE_SIZE = 20

/**
 * Messages sent from the Contact page. Tabs, page and the open message live in the address
 * (?status=Replied&page=2&open={id}), so Back and links work. Reply opens your email app; then mark it Replied.
 */
export default function AdminInboxPage() {
  const queryClient = useQueryClient()
  const [params, setParams] = useSearchParams()
  const status = (params.get('status') ?? 'New') as ContactMessageStatus | 'All'
  const page = Math.max(1, Number(params.get('page')) || 1)
  const openId = params.get('open')

  const inbox = useQuery({
    queryKey: ['admin', 'contact-messages', status, page],
    queryFn: async ({ signal }) => unwrap(await getContactMessages(
      { status: status === 'All' ? undefined : status, page, pageSize: PAGE_SIZE }, signal)),
    placeholderData: keepPreviousData,
  })
  const messages = inbox.data?.messages.items ?? []
  const open = messages.find((m) => m.id === openId)

  const go = (next: Record<string, string | undefined>) => {
    const merged = { status, page: String(page), open: openId ?? undefined, ...next }
    const clean = Object.fromEntries(Object.entries(merged).filter(([, v]) => v !== undefined && v !== '')) as Record<string, string>
    if (clean.status === 'New') delete clean.status
    if (clean.page === '1') delete clean.page
    setParams(clean)
  }

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ['admin', 'contact-messages'] })
    void queryClient.invalidateQueries({ queryKey: ['admin', 'overview'] })
  }

  const counts: Record<string, number | undefined> = {
    New: inbox.data?.newCount,
    Replied: inbox.data?.repliedCount,
    Closed: inbox.data?.closedCount,
    All: inbox.data ? inbox.data.newCount + inbox.data.repliedCount + inbox.data.closedCount : undefined,
  }

  return (
    <>
      <AdminHead eyebrow="Private" title="Inbox"
                 sub="Messages from the Contact page. Each one is also emailed to you when email is switched on." />

      <div className={styles.tabs} role="tablist" aria-label="Messages">
        {TABS.map((t) => (
          <button key={t.value} type="button" role="tab" aria-selected={status === t.value}
                  className={`${styles.tab} ${status === t.value ? styles.tabOn : ''}`}
                  onClick={() => go({ status: t.value, page: '1', open: undefined })}>
            {t.label} {counts[t.value] !== undefined && <small>{counts[t.value]}</small>}
          </button>
        ))}
      </div>

      <div className={styles.inbox}>
        <div>
          <ListStatus isLoading={inbox.isLoading} error={inbox.error} isEmpty={messages.length === 0}
                      emptyText={status === 'New' ? 'No new messages. All caught up.' : 'No messages here.'}
                      onRetry={() => inbox.refetch()} placeholders={3} />
          <ul className={styles.rows}>
            {messages.map((m) => (
              <li key={m.id}>
                <button type="button" className={`${styles.message} ${m.id === openId ? styles.messageOn : ''}`}
                        onClick={() => go({ open: m.id })} aria-current={m.id === openId || undefined}>
                  <span className={styles.messageTop}>
                    <strong>{m.name}</strong>
                    <time dateTime={m.sentAt}>{dateTimeText(m.sentAt)}</time>
                  </span>
                  <span className={styles.rowMeta}>
                    {m.status === 'New' && <span className={`${styles.chip} ${styles.chipNew}`}>New</span>}
                    <span>{labelOf(contactTopics, m.topic)}</span>
                  </span>
                  <span className={styles.messagePreview}>{m.message}</span>
                </button>
              </li>
            ))}
          </ul>
          {inbox.data && <Pager page={page} totalPages={inbox.data.messages.totalPages}
                                onChange={(p) => go({ page: String(p), open: undefined })} />}
        </div>

        <div>
          {open
            ? <MessageView key={open.id} message={open} onChanged={refresh}
                           onDeleted={() => { go({ open: undefined }); refresh() }} />
            : messages.length > 0 && <p className={`${styles.panel} ${styles.muted}`}>Choose a message to read it.</p>}
        </div>
      </div>
    </>
  )
}

function MessageView({ message, onChanged, onDeleted }: {
  message: ContactMessageDto
  onChanged: () => void
  onDeleted: () => void
}) {
  const [note, setNote] = useState(message.staffNote ?? '')
  const [busy, setBusy] = useState<ContactMessageStatus | null>(null)
  const [error, setError] = useState<ApiError | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  const setStatus = async (status: ContactMessageStatus) => {
    setBusy(status)
    setError(null)
    const result = await setContactMessageStatus(message.id, { status, note: note.trim() || null })
    setBusy(null)
    if (!result.ok) {
      setError(result.error)
      return
    }
    setInfo(`Saved as ${contactStatusText[status]}.`)
    onChanged()
  }

  const onDelete = async () => {
    const result = await remove('contact-messages', message.id)
    if (!result.ok) setError(result.error)
    else onDeleted()
  }

  const subject = encodeURIComponent(`Re: your message on zayun.net`)
  const quoted = encodeURIComponent(`\n\n\n— On ${dateTimeText(message.sentAt)}, ${message.name} wrote:\n> ${message.message.split('\n').join('\n> ')}`)

  return (
    <article className={styles.panel} aria-labelledby="message-title">
      <div className={styles.panelHead}>
        <div>
          <h2 id="message-title">{message.name}</h2>
          <p>{labelOf(contactTopics, message.topic)} · {contactStatusText[message.status]}</p>
        </div>
        <a className={styles.back} style={{ margin: 0, color: 'var(--z-cyan)' }}
           href={`mailto:${message.email}?subject=${subject}&body=${quoted}`}>Reply by email ›</a>
      </div>

      <dl className={styles.facts}>
        <dt>Email</dt><dd><a href={`mailto:${message.email}`}>{message.email}</a></dd>
        {message.organisation && <><dt>Organisation</dt><dd>{message.organisation}</dd></>}
        <dt>Sent</dt><dd>{dateTimeText(message.sentAt)}</dd>
        {message.handledAt && <><dt>Handled</dt><dd>{dateTimeText(message.handledAt)}</dd></>}
      </dl>

      <p className={styles.messageBody}>{message.message}</p>

      <TextArea label="Your note" optional rows={3} maxLength={500} value={note} onChange={(e) => setNote(e.target.value)}
                hint="Only you see this, e.g. what you replied." error={error?.fieldError('note')} />

      <StatusBanner message={error && !error.fieldError('note') ? error.displayMessage : null} isError />
      <StatusBanner message={info} />

      <div className={styles.actions}>
        {message.status !== 'Replied' && (
          <Button small busy={busy === 'Replied'} busyText="Saving…" onClick={() => setStatus('Replied')}>Mark replied</Button>
        )}
        {message.status !== 'Closed' && (
          <Button small variant="secondary" busy={busy === 'Closed'} busyText="Saving…" onClick={() => setStatus('Closed')}>
            Close
          </Button>
        )}
        {message.status !== 'New' && (
          <Button small variant="plain" busy={busy === 'New'} busyText="Saving…" onClick={() => setStatus('New')}>
            Mark as new
          </Button>
        )}
        {message.status !== 'New' && note !== (message.staffNote ?? '') && (
          <Button small variant="secondary" onClick={() => setStatus(message.status)}>Save note</Button>
        )}
        <span style={{ marginLeft: 'auto' }}>
          <ConfirmDelete question="Delete this message?" onConfirm={onDelete} />
        </span>
      </div>
    </article>
  )
}
