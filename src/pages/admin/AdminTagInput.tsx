import { useQuery } from '@tanstack/react-query'
import { useCallback, useEffect, useState } from 'react'
import { unwrap } from '../../api/apiError'
import { checkTag, getTags } from '../../api/services/adminService'
import { TagInput, type TagCheckResult } from '../../components/ui/TagInput'
import { tagsKey } from './tags/tagsKey'

/**
 * The tag box for the admin area (project tags, experience skills, skill-group skills). While typing it asks the API
 * for the 8 best-matching tags (never the whole list), and checks each new name (built-in rules, then AI) before
 * adding it.
 */
export function AdminTagInput(props: {
  label: string
  value: string[]
  onChange: (value: string[]) => void
  hint?: string
  error?: string
  max?: number
}) {
  const [typed, setTyped] = useState('')
  const [search, setSearch] = useState('')

  // Look up a moment after typing stops
  useEffect(() => {
    const timer = setTimeout(() => setSearch(typed), 200)
    return () => clearTimeout(timer)
  }, [typed])

  const matches = useQuery({
    queryKey: [...tagsKey, 'suggest', search],
    queryFn: async ({ signal }) => unwrap(await getTags({ search, sort: 'Usage', pageSize: 8 }, signal)),
    enabled: search.length >= 1,
    staleTime: 60_000,
  })

  const check = useCallback(async (name: string): Promise<TagCheckResult | null> => {
    const result = await checkTag(name)
    return result.ok ? result.value : null
  }, [])

  return (
    <TagInput {...props} check={check} onDraftChange={setTyped}
              suggestions={search ? matches.data?.tags.items.map((t) => t.name) : undefined}
              placeholder="Type a tag and press Enter" />
  )
}
