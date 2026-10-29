import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router'
import styles from './Button.module.css'

/** primary (cyan gradient), secondary (outlined cyan), plain (quiet), danger (red). */
export type ButtonVariant = 'primary' | 'secondary' | 'plain' | 'danger'

interface Common {
  variant?: ButtonVariant
  /** Smaller (36px) version. */
  small?: boolean
  /** Full width of its container. */
  full?: boolean
  children: ReactNode
}

/** Class names for a button look (also used by {@link ButtonLink}). */
function classes({ variant = 'primary', small, full }: Omit<Common, 'children'>, extra?: string): string {
  return [styles.button, styles[variant], small && styles.small, full && styles.full, extra].filter(Boolean).join(' ')
}

type ButtonProps = Common & ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Shows this text and disables the button while something runs (e.g. "Saving…"). */
  busyText?: string
  busy?: boolean
}

/** A button. `type` defaults to "button" so it never submits a form by accident. */
export function Button({ variant, small, full, busy, busyText, children, className, type = 'button',
                         disabled, ...rest }: ButtonProps) {
  return (
    <button type={type} className={classes({ variant, small, full }, className)} disabled={disabled || busy}
            aria-busy={busy || undefined} {...rest}>
      {busy && busyText ? busyText : children}
    </button>
  )
}

/** A link that looks like a button (goes to another page of the site). */
export function ButtonLink({ to, variant, small, full, children }: Common & { to: string }) {
  return (
    <Link to={to} className={classes({ variant, small, full })}>
      {children}
    </Link>
  )
}
