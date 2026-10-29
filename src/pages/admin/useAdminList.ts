/**
 * The list actions every admin page shares: show / hide on the website, move up / down, delete.
 * Moves change the list on screen straight away and then tell the API; if the API says no, the list is loaded again.
 * After any change the Overview numbers and the public pages' data are refreshed.
 */
import { useQueryClient, type QueryKey } from '@tanstack/react-query'
import { useState } from 'react'
import type { ApiError } from '../../api/apiError'
import { remove, reorder, setPublished } from '../../api/services/adminService'

/** What a page needs from {@link useAdminList} to show a list's buttons. */
export interface AdminListActions<TItem> {
  togglePublished: (item: TItem) => Promise<void>
  move: (from: number, to: number) => Promise<void>
  deleteItem: (item: TItem) => Promise<void>
  busyId: string | null
  error: ApiError | null
}

interface Ordered {
  id: string
  isPublished: boolean
}

/**
 * @param area     The API route under /api/admin, e.g. "projects", "skills/groups".
 * @param queryKey The cached query holding the list.
 * @param lens     How to find the list in the cached data and put a changed list back (default: the data IS the list).
 */
export function useAdminList<TItem extends Ordered, TData = TItem[]>(
  area: string,
  queryKey: QueryKey,
  lens: { get: (data: TData) => TItem[]; set: (data: TData, items: TItem[]) => TData } = {
    get: (data) => data as unknown as TItem[],
    set: (_data, items) => items as unknown as TData,
  },
) {
  const queryClient = useQueryClient()
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState<ApiError | null>(null)

  const current = () => {
    const data = queryClient.getQueryData<TData>(queryKey)
    return data === undefined ? null : { data, items: lens.get(data) }
  }

  const write = (items: TItem[]) =>
    queryClient.setQueryData<TData>(queryKey, (data) => (data === undefined ? data : lens.set(data, items)))

  /** Something changed: the Overview numbers and the public site's lists are out of date. */
  const touched = () => {
    void queryClient.invalidateQueries({ queryKey: ['admin', 'overview'] })
    void queryClient.invalidateQueries({ queryKey: ['content'] })
  }

  const reload = () => queryClient.invalidateQueries({ queryKey })

  const togglePublished = async (item: TItem) => {
    setBusyId(item.id)
    setError(null)
    const result = await setPublished(area, item.id, !item.isPublished)
    setBusyId(null)
    if (!result.ok) {
      setError(result.error)
      return
    }
    const now = current()
    if (now) write(now.items.map((i) => (i.id === item.id ? { ...i, isPublished: !item.isPublished } : i)))
    touched()
  }

  const move = async (from: number, to: number) => {
    const now = current()
    if (!now || to < 0 || to >= now.items.length) return
    const items = [...now.items]
    const [moved] = items.splice(from, 1)
    items.splice(to, 0, moved)
    write(items)
    setError(null)
    const result = await reorder(area, items.map((i) => i.id))
    if (!result.ok) {
      setError(result.error)
      void reload()
      return
    }
    touched()
  }

  const deleteItem = async (item: TItem) => {
    setBusyId(item.id)
    setError(null)
    const result = await remove(area, item.id)
    setBusyId(null)
    if (!result.ok) {
      setError(result.error)
      return
    }
    const now = current()
    if (now) write(now.items.filter((i) => i.id !== item.id))
    touched()
  }

  return { togglePublished, move, deleteItem, busyId, error, clearError: () => setError(null), touched, reload }
}
