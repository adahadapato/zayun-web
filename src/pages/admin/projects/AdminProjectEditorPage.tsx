import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router'
import { ApiError, unwrap } from '../../../api/apiError'
import type { ProjectFields } from '../../../api/contracts/commands'
import type { ProjectDto } from '../../../api/contracts/dtos'
import type { ProjectCategory } from '../../../api/contracts/enums'
import { createProject, getAdminProject, updateProject } from '../../../api/services/adminService'
import { Button } from '../../../components/ui/Button'
import { Field, Select, TextArea, Toggle } from '../../../components/ui/Field'
import { ListStatus } from '../../../components/ui/ListStatus'
import { PageLoading } from '../../../components/ui/PageLoading'
import { StatusBanner } from '../../../components/ui/StatusBanner'
import { TagInput } from '../../../components/ui/TagInput'
import { projectCategories } from '../../../components/ui/labels'
import styles from '../Admin.module.css'
import { AdminHead, PublishedChip } from '../AdminParts'
import { useSavedFlag } from '../useSavedFlag'
import { ProjectImages } from './ProjectImages'
import { projectsKey } from './projectKeys'

const empty: ProjectFields = {
  title: '', slug: '', subtitle: '', description: '', category: 'Featured', label: '', visualLabel: '',
  githubUrl: '', liveUrl: '', isPrivateRepo: false, tags: [],
}

const fieldsOf = (p: ProjectDto): ProjectFields => ({
  title: p.title, slug: p.slug, subtitle: p.subtitle, description: p.description, category: p.category,
  label: p.label, visualLabel: p.visualLabel ?? '', githubUrl: p.githubUrl ?? '', liveUrl: p.liveUrl ?? '',
  isPrivateRepo: p.isPrivateRepo, tags: p.tags,
})

/** Empty optional text goes to the API as null. */
const clean = (f: ProjectFields): ProjectFields => ({
  ...f,
  slug: f.slug?.trim() || null,
  visualLabel: f.visualLabel?.trim() || null,
  githubUrl: f.githubUrl?.trim() || null,
  liveUrl: f.liveUrl?.trim() || null,
})

/**
 * A project: /admin/projects/new adds one (then opens it here to add pictures), /admin/projects/{id} edits one.
 */
export default function AdminProjectEditorPage() {
  const { projectId } = useParams()
  const isNew = !projectId
  const project = useQuery({
    queryKey: [...projectsKey, projectId],
    queryFn: async ({ signal }) => unwrap(await getAdminProject(projectId!, signal)),
    enabled: !isNew,
  })

  if (isNew) return <ProjectEditor key="new" />
  if (project.isLoading) return <PageLoading />
  if (!project.data) {
    return (
      <>
        <AdminHead title="Project" back={{ to: '/admin/projects', label: 'All projects' }} />
        <ListStatus isLoading={false} error={project.error} isEmpty emptyText="This project wasn't found."
                    onRetry={() => project.refetch()} />
      </>
    )
  }
  return <ProjectEditor key={project.data.id} project={project.data} />
}

function ProjectEditor({ project }: { project?: ProjectDto }) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [fields, setFields] = useState<ProjectFields>(project ? fieldsOf(project) : empty)
  const [publishNow, setPublishNow] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)
  const [saved, flagSaved] = useSavedFlag()

  const set = <K extends keyof ProjectFields>(key: K, value: ProjectFields[K]) =>
    setFields((f) => ({ ...f, [key]: value }))
  const err = (name: string) => error?.fieldError(name)

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setError(null)
    const result = project
      ? await updateProject(project.id, clean(fields))
      : await createProject({ ...clean(fields), isPublished: publishNow })
    setBusy(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    queryClient.setQueryData([...projectsKey, result.value.id], result.value)
    void queryClient.invalidateQueries({ queryKey: projectsKey, exact: true })
    void queryClient.invalidateQueries({ queryKey: ['admin', 'overview'] })
    void queryClient.invalidateQueries({ queryKey: ['content'] })
    if (project) flagSaved()
    else navigate(`/admin/projects/${result.value.id}`, { replace: true, state: { created: true } })
  }

  return (
    <>
      <AdminHead eyebrow="Website · Projects" title={project ? project.title : 'New project'}
                 back={{ to: '/admin/projects', label: 'All projects' }}
                 sub={project ? <>Shown at zayun.net/projects · <PublishedChip isPublished={project.isPublished} /></>
                   : 'Add the words first; you can add pictures once it is saved.'} />

      <form className={`${styles.panel} ${styles.form}`} onSubmit={onSubmit} noValidate>
        <div className={styles.panelHead}><h2>Details</h2></div>

        <div className={styles.grid2}>
          <Field label="Title" value={fields.title} maxLength={150} onChange={(e) => set('title', e.target.value)}
                 error={err('title')} placeholder="Phloem" />
          <Field label="Subtitle" value={fields.subtitle} maxLength={200}
                 onChange={(e) => set('subtitle', e.target.value)} error={err('subtitle')}
                 placeholder="Cross-border food marketplace" />
          <Select label="Section" value={fields.category} options={projectCategories}
                  onChange={(e) => set('category', e.target.value as ProjectCategory)} error={err('category')} />
          <Field label="Card label" value={fields.label} maxLength={100} onChange={(e) => set('label', e.target.value)}
                 error={err('label')} placeholder="AI Innovation" hint="The small label at the top of the card." />
        </div>

        <TextArea label="Description" value={fields.description} maxLength={4000} rows={7}
                  onChange={(e) => set('description', e.target.value)} error={err('description')} />

        <TagInput label="Tags" value={fields.tags} onChange={(tags) => set('tags', tags)} max={20}
                  error={err('tags')} hint="Technologies, e.g. React, .NET, SQL Server." />

        <div className={styles.grid2}>
          <Field label="GitHub link" optional type="url" value={fields.githubUrl ?? ''} maxLength={500}
                 onChange={(e) => set('githubUrl', e.target.value)} error={err('githubUrl')}
                 placeholder="https://github.com/…" />
          <Field label="Live link" optional type="url" value={fields.liveUrl ?? ''} maxLength={500}
                 onChange={(e) => set('liveUrl', e.target.value)} error={err('liveUrl')} placeholder="https://…" />
          <Field label="Picture label" optional value={fields.visualLabel ?? ''} maxLength={100}
                 onChange={(e) => set('visualLabel', e.target.value)} error={err('visualLabel')}
                 hint="Text shown over the picture, if any." />
          <Field label="Web address" optional value={fields.slug ?? ''} maxLength={160}
                 onChange={(e) => set('slug', e.target.value)} error={err('slug')}
                 hint="Leave empty to make it from the title, e.g. phloem-marketplace." />
        </div>

        <Toggle label="Private repository" checked={fields.isPrivateRepo} onChange={(v) => set('isPrivateRepo', v)}
                hint={'The card says "Private repository" instead of linking to GitHub.'} />
        {!project && (
          <Toggle label="Put it on the website now" checked={publishNow} onChange={setPublishNow}
                  hint="Leave off to keep it as a draft while you add pictures." />
        )}

        {error && !Object.keys(error.fieldErrors).length && <StatusBanner message={error.displayMessage} isError />}
        {error && Object.keys(error.fieldErrors).length > 0 &&
          <StatusBanner message="Please check the fields marked in red." isError />}
        {saved && <StatusBanner message="Saved." />}

        <div className={styles.actionsEnd}>
          <Button variant="plain" onClick={() => navigate('/admin/projects')}>Cancel</Button>
          <Button type="submit" busy={busy} busyText="Saving…">{project ? 'Save changes' : 'Create project'}</Button>
        </div>
      </form>

      {project && <ProjectImages project={project} />}
    </>
  )
}
