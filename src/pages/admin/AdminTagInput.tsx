import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { unwrap } from '../../api/apiError'
import { checkTag, getTags } from '../../api/services/adminService'
import { TagInput, type TagCheckResult } from '../../components/ui/TagInput'
import { tagsKey } from './tags/tagsKey'

/**
 * The tag box for the admin area (project tags, experience skills, skill-group skills): offers the shared tags while
 * typing, and checks each new name with the API (built-in rules, then AI) before adding it.
 */
export function AdminTagInput(props: {
  label: string
  value: string[]
  onChange: (value: string[]) => void
  hint?: string
  error?: string
  max?: number
}) {
  const queryClient = useQueryClient()
  const tags = useQuery({
    queryKey: tagsKey,
    queryFn: async ({ signal }) => unwrap(await getTags(signal)),
    staleTime: 60_000,
  })

  const check = useCallback(async (name: string): Promise<TagCheckResult | null> => {
    const result = await checkTag(name)
    if (!result.ok) return null
    // A new tag is added to the list when the item is saved; refresh the suggestions afterwards
    if (result.value.status !== 'Existing') void queryClient.invalidateQueries({ queryKey: tagsKey })
    return result.value
  }, [queryClient])

  return (
    <TagInput {...props} check={check} suggestions={tags.data?.map((t) => t.name)}
              placeholder="Type a tag and press Enter" />
  )
}
