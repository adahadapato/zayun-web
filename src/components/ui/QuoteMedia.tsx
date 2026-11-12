/**
 * A quote's picture, or its animation (e.g. the "Nature first" bird → plane → drone loop), for the Home card.
 *
 * - The animation is an MP4 that plays silently on a loop, like a GIF but much smaller.
 * - A Pause / Play button is always there (moving content that starts by itself must be stoppable: WCAG 2.2.2).
 * - Visitors whose device asks for reduced motion see the still picture instead, and so does anyone whose browser
 *   can't play the video.
 * - The picture's description is read by screen readers; the animation tells the same story, so it uses the same
 *   description.
 */
import { useEffect, useRef, useState } from 'react'
import { Pause, Play } from 'lucide-react'
import { fileUrl } from '../../api/config'
import type { QuoteMediaDto } from '../../api/contracts/dtos'

/** True while the visitor's device asks for reduced motion (follows the setting if it changes). */
function usePrefersReducedMotion(): boolean {
  const query = '(prefers-reduced-motion: reduce)'
  const [reduce, setReduce] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches)

  useEffect(() => {
    const list = window.matchMedia(query)
    const update = () => setReduce(list.matches)
    list.addEventListener('change', update)
    return () => list.removeEventListener('change', update)
  }, [])

  return reduce
}

export function QuoteMedia({ media }: { media: QuoteMediaDto }) {
  const reduceMotion = usePrefersReducedMotion()
  const [videoFailed, setVideoFailed] = useState(false)
  const pictureUrl = fileUrl(media.pictureUrl)
  const animationUrl = fileUrl(media.animationUrl)

  if (animationUrl && !reduceMotion && !videoFailed) {
    return (
      <QuoteAnimation
        src={animationUrl}
        poster={pictureUrl}
        description={media.altText}
        width={media.width}
        height={media.height}
        onFail={() => setVideoFailed(true)}
      />
    )
  }

  return (
    <div className="quote-media">
      <img
        src={pictureUrl}
        alt={media.altText}
        width={media.width}
        height={media.height}
        loading="lazy"
        decoding="async"
      />
    </div>
  )
}

type QuoteAnimationProps = {
  src: string
  poster: string | undefined
  description: string
  width: number
  height: number
  onFail: () => void
}

/** The looping MP4 with its Pause / Play button. */
function QuoteAnimation({ src, poster, description, width, height, onFail }: QuoteAnimationProps) {
  const video = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(true)

  const toggle = () => {
    const element = video.current
    if (!element) return
    if (element.paused) {
      void element.play().catch(() => setPlaying(false))
    } else {
      element.pause()
    }
  }

  return (
    <div className="quote-media">
      <video
        ref={video}
        src={src}
        poster={poster}
        width={width}
        height={height}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-label={description}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onError={onFail}
      />
      <button
        type="button"
        className="quote-media-toggle"
        onClick={toggle}
        aria-label={playing ? 'Pause animation' : 'Play animation'}
      >
        {playing ? <Pause size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}
      </button>
    </div>
  )
}
