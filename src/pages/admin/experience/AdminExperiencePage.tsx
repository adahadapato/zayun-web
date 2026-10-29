import { useQuery } from '@tanstack/react-query'
import { unwrap } from '../../../api/apiError'
import type { ExperienceAreaDto } from '../../../api/contracts/dtos'
import { createExperienceArea, getAdminExperience, updateExperienceArea } from '../../../api/services/adminService'
import { AdminHead } from '../AdminParts'
import { TextGroupList } from '../TextGroups'
import { useAdminList } from '../useAdminList'

const key = ['admin', 'experience'] as const

/** The areas on the Experience page, each with its skills. */
export default function AdminExperiencePage() {
  const experience = useQuery({
    queryKey: key,
    queryFn: async ({ signal }) => unwrap(await getAdminExperience(signal)),
  })
  const list = useAdminList<ExperienceAreaDto>('experience', key)

  return (
    <>
      <AdminHead eyebrow="Website" title="Experience"
                 sub="The areas on the Experience page, in this order. Each lists the skills used there." />
      <TextGroupList items={experience.data ?? []} isLoading={experience.isLoading} error={experience.error}
                     onRetry={() => experience.refetch()} list={list} queryKey={key}
                     words={{ noun: 'experience area', maxSkills: 30, maxDescription: 2000 }}
                     create={createExperienceArea} update={updateExperienceArea} />
    </>
  )
}
