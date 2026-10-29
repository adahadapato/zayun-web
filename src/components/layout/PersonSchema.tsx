import { useEffect } from 'react'
import { usePersonalDetails, useProfiles } from '../../state/contentQueries'

/**
 * Tells search engines who the site is about (schema.org Person: name and headline from Admin → Account) and which
 * profiles are the same person ("sameAs": every published profile from Admin → Profiles). Invisible on the page. Helps a search for "Enobong Adahada" show
 * the right person with the right links.
 */
export function PersonSchema() {
  const profiles = useProfiles()
  const personal = usePersonalDetails()

  useEffect(() => {
    const data = {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: personal.data?.fullName || 'Enobong Adahada',
      url: 'https://zayun.net',
      jobTitle: personal.data?.headline || 'Software Engineer and AI Researcher',
      sameAs: (profiles.data ?? []).map((p) => p.url),
    }

    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.dataset.zayun = 'person'
    script.textContent = JSON.stringify(data)
    document.head.querySelectorAll('script[data-zayun="person"]').forEach((s) => s.remove())
    document.head.appendChild(script)
    return () => script.remove()
  }, [profiles.data, personal.data])

  return null
}
