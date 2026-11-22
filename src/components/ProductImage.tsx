import { useState } from 'react'
import { Coffee } from 'lucide-react'
import { cx } from '../lib/cx'

/** Photo du produit, ou repli propre (dimensions réservées, pas de saut de mise en page). */
export default function ProductImage({ src, alt, className }: { src?: string; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false)
  if (src && !failed) return <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} className={cx('size-full object-cover', className)} />
  return (
    <div role="img" aria-label={`${alt} (photo non disponible)`} className={cx('flex size-full items-center justify-center bg-gradient-to-br from-surface-raised to-canvas text-brand-strong/70', className)}>
      <Coffee size={40} strokeWidth={1.25} aria-hidden />
    </div>
  )
}
