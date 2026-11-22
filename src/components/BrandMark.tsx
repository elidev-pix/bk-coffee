import logo from '../assets/logo-bk-coffee.webp'
import { cx } from '../lib/cx'

/** Logo officiel (export Stitch). `text` ajoute le nom en Bodoni Moda. */
export default function BrandMark({ size = 40, text = false, className = '' }: { size?: number; text?: boolean; className?: string }) {
  return (
    <span className={cx('inline-flex items-center gap-3', className)}>
      <img src={logo} alt={text ? '' : 'BK Coffee Shop'} width={size} height={size} className="rounded-card border border-line object-cover" style={{ width: size, height: size }} />
      {text && <span className="font-display text-xl font-bold tracking-wide whitespace-nowrap text-brand">BK COFFEE SHOP</span>}
    </span>
  )
}
