import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router'
import { unwrap } from '../../../api/apiError'
import type { ProjectDto } from '../../../api/contracts/dtos'
import { getAdminProjects } from '../../../api/services/adminService'
import { ApiImage } from '../../../components/ui/ApiImage'
import { Button, ButtonLink } from '../../../components/ui/Button'
import { ListStatus } from '../../../components/ui/ListStatus'
import { StatusBanner } from '../../../components/ui/StatusBanner'
import { labelOf, projectCategories } from '../../../components/ui/labels'
import styles from '../Admin.module.css'
import { AdminHead, ConfirmDelete, OrderButtons, PublishedChip } from '../AdminParts'
import { useAdminList } from '../useAdminList'
import { coverOf, projectsKey } from './projectKeys'

/** All projects (drafts too) in the website's order, with show / hide, move, edit and delete. */
export default function AdminProjectsPage() {
  const projects = useQuery({
    queryKey: projectsKey,
    queryFn: async ({ signal }) => unwrap(await getAdminProjects(signal)),
  })
  const list = useAdminList<ProjectDto>('projects', projectsKey)
  const items = projects.data ?? []

  return (
    <>
      <AdminHead eyebrow="Website" title="Projects"
                 sub="The Projects page shows these in this order: Featured first, then Engineering.">
        <ButtonLink to="/admin/projects/new">New project</ButtonLink>
      </AdminHead>

      <StatusBanner message={list.error?.displayMessage} isError />
      <ListStatus isLoading={projects.isLoading} error={projects.error} isEmpty={items.length === 0}
                  emptyText="No projects yet. Add the first one." onRetry={() => projects.refetch()} />

      <ul className={styles.rows}>
        {items.map((project, index) => {
          const cover = coverOf(project)
          return (
            <li key={project.id} className={`${styles.row} ${project.isPublished ? '' : styles.rowDraft}`}>
              <ApiImage src={cover?.thumbnailUrl ?? cover?.url} alt={cover?.altText ?? project.title}
                        className={styles.rowThumb} />
              <div className={styles.rowText}>
                <Link to={`/admin/projects/${project.id}`}><strong>{project.title}</strong></Link>
                <div className={styles.rowMeta}>
                  <PublishedChip isPublished={project.isPublished} />
                  <span>{labelOf(projectCategories, project.category)}</span>
                  <span>{project.images.length} {project.images.length === 1 ? 'picture' : 'pictures'}</span>
                  <span>{project.label}</span>
                </div>
              </div>
              <div className={styles.rowActions}>
                <OrderButtons index={index} count={items.length} onMove={list.move} name={project.title} />
                <Button variant="secondary" small busy={list.busyId === project.id}
                        onClick={() => list.togglePublished(project)}>
                  {project.isPublished ? 'Hide' : 'Publish'}
                </Button>
                <ButtonLink to={`/admin/projects/${project.id}`} variant="secondary" small>Edit</ButtonLink>
                <ConfirmDelete question={`Delete "${project.title}" and its pictures?`}
                               onConfirm={() => list.deleteItem(project)} />
              </div>
            </li>
          )
        })}
      </ul>
    </>
  )
}
