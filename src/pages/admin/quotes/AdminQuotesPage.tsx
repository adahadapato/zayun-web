import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router'
import { ApiError, unwrap } from '../../../api/apiError'
import { fileUrl } from '../../../api/config'
import type { QuoteFields } from '../../../api/contracts/commands'
import type { QuoteDto, QuotePreviewDayDto } from '../../../api/contracts/dtos'
import type { QuoteKind, QuotePickReason } from '../../../api/contracts/enums'
import {
  createQuote, getAdminQuotes, getQuotePreview, removeQuoteAnimation, removeQuotePicture, setQuoteAnimation,
  setQuotePicture, suggestQuoteDetails, updateQuote,
} from '../../../api/services/adminService'
import { ApiImage } from '../../../components/ui/ApiImage'
import { Button } from '../../../components/ui/Button'
import { Field, Select, TextArea, Toggle } from '../../../components/ui/Field'
import { ListStatus } from '../../../components/ui/ListStatus'
import { StatusBanner } from '../../../components/ui/StatusBanner'
import styles from '../Admin.module.css'
import { AdminHead, ConfirmDelete, FilePicker, OrderButtons, PublishedChip } from '../AdminParts'
import { useAdminList } from '../useAdminList'

const key = ['admin', 'quotes'] as const
const previewKey = ['admin', 'quotes', 'preview'] as const
const PICTURE_MAX_BYTES = 15 * 1024 * 1024
const ANIMATION_MAX_BYTES = 8 * 1024 * 1024
const SEARCH_DESCRIPTION_MAX = 160
const MAX_THEMES = 5
const PREVIEW_DAYS = 14

const KINDS: { value: QuoteKind; label: string }[] = [
  { value: 'Quote', label: 'Quote (someone else\'s words)' },
  { value: 'Proverb', label: 'Proverb (traditional saying)' },
  { value: 'OwnSaying', label: 'My own saying' },
]

const KIND_LABELS: Record<QuoteKind, string> = { Quote: 'Quote', Proverb: 'Proverb', OwnSaying: 'Own saying' }

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October',
  'November', 'December']

const REASONS: Record<QuotePickReason, string> = {
  PinnedDay: 'Pinned day',
  WeeklySeries: 'Sunday series',
  Rotation: 'Rotation',
}

/** "17 Dec" for a pinned day. */
const pinnedLabel = (month: number, day: number) => `${day} ${MONTHS[month - 1].slice(0, 3)}`

/** "Thu 12 Nov" for a "2026-11-12" date (read as a calendar date, not converted between time zones). */
const dayLabel = (date: string) => {
  const [y, m, d] = date.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
}

/** Every theme the quotes use, most used first (the chips under Themes in the editor). */
const allThemes = (quotes: QuoteDto[]) => {
  const counts = new Map<string, { name: string; count: number }>()
  for (const theme of quotes.flatMap((q) => q.themes)) {
    const k = theme.toLowerCase()
    const entry = counts.get(k) ?? { name: theme, count: 0 }
    entry.count++
    counts.set(k, entry)
  }
  return [...counts.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)).map((e) => e.name)
}

/** "Nature, Flight" → ["Nature", "Flight"]: trimmed, no empties, no repeats (any letter case). */
const parseThemes = (text: string) => {
  const seen = new Set<string>()
  return text.split(',').map((t) => t.trim()).filter((t) => {
    const k = t.toLowerCase()
    if (!t || seen.has(k)) return false
    seen.add(k)
    return true
  })
}

/** Why a quote isn't shown on the website, in plain words; null when it can be shown. */
const notShownBecause = (q: QuoteDto) =>
  q.canBeShown ? null : !q.isPublished ? null /* the Draft chip already says it */ : 'Source not checked'

/**
 * Quote of the day: the quotes, proverbs and own sayings the website rotates through, one a day (UK date).
 * Pinned quotes show on their day only; series quotes ("Nature first") on Sundays; the rest in this order.
 */
export default function AdminQuotesPage() {
  const [params, setParams] = useSearchParams()
  const queryClient = useQueryClient()
  const quotes = useQuery({
    queryKey: key,
    queryFn: async ({ signal }) => unwrap(await getAdminQuotes(signal)),
  })
  const list = useAdminList<QuoteDto>('quotes', key)
  const items = quotes.data ?? []

  // Any change to the list (publish, move, delete, save) changes what's coming up
  useEffect(() => {
    if (quotes.dataUpdatedAt) void queryClient.invalidateQueries({ queryKey: previewKey })
  }, [quotes.dataUpdatedAt, queryClient])

  const editId = params.get('edit')
  const isNew = params.get('new') === '1'
  const editing = editId ? items.find((q) => q.id === editId) : undefined
  const close = () => setParams({}, { replace: true })

  return (
    <>
      <AdminHead eyebrow="Website" title="Quotes"
                 sub={<>One a day on the Home and About pages (UK date). A <strong>pinned</strong> quote shows on its
                   day only, <strong>series</strong> quotes (e.g. "Nature first") on Sundays, and the rest take turns
                   in this order. Only published quotes whose source is checked are shown.</>}>
        {!isNew && <Button onClick={() => setParams({ new: '1' })}>New quote</Button>}
      </AdminHead>

      {(isNew || editing) && (
        <QuoteEditor key={editing?.id ?? 'new'} quote={editing} onDone={close} allThemes={allThemes(items)}
                     onCreated={(id) => setParams({ edit: id }, { replace: true })} />
      )}

      <ComingUp />

      <StatusBanner message={list.error?.displayMessage} isError />
      <ListStatus isLoading={quotes.isLoading} error={quotes.error} isEmpty={items.length === 0}
                  emptyText="No quotes yet. Add the first one." onRetry={() => quotes.refetch()} />

      <ul className={styles.rows}>
        {items.map((q, index) => {
          const problem = notShownBecause(q)
          return (
            <li key={q.id} className={`${styles.row} ${q.canBeShown ? '' : styles.rowDraft}`}>
              {q.media
                ? <ApiImage src={q.media.thumbnailUrl ?? q.media.pictureUrl} alt={q.media.altText}
                            className={styles.rowThumb} />
                : <span className={styles.rowThumb} aria-hidden="true" style={{ display: 'grid', placeItems: 'center',
                    fontSize: '2rem', color: 'var(--z-text-muted)' }}>“</span>}
              <div className={styles.rowText}>
                <strong title={q.text}>{q.text}</strong>
                <div className={styles.rowMeta}>
                  <PublishedChip isPublished={q.isPublished} />
                  {problem && <span className={`${styles.chip} ${styles.chipWait}`}>{problem}</span>}
                  {q.pinnedMonth && q.pinnedDay && (
                    <span className={`${styles.chip} ${styles.chipNew}`}>Pinned {pinnedLabel(q.pinnedMonth, q.pinnedDay)}</span>
                  )}
                  {q.series && !q.pinnedMonth && (
                    <span className={`${styles.chip} ${styles.chipNew}`}>{q.series} · Sundays</span>
                  )}
                  {q.media?.animationUrl && <span className={`${styles.chip} ${styles.chipNew}`}>Animated</span>}
                  <span>{KIND_LABELS[q.kind]}</span>
                  <span>{q.author}</span>
                </div>
              </div>
              <div className={styles.rowActions}>
                <OrderButtons index={index} count={items.length} onMove={list.move} name={q.author} />
                <Button variant="secondary" small busy={list.busyId === q.id} onClick={() => list.togglePublished(q)}>
                  {q.isPublished ? 'Hide' : 'Publish'}
                </Button>
                <Button variant="secondary" small onClick={() => setParams({ edit: q.id })}>Edit</Button>
                <ConfirmDelete question="Delete this quote?" onConfirm={() => list.deleteItem(q)} />
              </div>
            </li>
          )
        })}
      </ul>
    </>
  )
}

/** "Coming up": the quote the website shows on each of the next days, and why (the API's own rule). */
function ComingUp() {
  const preview = useQuery({
    queryKey: previewKey,
    queryFn: async ({ signal }) => unwrap(await getQuotePreview({ days: PREVIEW_DAYS }, signal)),
  })
  const days: QuotePreviewDayDto[] = preview.data ?? []

  return (
    <section className={styles.panel} aria-labelledby="coming-up">
      <div className={styles.panelHead}>
        <h2 id="coming-up">Coming up</h2>
        <p>What the website shows on each of the next {PREVIEW_DAYS} days, and why.</p>
      </div>
      <ListStatus isLoading={preview.isLoading} error={preview.error} isEmpty={false}
                  emptyText="" onRetry={() => preview.refetch()} />
      {days.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ textAlign: 'left', color: 'var(--z-text-muted)' }}>
                <th scope="col" style={{ padding: '6px 10px 6px 0', fontWeight: 600 }}>Day</th>
                <th scope="col" style={{ padding: '6px 10px', fontWeight: 600 }}>Why</th>
                <th scope="col" style={{ padding: '6px 0 6px 10px', fontWeight: 600 }}>Quote</th>
              </tr>
            </thead>
            <tbody>
              {days.map((d, i) => (
                <tr key={d.date} style={{ borderTop: '1px solid var(--z-border)' }}>
                  <td style={{ padding: '8px 10px 8px 0', whiteSpace: 'nowrap' }}>
                    {i === 0 ? <strong>Today</strong> : dayLabel(d.date)}
                  </td>
                  <td style={{ padding: '8px 10px', whiteSpace: 'nowrap' }}>
                    {d.reason
                      ? <span className={`${styles.chip} ${d.reason === 'Rotation' ? styles.chipDraft : styles.chipNew}`}>
                          {REASONS[d.reason]}
                        </span>
                      : <span className={`${styles.chip} ${styles.chipWait}`}>Nothing to show</span>}
                  </td>
                  <td style={{ padding: '8px 0 8px 10px' }}>
                    {d.text
                      ? <>{d.text} <span className={styles.muted}>— {d.author}</span></>
                      : <span className={styles.muted}>No published, source-checked quote.</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

/** The fields as typed (text boxes hold strings; empty means "none"). */
interface Form {
  kind: QuoteKind
  text: string
  author: string
  source: string
  language: string
  translation: string
  series: string
  story: string
  isSourceChecked: boolean
  pinnedMonth: string
  pinnedDay: string
  searchDescription: string
  /** Comma-separated, e.g. "Nature, Flight". */
  themes: string
}

const toForm = (q?: QuoteDto): Form => q
  ? { kind: q.kind, text: q.text, author: q.author, source: q.source ?? '', language: q.language ?? '',
      translation: q.translation ?? '', series: q.series ?? '', story: q.story ?? '',
      isSourceChecked: q.isSourceChecked, pinnedMonth: q.pinnedMonth ? String(q.pinnedMonth) : '',
      pinnedDay: q.pinnedDay ? String(q.pinnedDay) : '', searchDescription: q.searchDescription ?? '',
      themes: q.themes.join(', ') }
  : { kind: 'Quote', text: '', author: '', source: '', language: '', translation: '', series: '', story: '',
      isSourceChecked: false, pinnedMonth: '', pinnedDay: '', searchDescription: '', themes: '' }

/** Empty → null, otherwise trimmed. */
const orNull = (value: string) => value.trim() || null

const toFields = (f: Form): QuoteFields => ({
  kind: f.kind,
  text: f.text.trim(),
  author: f.author.trim(),
  source: orNull(f.source),
  language: orNull(f.language),
  translation: orNull(f.translation),
  series: orNull(f.series),
  story: orNull(f.story),
  isSourceChecked: f.isSourceChecked,
  pinnedMonth: f.pinnedMonth ? Number(f.pinnedMonth) : null,
  pinnedDay: f.pinnedMonth && f.pinnedDay ? Number(f.pinnedDay) : null,
  searchDescription: orNull(f.searchDescription),
  themes: parseThemes(f.themes),
})

function QuoteEditor({ quote, allThemes, onDone, onCreated }: {
  quote?: QuoteDto
  /** Every theme the quotes use, most used first. */
  allThemes: string[]
  onDone: () => void
  onCreated: (id: string) => void
}) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState<Form>(() => toForm(quote))
  const [publishNow, setPublishNow] = useState(true)
  const [picture, setPicture] = useState<File | null>(null)
  const [pictureAlt, setPictureAlt] = useState(quote?.media?.altText ?? '')
  const [animation, setAnimation] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)
  const [suggesting, setSuggesting] = useState(false)
  const [suggestNote, setSuggestNote] = useState<{ message: string; isError: boolean } | null>(null)

  // The editor opens above the list: bring it into view (Edit may have been clicked far down the page) and move
  // the focus to its heading, so screen readers announce "Edit quote"
  const heading = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    heading.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' })
    heading.current?.focus({ preventScroll: true })
  }, [])

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }))
  const err = (name: string) => error?.fieldError(name)

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: key })
    void queryClient.invalidateQueries({ queryKey: ['content'] })
  }

  const hasPicture = !!quote?.media || !!picture
  const kindIsProverb = form.kind === 'Proverb'

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setError(null)

    // 1. The words
    const fields = toFields(form)
    const saved = quote ? await updateQuote(quote.id, fields) : await createQuote({ ...fields, isPublished: publishNow })
    if (!saved.ok) {
      setBusy(false)
      setError(saved.error)
      return
    }
    const id = saved.value.id

    // 2. A new picture, then a new animation (the animation needs the picture first)
    const stop = (problem: ApiError) => {
      setBusy(false)
      setError(problem)
      refresh()
      if (!quote) onCreated(id)   // keep it open to try the upload again
    }
    if (picture) {
      const uploaded = await setQuotePicture(id, picture, pictureAlt.trim() || fields.text)
      if (!uploaded.ok) return stop(uploaded.error)
    }
    if (animation) {
      const uploaded = await setQuoteAnimation(id, animation)
      if (!uploaded.ok) return stop(uploaded.error)
    }

    setBusy(false)
    refresh()
    onDone()
  }

  const onRemovePicture = async () => {
    if (!quote) return
    const result = await removeQuotePicture(quote.id)
    if (!result.ok) setError(result.error)
    else refresh()
  }

  const onRemoveAnimation = async () => {
    if (!quote) return
    const result = await removeQuoteAnimation(quote.id)
    if (!result.ok) setError(result.error)
    else refresh()
  }

  // "Suggest with AI": drafts of the Google description and the themes, put into the form (nothing is saved)
  const onSuggest = async () => {
    setSuggestNote(null)
    if (!form.text.trim() || !form.author.trim()) {
      setSuggestNote({ message: 'Enter the words and who said it first.', isError: true })
      return
    }
    setSuggesting(true)
    const fields = toFields(form)
    const result = await suggestQuoteDetails({
      kind: fields.kind, text: fields.text, author: fields.author, source: fields.source, language: fields.language,
      translation: fields.translation, story: fields.story,
    })
    setSuggesting(false)
    if (!result.ok) {
      setSuggestNote({ message: result.error.displayMessage, isError: true })
      return
    }
    // The description is replaced; suggested themes are added to the ones already there
    const themes = parseThemes([form.themes, ...result.value.themes].join(',')).slice(0, MAX_THEMES)
    setForm((f) => ({ ...f, searchDescription: result.value.searchDescription, themes: themes.join(', ') }))
    setSuggestNote({ message: 'AI drafts added below. Read them, change anything, then save.', isError: false })
  }

  const chosenThemes = parseThemes(form.themes)
  const isChosen = (theme: string) => chosenThemes.some((t) => t.toLowerCase() === theme.toLowerCase())
  const addTheme = (theme: string) => {
    if (isChosen(theme) || chosenThemes.length >= MAX_THEMES) return
    set('themes', [...chosenThemes, theme].join(', '))
  }

  const fieldProblems = !!error && Object.keys(error.fieldErrors).length > 0
  const daysInMonth = form.pinnedMonth ? new Date(2024, Number(form.pinnedMonth), 0).getDate() : 31

  return (
    <form className={`${styles.panel} ${styles.editing} ${styles.form}`} onSubmit={onSubmit} noValidate>
      <div className={styles.panelHead}>
        <h2 ref={heading} tabIndex={-1} style={{ outline: 'none' }}>{quote ? 'Edit quote' : 'New quote'}</h2>
      </div>

      <div className={styles.grid2}>
        <Select label="Kind" value={form.kind} options={KINDS} onChange={(e) => set('kind', e.target.value as QuoteKind)}
                error={err('kind')} />
        <Field label="Who said it" value={form.author} maxLength={120} onChange={(e) => set('author', e.target.value)}
               error={err('author')}
               placeholder={form.kind === 'Proverb' ? 'Annang proverb' : form.kind === 'OwnSaying' ? 'Enobong Adahada' : 'Ada Lovelace'} />
      </div>

      <TextArea label="The words" rows={3} value={form.text} maxLength={500} onChange={(e) => set('text', e.target.value)}
                error={err('text')} hint="In the original language. No quotation marks: the website adds them." />

      <Field label="Source" optional value={form.source} maxLength={300} onChange={(e) => set('source', e.target.value)}
             error={err('source')} placeholder="Notes on the Analytical Engine (1843)"
             hint="The book, paper or speech, with its year." />

      <div className={styles.grid2}>
        <Field label="Language" optional={!form.translation.trim()} value={form.language} maxLength={60}
               onChange={(e) => set('language', e.target.value)} error={err('language')}
               placeholder={kindIsProverb ? 'Annang' : ''} hint="Only when it isn't English." />
        <TextArea label="English translation" optional rows={2} value={form.translation} maxLength={500}
                  onChange={(e) => set('translation', e.target.value)} error={err('translation')} />
      </div>

      <div className={styles.grid2}>
        <Field label="Series" optional value={form.series} maxLength={60} onChange={(e) => set('series', e.target.value)}
               error={err('series')} placeholder="Nature first" hint="Series quotes are shown on Sundays." />
        <TextArea label="The story" optional rows={2} value={form.story} maxLength={300}
                  onChange={(e) => set('story', e.target.value)} error={err('story')}
                  hint="One true line shown under the quote." />
      </div>

      <div className={styles.grid2}>
        <Select label="Pin to a day" optional value={form.pinnedMonth}
                options={[{ value: '', label: 'Not pinned' }, ...MONTHS.map((m, i) => ({ value: String(i + 1), label: m }))]}
                onChange={(e) => set('pinnedMonth', e.target.value)} error={err('pinnedMonth')}
                hint="Shown on this day every year, and on no other day." />
        {form.pinnedMonth && (
          <Select label="Day" value={form.pinnedDay}
                  options={[{ value: '', label: 'Choose…' },
                    ...Array.from({ length: daysInMonth }, (_, i) => ({ value: String(i + 1), label: String(i + 1) }))]}
                  onChange={(e) => set('pinnedDay', e.target.value)} error={err('pinnedDay')} />
        )}
      </div>

      <Toggle label="Source checked" checked={form.isSourceChecked} onChange={(v) => set('isSourceChecked', v)}
              hint="The wording and who said it are checked (e.g. on Wikiquote). Unchecked quotes are never shown." />

      {/* For Google and the quote pages: the description and themes, with the AI helper's drafts */}
      <fieldset className={styles.form} style={{ margin: 0, padding: 0, border: 0, gap: 14 }}>
        <legend style={{ display: 'contents' }}>
          <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>For Google and related quotes</span>
        </legend>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
          <Button variant="secondary" small busy={suggesting} busyText="Asking the AI…" onClick={onSuggest}>
            Suggest with AI
          </Button>
          <span className={styles.muted} style={{ fontSize: '0.85rem' }}>
            Drafts the description and themes from the fields above. Nothing is saved until you save.
          </span>
        </div>
        {suggestNote && <StatusBanner message={suggestNote.message} isError={suggestNote.isError} />}

        <TextArea label="Google description" optional rows={2} value={form.searchDescription}
                  maxLength={SEARCH_DESCRIPTION_MAX} onChange={(e) => set('searchDescription', e.target.value)}
                  error={err('searchDescription')}
                  hint="Shown under the quote's page in Google and in link previews. Empty: made from the words." />

        <Field label="Themes" optional value={form.themes} onChange={(e) => set('themes', e.target.value)}
               error={err('themes')} placeholder="Nature, Flight"
               hint={`Up to ${MAX_THEMES}, separated by commas. Quotes sharing a theme are shown as related.`} />
        {allThemes.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }} aria-label="Themes other quotes use">
            {allThemes.map((theme) => (
              <Button key={theme} variant="plain" small onClick={() => addTheme(theme)}
                      disabled={isChosen(theme) || chosenThemes.length >= MAX_THEMES}>
                + {theme}
              </Button>
            ))}
          </div>
        )}
      </fieldset>

      <div className={styles.grid2} style={{ alignItems: 'start' }}>
        <div style={{ display: 'grid', gap: 10 }}>
          <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>
            Picture <span className={styles.muted} style={{ fontWeight: 400 }}>(optional)</span>
          </span>
          {quote?.media && !picture && (
            <>
              <ApiImage src={quote.media.pictureUrl} alt={quote.media.altText} className={styles.preview} />
              <div><ConfirmDelete label="Remove picture" question="Remove the picture (and its animation)?"
                                  onConfirm={onRemovePicture} /></div>
            </>
          )}
          <FilePicker file={picture} onChange={setPicture} accept="image/*" maxBytes={PICTURE_MAX_BYTES}
                      label={quote?.media ? 'Replace the picture' : 'Choose a picture'}
                      hint="JPEG, PNG or WebP up to 15 MB. Also what visitors who turn off motion see." />
          {hasPicture && (
            <Field label="Picture description" value={pictureAlt} maxLength={300}
                   onChange={(e) => setPictureAlt(e.target.value)} error={err('altText')}
                   hint={quote?.media && !picture
                     ? 'To change the description, choose the picture again.'
                     : 'For screen readers: tell the story the picture shows.'}
                   disabled={!!quote?.media && !picture} />
          )}
        </div>

        <div style={{ display: 'grid', gap: 10 }}>
          <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>
            Animation <span className={styles.muted} style={{ fontWeight: 400 }}>(optional, MP4)</span>
          </span>
          {quote?.media?.animationUrl && !animation && (
            <>
              <video src={fileUrl(quote.media.animationUrl)} className={styles.preview} muted loop playsInline controls
                     aria-label={quote.media.altText} />
              <div><ConfirmDelete label="Remove animation" question="Remove the animation?"
                                  onConfirm={onRemoveAnimation} /></div>
            </>
          )}
          {hasPicture
            ? <FilePicker file={animation} onChange={setAnimation} accept="video/mp4,.mp4" maxBytes={ANIMATION_MAX_BYTES}
                          label={quote?.media?.animationUrl ? 'Replace the animation' : 'Choose an MP4'}
                          hint="Up to 8 MB. Plays silently on a loop, with a Pause button." />
            : <p className={styles.muted} style={{ margin: 0, fontSize: '0.88rem' }}>
                Add a picture first: it's what visitors who turn off motion see instead.
              </p>}
        </div>
      </div>

      {!quote && <Toggle label="Put it on the website now" checked={publishNow} onChange={setPublishNow}
                         hint="It's only shown once its source is checked." />}

      {error && <StatusBanner message={fieldProblems ? 'Please check the fields marked in red.' : error.displayMessage} isError />}

      <div className={styles.actionsEnd}>
        <Button variant="plain" onClick={onDone}>Cancel</Button>
        <Button type="submit" busy={busy} busyText="Saving…">{quote ? 'Save changes' : 'Add quote'}</Button>
      </div>
    </form>
  )
}
