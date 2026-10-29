import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router'
import { ApiError, unwrap } from '../../../api/apiError'
import type { DocumentFields } from '../../../api/contracts/commands'
import type { DocumentDto } from '../../../api/contracts/dtos'
import type { DocumentCategory } from '../../../api/contracts/enums'
import {
  getDocumentLink, getDocuments, remove, replaceDocumentFile, updateDocument, uploadDocument,
} from '../../../api/services/adminService'
import { Button } from '../../../components/ui/Button'
import { Field, Select, TextArea } from '../../../components/ui/Field'
import { ListStatus } from '../../../components/ui/ListStatus'
import { StatusBanner } from '../../../components/ui/StatusBanner'
import { dateText, documentCategories, fileSizeText, labelOf } from '../../../components/ui/labels'
import styles from '../Admin.module.css'
import { AdminHead, ConfirmDelete, FilePicker } from '../AdminParts'

const ACCEPT = '.pdf,.docx,.jpg,.jpeg,.png,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png'
const MAX_BYTES = 20 * 1024 * 1024

/** "PDF", "Word", "Picture". */
const kindOf = (d: DocumentDto) =>
  d.contentType === 'application/pdf' ? 'PDF' : d.contentType.startsWith('image/') ? 'Picture' : 'Word'

/**
 * Private documents (CV, certificates, transcripts…). They are kept outside the website's public files and only open
 * through a link that works for a few minutes, made when you click Open.
 */
export default function AdminDocumentsPage() {
  const queryClient = useQueryClient()
  const [params, setParams] = useSearchParams()
  const category = (params.get('category') ?? undefined) as DocumentCategory | undefined
  const editId = params.get('edit')
  const showUpload = params.get('new') === '1'

  const documents = useQuery({
    queryKey: ['admin', 'documents', category ?? 'all'],
    queryFn: async ({ signal }) => unwrap(await getDocuments(category, signal)),
  })
  const items = documents.data ?? []
  const [error, setError] = useState<ApiError | null>(null)
  const [opening, setOpening] = useState<string | null>(null)

  const setParam = (name: string, value?: string) => {
    const next = new URLSearchParams(params)
    for (const n of ['edit', 'new']) next.delete(n)
    if (value) next.set(name, value)
    else next.delete(name)
    setParams(next, { replace: name !== 'category' })
  }

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ['admin', 'documents'] })
    void queryClient.invalidateQueries({ queryKey: ['admin', 'overview'] })
  }

  /** Asks the API for a short-lived link and opens it in a new tab. */
  const openDocument = async (doc: DocumentDto) => {
    // Open the tab now (browsers block tabs opened after waiting), then send it to the link
    const tab = window.open('', '_blank')
    setOpening(doc.id)
    setError(null)
    const link = await getDocumentLink(doc.id)
    setOpening(null)
    if (!link.ok) {
      tab?.close()
      setError(link.error)
      return
    }
    if (tab) tab.location.replace(link.value.url)
    else window.location.assign(link.value.url)
  }

  const onDelete = async (doc: DocumentDto) => {
    setError(null)
    const result = await remove('documents', doc.id)
    if (!result.ok) setError(result.error)
    else refresh()
  }

  return (
    <>
      <AdminHead eyebrow="Private" title="Documents"
                 sub="Only you can see these. Each opens through a link that stops working after a few minutes.">
        {!showUpload && <Button onClick={() => setParam('new', '1')}>Upload a document</Button>}
      </AdminHead>

      {showUpload && <UploadForm onDone={() => setParam('new')} onUploaded={refresh} />}

      <div className={styles.tabs} role="tablist" aria-label="Category">
        <button type="button" role="tab" aria-selected={!category}
                className={`${styles.tab} ${!category ? styles.tabOn : ''}`} onClick={() => setParam('category')}>All</button>
        {documentCategories.map((c) => (
          <button key={c.value} type="button" role="tab" aria-selected={category === c.value}
                  className={`${styles.tab} ${category === c.value ? styles.tabOn : ''}`}
                  onClick={() => setParam('category', c.value)}>{c.label}</button>
        ))}
      </div>

      <StatusBanner message={error?.displayMessage} isError />
      <ListStatus isLoading={documents.isLoading} error={documents.error} isEmpty={items.length === 0}
                  emptyText={category ? 'No documents in this category.' : 'No documents yet. Upload your first one.'}
                  onRetry={() => documents.refetch()} />

      <ul className={styles.rows}>
        {items.map((doc) => (
          <li key={doc.id}>
            {editId === doc.id
              ? <EditForm doc={doc} onDone={() => setParam('edit')} onSaved={refresh} />
              : (
                <div className={styles.row} style={{ gridTemplateColumns: 'auto minmax(0, 1fr) auto' }}>
                  <span className={styles.chip + ' ' + styles.chipNew} style={{ minWidth: 64, justifyContent: 'center' }}>
                    {kindOf(doc)}
                  </span>
                  <div className={styles.rowText}>
                    <strong title={doc.title}>{doc.title}</strong>
                    <div className={styles.rowMeta}>
                      <span>{labelOf(documentCategories, doc.category)}</span>
                      <span>{fileSizeText(doc.fileSizeBytes)}</span>
                      <span>Added {dateText(doc.uploadedAt)}</span>
                      <span title={doc.fileName}>{doc.fileName}</span>
                    </div>
                    {doc.notes && <span className={styles.muted} style={{ fontSize: '0.85rem' }}>{doc.notes}</span>}
                  </div>
                  <div className={styles.rowActions}>
                    <Button small busy={opening === doc.id} busyText="Opening…" onClick={() => openDocument(doc)}>Open</Button>
                    <Button small variant="secondary" onClick={() => setParam('edit', doc.id)}>Edit</Button>
                    <ConfirmDelete question={`Delete "${doc.title}" for good?`} onConfirm={() => onDelete(doc)} />
                  </div>
                </div>
              )}
          </li>
        ))}
      </ul>
    </>
  )
}

function UploadForm({ onDone, onUploaded }: { onDone: () => void; onUploaded: () => void }) {
  const [file, setFile] = useState<File | null>(null)
  const [fields, setFields] = useState<DocumentFields>({ title: '', category: 'Cv', notes: '' })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)

  const pick = (picked: File | null) => {
    setFile(picked)
    // Suggest a title from the file name ("Adahada-CV-2026.pdf" → "Adahada CV 2026")
    if (picked && !fields.title) {
      setFields((f) => ({ ...f, title: picked.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').slice(0, 150) }))
    }
  }

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!file) return
    setBusy(true)
    setError(null)
    const result = await uploadDocument(file, { ...fields, notes: fields.notes?.trim() || null })
    setBusy(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    onUploaded()
    onDone()
  }

  return (
    <form className={`${styles.panel} ${styles.editing} ${styles.form}`} onSubmit={onSubmit} noValidate>
      <div className={styles.panelHead}><h2>Upload a document</h2></div>
      <FilePicker file={file} onChange={pick} accept={ACCEPT} label="Choose a file" maxBytes={MAX_BYTES}
                  hint="PDF, Word (.docx), JPEG or PNG, up to 20 MB." />
      <div className={styles.grid2}>
        <Field label="Title" value={fields.title} maxLength={150} error={error?.fieldError('title')}
               onChange={(e) => setFields({ ...fields, title: e.target.value })} />
        <Select label="Category" value={fields.category} options={documentCategories}
                onChange={(e) => setFields({ ...fields, category: e.target.value as DocumentCategory })} />
      </div>
      <TextArea label="Notes" optional rows={2} maxLength={1000} value={fields.notes ?? ''}
                onChange={(e) => setFields({ ...fields, notes: e.target.value })} />
      {error && !error.fieldError('title') && <StatusBanner message={error.displayMessage} isError />}
      <div className={styles.actionsEnd}>
        <Button variant="plain" onClick={onDone}>Cancel</Button>
        <Button type="submit" busy={busy} busyText="Uploading…" disabled={!file || !fields.title.trim()}>Upload</Button>
      </div>
    </form>
  )
}

function EditForm({ doc, onDone, onSaved }: { doc: DocumentDto; onDone: () => void; onSaved: () => void }) {
  const [fields, setFields] = useState<DocumentFields>({ title: doc.title, category: doc.category, notes: doc.notes ?? '' })
  const [file, setFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setError(null)
    const saved = await updateDocument(doc.id, { ...fields, notes: fields.notes?.trim() || null })
    if (saved.ok && file) {
      const replaced = await replaceDocumentFile(doc.id, file)
      if (!replaced.ok) {
        setBusy(false)
        setError(replaced.error)
        onSaved()
        return
      }
    }
    setBusy(false)
    if (!saved.ok) {
      setError(saved.error)
      return
    }
    onSaved()
    onDone()
  }

  return (
    <form className={`${styles.panel} ${styles.editing} ${styles.form}`} onSubmit={onSubmit} noValidate
          style={{ marginBottom: 0 }}>
      <div className={styles.panelHead}><h2>Edit "{doc.title}"</h2></div>
      <div className={styles.grid2}>
        <Field label="Title" value={fields.title} maxLength={150} error={error?.fieldError('title')}
               onChange={(e) => setFields({ ...fields, title: e.target.value })} />
        <Select label="Category" value={fields.category} options={documentCategories}
                onChange={(e) => setFields({ ...fields, category: e.target.value as DocumentCategory })} />
      </div>
      <TextArea label="Notes" optional rows={2} maxLength={1000} value={fields.notes ?? ''}
                onChange={(e) => setFields({ ...fields, notes: e.target.value })} />
      <FilePicker file={file} onChange={setFile} accept={ACCEPT} label="Replace the file" maxBytes={MAX_BYTES}
                  hint={`Now: ${doc.fileName} (${fileSizeText(doc.fileSizeBytes)}). Leave empty to keep it.`} />
      {error && !error.fieldError('title') && <StatusBanner message={error.displayMessage} isError />}
      <div className={styles.actionsEnd}>
        <Button variant="plain" onClick={onDone}>Cancel</Button>
        <Button type="submit" busy={busy} busyText="Saving…">Save changes</Button>
      </div>
    </form>
  )
}
