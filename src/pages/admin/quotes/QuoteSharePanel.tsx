import { useState } from 'react'
import { draftQuotePost } from '../../../api/services/adminService'
import { Button } from '../../../components/ui/Button'
import { TextArea } from '../../../components/ui/Field'
import { StatusBanner } from '../../../components/ui/StatusBanner'
import styles from '../Admin.module.css'

/** X (Twitter) allows this many characters in a post. */
const X_LIMIT = 280

type Note = { message: string; isError: boolean }

/**
 * "Share this quote" in the quote editor: "Draft a post" asks the AI for a LinkedIn post and a short post (WhatsApp /
 * X). The AI writes only the intros and hashtags; the quote's words, who said it and the link come from the saved
 * quote. Both drafts can be edited here and copied; nothing is saved or posted.
 */
export function QuoteSharePanel({ quoteId, hasUnsavedChanges }: {
  /** The saved quote's Id; undefined for a new quote (it needs its web address first). */
  quoteId?: string
  /** True when the form has changes that aren't saved: the post uses the SAVED quote. */
  hasUnsavedChanges: boolean
}) {
  const [linkedIn, setLinkedIn] = useState('')
  const [short, setShort] = useState('')
  const [drafting, setDrafting] = useState(false)
  const [note, setNote] = useState<Note | null>(null)
  const [notOnWebsite, setNotOnWebsite] = useState(false)

  const onDraft = async () => {
    if (!quoteId) return
    setNote(null)
    setDrafting(true)
    const result = await draftQuotePost(quoteId)
    setDrafting(false)
    if (!result.ok) {
      setNote({ message: result.error.displayMessage, isError: true })
      return
    }
    setLinkedIn(result.value.linkedIn)
    setShort(result.value.short)
    setNotOnWebsite(!result.value.isOnWebsite)
    setNote({ message: 'Drafts ready below. Read them, change anything, then copy.', isError: false })
  }

  const copy = async (text: string, what: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setNote({ message: `${what} copied. Paste it into the app to post it.`, isError: false })
    } catch {
      setNote({ message: "Couldn't copy here. Select the text in the box and copy it yourself.", isError: true })
    }
  }

  return (
    <fieldset className={styles.form} style={{ margin: 0, padding: 0, border: 0, gap: 14 }}>
      <legend style={{ display: 'contents' }}>
        <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>Share this quote</span>
      </legend>

      {quoteId ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
          <Button variant="secondary" small busy={drafting} busyText="Asking the AI…" onClick={onDraft}>
            {linkedIn ? 'Draft again' : 'Draft a post'}
          </Button>
          <span className={styles.muted} style={{ fontSize: '0.85rem' }}>
            {hasUnsavedChanges
              ? 'Uses the saved quote: save your changes first if they should be in the post.'
              : 'A LinkedIn post and a short one for WhatsApp or X. The AI writes only the intro and hashtags.'}
          </span>
        </div>
      ) : (
        <p className={styles.muted} style={{ margin: 0, fontSize: '0.88rem' }}>
          Save the quote first: the post links to its page, which it gets when it's saved.
        </p>
      )}

      <StatusBanner message={note?.message} isError={note?.isError} />
      {notOnWebsite && (
        <StatusBanner isError message={"This quote's page isn't on the website yet (a draft, its source not checked, " +
          "or a pinned or Sunday quote before its day), so the link shows \"Page not found\" until then."} />
      )}

      {linkedIn && (
        <>
          <TextArea label="LinkedIn post" rows={9} value={linkedIn} onChange={(e) => setLinkedIn(e.target.value)}
                    hint="Edit freely. The quote and link are exactly as saved." />
          <div>
            <Button variant="plain" small onClick={() => copy(linkedIn, 'LinkedIn post')}
                    aria-label="Copy the LinkedIn post">
              Copy
            </Button>
          </div>

          <TextArea label="Short post (WhatsApp or X)" rows={5} value={short} onChange={(e) => setShort(e.target.value)}
                    hint={short.length > X_LIMIT
                      ? `${short.length} characters: too long for X (${X_LIMIT}). Fine for WhatsApp.`
                      : `${short.length} of ${X_LIMIT} characters for X.`} />
          <div>
            <Button variant="plain" small onClick={() => copy(short, 'Short post')} aria-label="Copy the short post">
              Copy
            </Button>
          </div>
        </>
      )}
    </fieldset>
  )
}
