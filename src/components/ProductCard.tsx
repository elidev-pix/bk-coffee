import { useEffect, useState } from 'react'
import { Check, Plus } from 'lucide-react'
import type { Product } from '../types'
import { formatFCFA } from '../lib/format'
import { cx } from '../lib/cx'
import ProductImage from './ProductImage'

/** onAdd : ajout direct si le produit n'a pas d'option ; sinon onOpen (dialogue de personnalisation). */
export default function ProductCard({ product, onAdd, onOpen, kiosk = false }: { product: Product; onAdd: (p: Product) => void; onOpen: (p: Product) => void; kiosk?: boolean }) {
  const [added, setAdded] = useState(false)
  useEffect(() => {
    if (!added) return
    const t = setTimeout(() => setAdded(false), 1200)
    return () => clearTimeout(t)
  }, [added])
  const hasOptions = !!product.options?.length
  const click = () => { if (hasOptions) onOpen(product); else { onAdd(product); setAdded(true) } }
  return (
    <article className={cx('group flex flex-col overflow-hidden rounded-card border bg-surface transition-colors', product.available ? 'border-line hover:border-brand-strong' : 'border-line opacity-60')}>
      <button type="button" onClick={() => onOpen(product)} className="relative block aspect-[4/3] overflow-hidden text-left" aria-label={`Voir le détail : ${product.name}`}>
        <div className="size-full transition-transform duration-300 group-hover:scale-105"><ProductImage src={product.image} alt={product.name} /></div>
        <span className="absolute top-3 right-3 rounded-control border border-brand-strong bg-canvas/85 px-3 py-1 font-display text-lg font-semibold text-brand">{formatFCFA(product.price)}</span>
        {!product.available && <span className="label-caps absolute top-3 left-3 rounded-control border border-danger/50 bg-danger-soft px-2 py-1 text-danger">Indisponible</span>}
      </button>
      <div className={cx('flex flex-1 flex-col gap-2', kiosk ? 'p-6' : 'p-4')}>
        <h3 className={cx('font-display font-semibold text-ink', kiosk ? 'text-2xl' : 'text-xl')}>{product.name}</h3>
        <p className={cx('line-clamp-2 text-muted', kiosk ? 'text-base' : 'text-sm')}>{product.description}</p>
        <button type="button" onClick={click} disabled={!product.available}
          className={cx('mt-auto inline-flex items-center justify-center gap-2 rounded-control border border-brand-strong font-semibold text-brand transition-colors hover:bg-accent-soft disabled:cursor-not-allowed disabled:border-line disabled:text-muted', kiosk ? 'min-h-14 text-base' : 'min-h-11 text-sm', added && 'bg-accent-soft')}>
          {added ? <><Check size={18} aria-hidden /> Ajouté</> : <><Plus size={18} aria-hidden /> {product.available ? (hasOptions ? 'Personnaliser' : 'Ajouter') : 'Indisponible'}</>}
        </button>
      </div>
    </article>
  )
}
