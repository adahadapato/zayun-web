import { useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { ApiError } from '../../../api/apiError'
import { describeSiteImage, removeSiteImage, setSiteImage } from '../../../api/services/adminService'
import { ApiImage } from '../../../components/ui/ApiImage'
import { Button } from '../../../components/ui/Button'
import { Field } from '../../../components/ui/Field'
import { ListStatus } from '../../../components/ui/ListStatus'
import { StatusBanner } from '../../../components/ui/StatusBanner'
import { useSiteImages } from '../../../state/contentQueries'
import styles from '../Admin.module.css'
import { ConfirmDelete, FilePicker } from '../AdminParts'
import { useSavedFlag } from '../useSavedFlag'

const MAX_BYTES = 15 * 1024 * 1024
const DEFAULT_ALT = 'Enobong Adahada'

/** Account → Your photo (shown on the About page): upload, replace, describe or remove it any time. */
export function PhotoSection() {
  const queryClient = useQueryClient()
  const images = useSiteImages()
  const photo = images.data?.find((i) => i.slot === 'OwnerPhoto')

  const [file, setFile] = useState<File | null>(null)
  const [alt, setAlt] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)
  const [saved, flagSaved] = useSavedFlag()

  const altText = alt ?? photo?.altText ?? DEFAULT_ALT

  const refresh = () => void queryClient.invalidateQueries({ queryKey: ['content', 'site-images'] })

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setError(null)
    const result = file
      ? await setSiteImage('OwnerPhoto', file, altText.trim() || DEFAULT_ALT)
      : await describeSiteImage('OwnerPhoto', altText.trim() || DEFAULT_ALT)
    setBusy(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    setFile(null)
    setAlt(null)
    flagSaved()
    refresh()
  }

  const onRemove = async () => {
    setError(null)
    const result = await removeSiteImage('OwnerPhoto')
    if (!result.ok) setError(result.error)
    else refresh()
  }

  return (
    <section className={styles.panel} aria-labelledby="photo">
      <div className={styles.panelHead}>
        <div>
          <h2 id="photo">Your photo</h2>
          <p>Shown beside your introduction on the About page. Change or remove it whenever you like.</p>
        </div>
      </div>

      <ListStatus isLoading={images.isLoading} error={images.error} isEmpty={false} emptyText=""
                  onRetry={() => images.refetch()} placeholders={1} />

      {images.data && (
        <form className={styles.form} onSubmit={onSubmit} noValidate>
          <div className={styles.grid2} style={{ alignItems: 'start' }}>
            <div style={{ display: 'grid', gap: 12 }}>
              <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>{photo ? 'Now on the website' : 'No photo yet'}</span>
              {photo && !file && (
                <ApiImage src={photo.url} alt={photo.altText} className={styles.ownerPhoto}
                          width={photo.width} height={photo.height} />
              )}
              <FilePicker file={file} onChange={setFile} accept="image/*" maxBytes={MAX_BYTES}
                          label={photo ? 'Choose a new photo' : 'Choose a photo'}
                          hint="JPEG, PNG, WebP or HEIC up to 15 MB. A portrait (taller than wide) looks best." />
            </div>

            <div style={{ display: 'grid', gap: 16 }}>
              <Field label="Description" value={altText} maxLength={300} onChange={(e) => setAlt(e.target.value)}
                     error={error?.fieldError('altText')}
                     hint="For screen readers and search engines, e.g. 'Enobong Adahada'." />
              {error && !error.fieldError('altText') && <StatusBanner message={error.displayMessage} isError />}
              {saved && <StatusBanner message="Saved. It's on the About page now." />}
              <div className={styles.actions}>
                <Button type="submit" busy={busy} busyText={file ? 'Uploading…' : 'Saving…'}
                        disabled={!file && (!photo || altText === photo.altText)}>
                  {file ? (photo ? 'Replace photo' : 'Upload photo') : 'Save description'}
                </Button>
                {file && <Button variant="plain" onClick={() => setFile(null)}>Cancel</Button>}
                {photo && !file && (
                  <span style={{ marginLeft: 'auto' }}>
                    <ConfirmDelete label="Remove photo" question="Remove your photo from the website?" onConfirm={onRemove} />
                  </span>
                )}
              </div>
            </div>
          </div>
        </form>
      )}
    </section>
  )
}
