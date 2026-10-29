import { useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import type { ApiError } from '../../../api/apiError'
import type { ProjectImageFields } from '../../../api/contracts/commands'
import type { ProjectDto, ProjectImageDto } from '../../../api/contracts/dtos'
import type { ProjectImageKind } from '../../../api/contracts/enums'
import {
  addProjectImage, deleteProjectImage, reorderProjectImages, updateProjectImage,
} from '../../../api/services/adminService'
import { ApiImage } from '../../../components/ui/ApiImage'
import { Button } from '../../../components/ui/Button'
import { Field, Select } from '../../../components/ui/Field'
import { StatusBanner } from '../../../components/ui/StatusBanner'
import { labelOf, projectImageKinds } from '../../../components/ui/labels'
import styles from '../Admin.module.css'
import { ConfirmDelete, FilePicker, OrderButtons } from '../AdminParts'
import { projectsKey } from './projectKeys'

const MAX_IMAGES = 12
const MAX_BYTES = 15 * 1024 * 1024

/** A project's pictures: add (resized to WebP by the API), describe, put in order, delete. */
export function ProjectImages({ project }: { project: ProjectDto }) {
  const queryClient = useQueryClient()
  const [error, setError] = useState<ApiError | null>(null)
  const images = project.images

  /** Puts the changed pictures into the cached project, and marks the lists out of date. */
  const writeImages = (next: ProjectImageDto[]) => {
    queryClient.setQueryData<ProjectDto>([...projectsKey, project.id], (p) => (p ? { ...p, images: next } : p))
    void queryClient.invalidateQueries({ queryKey: projectsKey, exact: true })
    void queryClient.invalidateQueries({ queryKey: ['content'] })
  }

  const move = async (from: number, to: number) => {
    const next = [...images]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    writeImages(next)
    const result = await reorderProjectImages(project.id, next.map((i) => i.id))
    if (!result.ok) {
      setError(result.error)
      writeImages(images)
    }
  }

  const onDelete = async (image: ProjectImageDto) => {
    setError(null)
    const result = await deleteProjectImage(project.id, image.id)
    if (!result.ok) setError(result.error)
    else writeImages(images.filter((i) => i.id !== image.id))
  }

  return (
    <section className={styles.panel} aria-labelledby="pictures">
      <div className={styles.panelHead}>
        <div>
          <h2 id="pictures">Pictures <small className={styles.muted}>({images.length} of {MAX_IMAGES})</small></h2>
          <p>The card shows the main picture, with the second picture under it. Gallery pictures show as a row of phone screens instead.</p>
        </div>
      </div>

      <StatusBanner message={error?.displayMessage} isError />

      {images.length > 0 && (
        <div className={styles.images}>
          {images.map((image, index) => (
            <ImageCard key={image.id} image={image} index={index} count={images.length} onMove={move}
                       onDelete={() => onDelete(image)} projectId={project.id}
                       onSaved={(saved) => writeImages(images.map((i) => (i.id === saved.id ? saved : i)))} />
          ))}
        </div>
      )}

      {images.length < MAX_IMAGES
        ? <AddImage projectId={project.id} isFirst={images.length === 0}
                    onAdded={(added) => writeImages([...images, added])} />
        : <p className={styles.muted}>This project has the most pictures allowed. Delete one to add another.</p>}
    </section>
  )
}

function ImageCard({ image, index, count, onMove, onDelete, onSaved, projectId }: {
  image: ProjectImageDto
  index: number
  count: number
  onMove: (from: number, to: number) => void
  onDelete: () => void
  onSaved: (image: ProjectImageDto) => void
  projectId: string
}) {
  const [editing, setEditing] = useState(false)
  const [fields, setFields] = useState<ProjectImageFields>({ altText: image.altText, label: image.label, kind: image.kind })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)

  const save = async () => {
    setBusy(true)
    setError(null)
    const body = { ...fields, label: fields.label?.trim() || null }
    const result = await updateProjectImage(projectId, image.id, body)
    setBusy(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    onSaved({ ...image, ...body })
    setEditing(false)
  }

  return (
    <article className={styles.imageCard}>
      <ApiImage src={image.thumbnailUrl ?? image.url} alt={image.altText} />
      {editing ? (
        <div className={styles.form} style={{ gap: 12 }}>
          <Field label="Description" value={fields.altText} maxLength={300}
                 onChange={(e) => setFields({ ...fields, altText: e.target.value })} error={error?.fieldError('altText')} />
          <Field label="Caption" optional value={fields.label ?? ''} maxLength={60}
                 onChange={(e) => setFields({ ...fields, label: e.target.value })} error={error?.fieldError('label')} />
          <Select label="Used as" value={fields.kind} options={projectImageKinds}
                  onChange={(e) => setFields({ ...fields, kind: e.target.value as ProjectImageKind })} />
          {error && !Object.keys(error.fieldErrors).length && <StatusBanner message={error.displayMessage} isError />}
          <div className={styles.actions}>
            <Button small busy={busy} busyText="Saving…" onClick={save}>Save</Button>
            <Button small variant="plain" onClick={() => setEditing(false)}>Cancel</Button>
          </div>
        </div>
      ) : (
        <>
          <div className={styles.rowText}>
            <div className={styles.rowMeta}>
              <span className={`${styles.chip} ${image.kind === 'Gallery' ? styles.chipDraft : styles.chipNew}`}>
                {labelOf(projectImageKinds, image.kind)}
              </span>
              {image.label && <span>{image.label}</span>}
            </div>
            <span className={styles.muted} style={{ fontSize: '0.84rem' }}>{image.altText}</span>
          </div>
          <div className={styles.imageCardBar}>
            <OrderButtons index={index} count={count} onMove={onMove} name={`picture ${index + 1}`} />
            <div className={styles.actions}>
              <Button small variant="secondary" onClick={() => setEditing(true)}>Edit</Button>
              <ConfirmDelete question="Delete this picture?" onConfirm={onDelete} />
            </div>
          </div>
        </>
      )}
    </article>
  )
}

function AddImage({ projectId, isFirst, onAdded }: {
  projectId: string
  isFirst: boolean
  onAdded: (image: ProjectImageDto) => void
}) {
  const [file, setFile] = useState<File | null>(null)
  const [fields, setFields] = useState<ProjectImageFields>({ altText: '', label: '', kind: isFirst ? 'Primary' : 'Gallery' })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!file) return
    setBusy(true)
    setError(null)
    const result = await addProjectImage(projectId, file, { ...fields, label: fields.label?.trim() || null })
    setBusy(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    onAdded(result.value)
    setFile(null)
    setFields({ altText: '', label: '', kind: 'Gallery' })
  }

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate
          style={{ paddingTop: 18, borderTop: '1px solid var(--z-border)' }}>
      <h3 style={{ margin: 0, fontSize: '1rem' }}>Add a picture</h3>
      <FilePicker file={file} onChange={setFile} accept="image/*" label="Choose a picture" maxBytes={MAX_BYTES}
                  hint="JPEG, PNG or WebP up to 15 MB. It is resized and saved as WebP." />
      {file && (
        <>
          <div className={styles.grid3}>
            <Field className={styles.span2} label="Description" value={fields.altText} maxLength={300}
                   onChange={(e) => setFields({ ...fields, altText: e.target.value })}
                   error={error?.fieldError('altText')} hint="For screen readers: what the picture shows." />
            <Select label="Used as" value={fields.kind} options={projectImageKinds}
                    onChange={(e) => setFields({ ...fields, kind: e.target.value as ProjectImageKind })} />
          </div>
          <Field label="Caption" optional value={fields.label ?? ''} maxLength={60}
                 onChange={(e) => setFields({ ...fields, label: e.target.value })} error={error?.fieldError('label')} />
          {error && !error.fieldError('altText') && !error.fieldError('label') &&
            <StatusBanner message={error.displayMessage} isError />}
          <div className={styles.actions}>
            <Button type="submit" busy={busy} busyText="Uploading…" disabled={!fields.altText.trim()}>
              Upload picture
            </Button>
            <Button variant="plain" onClick={() => setFile(null)}>Cancel</Button>
          </div>
        </>
      )}
    </form>
  )
}
