import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router'
import { unwrap } from '../../api/apiError'
import type { ContentCountDto } from '../../api/contracts/dtos'
import { getOverview } from '../../api/services/adminService'
import { ButtonLink } from '../../components/ui/Button'
import { ListStatus } from '../../components/ui/ListStatus'
import { useSession } from '../../state/SessionContext'
import styles from './Admin.module.css'
import { AdminHead, StatTile } from './AdminParts'

/** "4 of 5 on the website", or "All on the website". */
const shownNote = (count: ContentCountDto | undefined) => {
  if (!count) return undefined
  if (count.total === 0) return 'Nothing added yet'
  return count.published === count.total ? 'All on the website' : `${count.published} of ${count.total} on the website`
}

/** The admin home: how much content there is, how much is live, and what needs attention. */
export default function AdminOverviewPage() {
  const { account } = useSession()
  const overview = useQuery({
    queryKey: ['admin', 'overview'],
    queryFn: async ({ signal }) => unwrap(await getOverview(signal)),
  })
  const data = overview.data

  return (
    <>
      <AdminHead eyebrow="Overview" title={account ? `Hello, ${account.firstName}` : 'Overview'}
                 sub="Everything on zayun.net comes from here. Drafts stay hidden until you put them on the website." />

      <ListStatus isLoading={overview.isLoading} error={overview.error} isEmpty={false} emptyText=""
                  onRetry={() => overview.refetch()} placeholders={2} />

      {data && (
        <>
          <div className={styles.stats}>
            <StatTile label="New messages" value={data.newMessages} to="/admin/inbox" accent={data.newMessages > 0}
                      note={data.newMessages === 0 ? 'Inbox is clear' : 'Waiting for a reply'} />
            <StatTile label="Projects" value={data.projects.total} to="/admin/projects" note={shownNote(data.projects)} />
            <StatTile label="Publications" value={data.publications.total} to="/admin/publications"
                      note={shownNote(data.publications)} />
            <StatTile label="Presentations" value={data.presentations.total} to="/admin/presentations"
                      note={shownNote(data.presentations)} />
            <StatTile label="Experience areas" value={data.experienceAreas.total} to="/admin/experience"
                      note={shownNote(data.experienceAreas)} />
            <StatTile label="Skill groups" value={data.skillGroups.total} to="/admin/skills"
                      note={shownNote(data.skillGroups)} />
            <StatTile label="Core expertise" value={data.coreExpertise.total} to="/admin/skills"
                      note={shownNote(data.coreExpertise)} />
            <StatTile label="Awards" value={data.awards.total} to="/admin/awards" note={shownNote(data.awards)} />
            <StatTile label="Private documents" value={data.documents} to="/admin/documents" note="Only you can open them" />
          </div>

          <section className={styles.panel} aria-labelledby="quick">
            <div className={styles.panelHead}>
              <div>
                <h2 id="quick">Quick actions</h2>
                <p>Add something new, or check the public site.</p>
              </div>
            </div>
            <div className={styles.actions}>
              <ButtonLink to="/admin/projects/new">New project</ButtonLink>
              <ButtonLink to="/admin/publications?new=1" variant="secondary">New publication</ButtonLink>
              <ButtonLink to="/admin/documents" variant="secondary">Upload a document</ButtonLink>
              <Link to="/" className={styles.back} style={{ margin: '0 0 0 auto' }}>View zayun.net ›</Link>
            </div>
          </section>
        </>
      )}
    </>
  )
}
