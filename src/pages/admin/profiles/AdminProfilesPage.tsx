import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router'
import { ApiError, unwrap } from '../../../api/apiError'
import type { ProfileFields } from '../../../api/contracts/commands'
import type { ProfileDto } from '../../../api/contracts/dtos'
import type { ProfilePlatform } from '../../../api/contracts/enums'
import { createProfile, getAdminProfiles, updateProfile } from '../../../api/services/adminService'
import { Button } from '../../../components/ui/Button'
import { Field, Select, Toggle } from '../../../components/ui/Field'
import { ListStatus } from '../../../components/ui/ListStatus'
import { ProfileIcon } from '../../../components/ui/ProfileIcon'
import { StatusBanner } from '../../../components/ui/StatusBanner'
import { labelOf, profilePlatforms } from '../../../components/ui/labels'
import styles from '../Admin.module.css'
import { AdminHead, ConfirmDelete, OrderButtons, PublishedChip } from '../AdminParts'
import { useAdminList } from '../useAdminList'

const key = ['admin', 'profiles'] as const

/** Research sites start ticked for Contact and Research; others for the footer and Contact. */
const RESEARCH: ProfilePlatform[] = ['Orcid', 'ResearchGate', 'GoogleScholar', 'Arxiv', 'Ieee', 'Scopus',
  'SemanticScholar', 'Dblp', 'Zenodo', 'Academia']

/** "Footer · Contact · Research". */
const placesText = (p: ProfileDto) =>
  [p.showInFooter && 'Footer', p.showOnContact && 'Contact', p.showOnResearch && 'Research'].filter(Boolean).join(' · ')
  || 'Nowhere yet'

/**
 * Online profiles (ORCID, ResearchGate, Google Scholar, arXiv, LinkedIn, GitHub…). Each one is shown where it's
 * ticked: the footer of every page, Contact and / or Research. All published ones are also listed for search engines.
 */
export default function AdminProfilesPage() {
  const [params, setParams] = useSearchParams()
  const profiles = useQuery({
    queryKey: key,
    queryFn: async ({ signal }) => unwrap(await getAdminProfiles(signal)),
  })
  const list = useAdminList<ProfileDto>('profiles', key)
  const items = profiles.data ?? []

  const editId = params.get('edit')
  const isNew = params.get('new') === '1'
  const editing = editId ? items.find((p) => p.id === editId) : undefined
  const close = () => setParams({}, { replace: true })

  return (
    <>
      <AdminHead eyebrow="Website" title="Profiles"
                 sub="Your online profiles. Tick where each one shows: the footer of every page, the Contact page and the Research page. Search engines see all the published ones.">
        {!isNew && <Button onClick={() => setParams({ new: '1' })}>New profile</Button>}
      </AdminHead>

      {(isNew || editing) && <ProfileEditor key={editing?.id ?? 'new'} profile={editing} onDone={close} />}

      <StatusBanner message={list.error?.displayMessage} isError />
      <ListStatus isLoading={profiles.isLoading} error={profiles.error} isEmpty={items.length === 0}
                  emptyText="No profiles yet. Add ORCID, ResearchGate, LinkedIn…" onRetry={() => profiles.refetch()} />

      <ul className={styles.rows}>
        {items.map((p, index) => (
          <li key={p.id} className={`${styles.row} ${p.isPublished ? '' : styles.rowDraft}`}>
            <span className={styles.profileIcon}><ProfileIcon platform={p.platform} size={20} /></span>
            <div className={styles.rowText}>
              <strong>{p.name}</strong>
              <div className={styles.rowMeta}>
                <PublishedChip isPublished={p.isPublished} />
                <span>{placesText(p)}</span>
                {p.label && <span>{p.label}</span>}
                <span><a href={p.url} target="_blank" rel="noreferrer" className={styles.profileLink}>{p.url}</a></span>
              </div>
            </div>
            <div className={styles.rowActions}>
              <OrderButtons index={index} count={items.length} onMove={list.move} name={p.name} />
              <Button variant="secondary" small busy={list.busyId === p.id} onClick={() => list.togglePublished(p)}>
                {p.isPublished ? 'Hide' : 'Publish'}
              </Button>
              <Button variant="secondary" small onClick={() => setParams({ edit: p.id })}>Edit</Button>
              <ConfirmDelete question={`Delete the ${p.name} profile?`} onConfirm={() => list.deleteItem(p)} />
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}

function ProfileEditor({ profile, onDone }: { profile?: ProfileDto; onDone: () => void }) {
  const queryClient = useQueryClient()
  const [fields, setFields] = useState<ProfileFields>(() => profile
    ? { platform: profile.platform, name: profile.name, url: profile.url, label: profile.label ?? '',
        showInFooter: profile.showInFooter, showOnContact: profile.showOnContact, showOnResearch: profile.showOnResearch }
    : { platform: 'Orcid', name: 'ORCID', url: '', label: '', showInFooter: true, showOnContact: true, showOnResearch: true })
  const [publishNow, setPublishNow] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)

  const set = <K extends keyof ProfileFields>(k: K, v: ProfileFields[K]) => setFields((f) => ({ ...f, [k]: v }))
  const err = (name: string) => error?.fieldError(name)

  /** A new site: suggest its name (unless one was typed) and where it usually goes. */
  const pickPlatform = (platform: ProfilePlatform) => setFields((f) => {
    const suggested = labelOf(profilePlatforms, f.platform)
    const isResearch = RESEARCH.includes(platform)
    return {
      ...f,
      platform,
      name: !f.name || f.name === suggested ? labelOf(profilePlatforms, platform) : f.name,
      ...(profile ? {} : { showInFooter: platform !== 'Other', showOnContact: true, showOnResearch: isResearch }),
    }
  })

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setError(null)
    const body: ProfileFields = { ...fields, url: fields.url.trim(), label: fields.label?.trim() || null }
    const result = profile
      ? await updateProfile(profile.id, body)
      : await createProfile({ ...body, isPublished: publishNow })
    setBusy(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    void queryClient.invalidateQueries({ queryKey: key })
    void queryClient.invalidateQueries({ queryKey: ['content'] })
    onDone()
  }

  return (
    <form className={`${styles.panel} ${styles.editing} ${styles.form}`} onSubmit={onSubmit} noValidate>
      <div className={styles.panelHead}>
        <h2 style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
          <ProfileIcon platform={fields.platform} size={20} /> {profile ? 'Edit profile' : 'New profile'}
        </h2>
      </div>

      <div className={styles.grid3}>
        <Select label="Site" value={fields.platform} options={profilePlatforms}
                onChange={(e) => pickPlatform(e.target.value as ProfilePlatform)} hint="Picks the icon." />
        <Field label="Name shown" value={fields.name} maxLength={60} onChange={(e) => set('name', e.target.value)}
               error={err('name')} />
        <Field label="Label" optional value={fields.label ?? ''} maxLength={100}
               onChange={(e) => set('label', e.target.value)} error={err('label')}
               placeholder={fields.platform === 'Orcid' ? '0000-0002-…' : 'e.g. your username'}
               hint="A short line under the name, e.g. your ORCID iD." />
      </div>
      <Field label="Link" type="url" value={fields.url} maxLength={500} onChange={(e) => set('url', e.target.value)}
             error={err('url')} placeholder="https://…" />

      <fieldset style={{ display: 'grid', gap: 12, margin: 0, padding: 0, border: 0 }}>
        <legend style={{ marginBottom: 10, fontWeight: 600, fontSize: '0.88rem' }}>Where it shows</legend>
        <Toggle label="Footer of every page" checked={fields.showInFooter} onChange={(v) => set('showInFooter', v)}
                hint="Keep this to your 4–5 main profiles." />
        <Toggle label="Contact page" checked={fields.showOnContact} onChange={(v) => set('showOnContact', v)} />
        <Toggle label={'Research page ("Find my research")'} checked={fields.showOnResearch}
                onChange={(v) => set('showOnResearch', v)} />
      </fieldset>

      {!profile && <Toggle label="Put it on the website now" checked={publishNow} onChange={setPublishNow} />}

      {error && <StatusBanner message={Object.keys(error.fieldErrors).length ? 'Please check the fields marked in red.'
        : error.displayMessage} isError />}

      <div className={styles.actionsEnd}>
        <Button variant="plain" onClick={onDone}>Cancel</Button>
        <Button type="submit" busy={busy} busyText="Saving…">{profile ? 'Save changes' : 'Add profile'}</Button>
      </div>
    </form>
  )
}
