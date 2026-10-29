import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useId, useMemo, useState, type FormEvent } from 'react'
import type { ApiError } from '../../../api/apiError'
import type { ProjectImageFields } from '../../../api/contracts/commands'
import type { ProjectDto, ProjectImageDto } from '../../../api/contracts/dtos'
import type { ProjectImageKind } from '../../../api/contracts/enums'
import {
  addProjectImage, deleteProjectImage, reorderProjectImages, replaceProjectImageFile, updateProjectImage,
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
  const [newFile, setNewFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)
  const [problem, setProblem] = useState<string | null>(null)
  const fileInputId = useId()

  // A preview of the newly chosen picture (until it is saved or undone)
  const preview = useMemo(() => (newFile ? URL.createObjectURL(newFile) : null), [newFile])
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview) }, [preview])

  const pick = (file: File | undefined) => {
    if (!file) return
    if (file.size > MAX_BYTES) {
      setProblem('This picture is too big. The maximum is 15 MB.')
      return
    }
    setProblem(null)
    setNewFile(file)
  }

  const cancel = () => {
    setEditing(false)
    setNewFile(null)
    setProblem(null)
    setError(null)
    setFields({ altText: image.altText, label: image.label, kind: image.kind })
  }

  const save = async () => {
    setBusy(true)
    setError(null)
    const body = { ...fields, label: fields.label?.trim() || null }

    // 1. The words
    const result = await updateProjectImage(projectId, image.id, body)
    if (!result.ok) {
      setBusy(false)
      setError(result.error)
      return
    }
    let saved: ProjectImageDto = { ...image, ...body }

    // 2. The new picture, if one was chosen (it keeps its place, description, caption and kind)
    if (newFile) {
      const replaced = await replaceProjectImageFile(projectId, image.id, newFile)
      if (!replaced.ok) {
        setBusy(false)
        onSaved(saved)
        setError(replaced.error)
        return
      }
      saved = { ...replaced.value, ...body }
    }

    setBusy(false)
    onSaved(saved)
    setNewFile(null)
    setEditing(false)
  }

  return (
    <article className={styles.imageCard}>
      {editing ? (
        <div className={styles.picturePick}>
          {preview
            ? <img src={preview} alt="The new picture (not saved yet)" />
            : <ApiImage src={image.thumbnailUrl ?? image.url} alt={image.altText} />}
          {preview && <span className={styles.pictureNew}>New · not saved yet</span>}
          <div className={styles.picturePickBar}>
            <label htmlFor={fileInputId} className={styles.pictureButton}>
              <input id={fileInputId} type="file" accept="image/*"
                     onChange={(e) => { pick(e.target.files?.[0]); e.target.value = '' }} />
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                   aria-hidden="true"><path d="M12 16V4m0 0-4 4m4-4 4 4M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" /></svg>
              {preview ? 'Choose another' : 'Change picture'}
            </label>
            {preview && (
              <button type="button" className={styles.pictureButton} onClick={() => setNewFile(null)}>Undo</button>
            )}
          </div>
        </div>
      ) : (
        <ApiImage src={image.thumbnailUrl ?? image.url} alt={image.altText} />
      )}
      {editing ? (
        <div className={styles.form} style={{ gap: 12 }}>
          <Field label="Description" value={fields.altText} maxLength={300}
                 onChange={(e) => setFields({ ...fields, altText: e.target.value })} error={error?.fieldError('altText')} />
          <Field label="Caption" optional value={fields.label ?? ''} maxLength={60}
                 onChange={(e) => setFields({ ...fields, label: e.target.value })} error={error?.fieldError('label')} />
          <Select label="Used as" value={fields.kind} options={projectImageKinds}
                  onChange={(e) => setFields({ ...fields, kind: e.target.value as ProjectImageKind })} />
          <StatusBanner message={problem} isError />
          {error && !Object.keys(error.fieldErrors).length && <StatusBanner message={error.displayMessage} isError />}
          <div className={styles.actions}>
            <Button small busy={busy} busyText={newFile ? 'Uploading…' : 'Saving…'} onClick={save}>Save</Button>
            <Button small variant="plain" onClick={cancel}>Cancel</Button>
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
