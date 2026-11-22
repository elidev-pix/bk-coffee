import { useState } from 'react'
import type { CartItem, Product } from '../types'
import { formatFCFA } from '../lib/format'
import Button from './ui/Button'
import Modal from './ui/Modal'
import ProductImage from './ProductImage'
import QtyStepper from './ui/QtyStepper'

function Body({ product, onAdd, onClose, big }: { product: Product; onAdd: (i: CartItem) => void; onClose: () => void; big: boolean }) {
  const [qty, setQty] = useState(1)
  const [optionIds, setOptionIds] = useState<string[]>([])
  const extra = (product.options ?? []).filter((o) => optionIds.includes(o.id)).reduce((s, o) => s + o.extraPrice, 0)
  const total = (product.price + extra) * qty
  return (
    <>
      <div className="mb-4 aspect-[16/9] overflow-hidden rounded-card"><ProductImage src={product.image} alt={product.name} /></div>
      <p className="text-muted">{product.description}</p>
      <p className="mt-2 font-display text-xl text-brand">{formatFCFA(product.price)}</p>
      {!!product.options?.length && (
        <fieldset className="mt-4 space-y-2">
          <legend className="label-caps mb-2 text-muted">Options</legend>
          {product.options.map((o) => (
            <label key={o.id} className="flex cursor-pointer items-center justify-between gap-3 rounded-control border border-line p-3 has-[:checked]:border-brand has-[:checked]:bg-accent-soft">
              <span className="flex items-center gap-3"><input type="checkbox" className="size-5 accent-[#e9c176]" checked={optionIds.includes(o.id)} onChange={(e) => setOptionIds(e.target.checked ? [...optionIds, o.id] : optionIds.filter((x) => x !== o.id))} />{o.label}</span>
              <span className="text-sm text-muted">+ {formatFCFA(o.extraPrice)}</span>
            </label>
          ))}
        </fieldset>
      )}
      <div className="mt-5 flex items-center justify-between gap-4">
        <QtyStepper value={qty} onChange={setQty} label={product.name} min={1} big={big} />
        <Button size="lg" disabled={!product.available} onClick={() => { onAdd({ productId: product.id, quantity: qty, optionIds }); onClose() }}>Ajouter · {formatFCFA(total)}</Button>
      </div>
    </>
  )
}

export default function ProductDialog({ product, onAdd, onClose, big = false }: { product: Product | null; onAdd: (i: CartItem) => void; onClose: () => void; big?: boolean }) {
  return (
    <Modal open={!!product} onClose={onClose} title={product?.name ?? ''}>
      {/* key : l'état (quantité, options) repart de zéro pour chaque produit */}
      {product && <Body key={product.id} product={product} onAdd={onAdd} onClose={onClose} big={big} />}
    </Modal>
  )
}
