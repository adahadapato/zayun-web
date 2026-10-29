import { useEffect, useState } from 'react'

/** "Saved" for a few seconds after a save, then nothing. */
export function useSavedFlag(): [boolean, () => void] {
  const [saved, setSaved] = useState(false)
  useEffect(() => {
    if (!saved) return
    const timer = setTimeout(() => setSaved(false), 3000)
    return () => clearTimeout(timer)
  }, [saved])
  return [saved, () => setSaved(true)]
}
