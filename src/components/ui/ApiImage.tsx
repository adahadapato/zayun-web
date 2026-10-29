import { useState, type CSSProperties, type ImgHTMLAttributes } from 'react'
import { fileUrl } from '../../api/config'

type ApiImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
  /** The link the API returned (project picture, presentation poster); null/empty = no picture. */
  src: string | null | undefined
  /** Text for screen readers, e.g. "Phloem marketplace home screen". */
  alt: string
}

const placeholder: CSSProperties = {
  display: 'grid',
  placeItems: 'center',
  background: 'var(--z-bg-raised)',
  color: 'var(--z-text-faint)',
  aspectRatio: '16 / 10',
}

/**
 * A picture that comes from the API (project screenshots and presentation posters are no longer shipped with the
 * website). Shows a neutral placeholder when there is no picture or it can't be loaded, instead of a broken image.
 * Loads lazily (only when scrolled near).
 */
export function ApiImage({ src, alt, className, style, ...rest }: ApiImageProps) {
  const url = fileUrl(src)
  const [failedUrl, setFailedUrl] = useState<string | null>(null)

  if (!url || failedUrl === url) {
    return (
      <div role="img" aria-label={alt} className={className} style={{ ...placeholder, ...style }}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
             aria-hidden="true">
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <circle cx="9" cy="10" r="2" />
          <path d="m21 16-5-5-9 9" />
        </svg>
      </div>
    )
  }

  return <img src={url} alt={alt} loading="lazy" decoding="async" className={className} style={style}
              onError={() => setFailedUrl(url)} {...rest} />
}
