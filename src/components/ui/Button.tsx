import type { ButtonHTMLAttributes } from 'react'
import { cx } from '../../lib/cx'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'danger'; size?: 'md' | 'lg' }

const variants = {
  primary: 'bg-brand text-brand-contrast font-bold hover:bg-brand-strong shadow-glow/0 hover:shadow-glow',
  secondary: 'border border-brand-strong text-brand hover:bg-accent-soft',
  ghost: 'text-ink hover:bg-surface-raised',
  danger: 'border border-danger text-danger hover:bg-danger-soft',
}

export default function Button({ variant = 'primary', size = 'md', className, type = 'button', ...rest }: Props) {
  return (
    <button
      type={type}
      className={cx(
        'inline-flex items-center justify-center gap-2 rounded-control font-semibold transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none',
        size === 'lg' ? 'min-h-14 px-6 text-lg' : 'min-h-11 px-4 text-sm',
        variants[variant], className,
      )}
      {...rest}
    />
  )
}
