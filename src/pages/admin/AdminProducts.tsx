import { useMemo, useState, type FormEvent } from 'react'
import { Pencil, Plus, Search } from 'lucide-react'
import type { Product } from '../../types'
import { dispatch, useAppState } from '../../state/store'
import { setProductAvailability, upsertProduct } from '../../state/actions'
import { formatFCFA } from '../../lib/format'
import { inputCls } from '../../lib/ui'
import PageHeader from '../../components/ui/PageHeader'
import Button from '../../components/ui/Button'
import Field from '../../components/ui/Field'
import Modal from '../../components/ui/Modal'
import Toggle from '../../components/ui/Toggle'
import ProductImage from '../../components/ProductImage'

function ProductForm({ product, onClose }: { product: Product | null; onClose: () => void }) {
  const { categories } = useAppState()
  const [name, setName] = useState(product?.name ?? '')
  const [description, setDescription] = useState(product?.description ?? '')
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? categories[0]?.id ?? '')
  const [price, setPrice] = useState(product ? String(product.price) : '')
  const [available, setAvailable] = useState(product?.available ?? true)
  const [errors, setErrors] = useState<{ name?: string; price?: string; form?: string }>({})
  const submit = (e: FormEvent) => {
    e.preventDefault()
    const next: typeof errors = {}
    if (!name.trim()) next.name = 'Le nom est obligatoire.'
    if (price === '' || !Number.isInteger(Number(price)) || Number(price) < 0) next.price = 'Indiquez un prix entier en FCFA (0 ou plus).'
    setErrors(next)
    if (next.name || next.price) return
    // Les options et l'image existantes sont conservées lors d'une modification.
    const r = dispatch(upsertProduct({ ...(product ?? {}), id: product?.id, name, description, categoryId, price: Number(price), available }))
    if (!r.ok) { setErrors({ form: r.error }); return }
    onClose()
  }
  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      {errors.form && <p role="alert" className="rounded-control border border-danger/40 bg-danger-soft p-3 text-sm text-danger">{errors.form}</p>}
      <Field label="Nom *" error={errors.name}>{(p) => <input {...p} value={name} onChange={(e) => setName(e.target.value)} />}</Field>
      <Field label="Description">{(p) => <textarea {...p} rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />}</Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Catégorie">{(p) => <select {...p} value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>{categories.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}</select>}</Field>
        <Field label="Prix (FCFA) *" error={errors.price}>{(p) => <input {...p} inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value.replace(/\D/g, ''))} />}</Field>
      </div>
      <Toggle checked={available} onChange={setAvailable} label="Disponibilité du produit" onLabel="Disponible" offLabel="Indisponible" />
      {product?.options?.length ? <p className="text-xs text-muted">{product.options.length} option(s) conservée(s) (non modifiables dans cette démonstration).</p> : null}
      <div className="flex justify-end gap-3 pt-2"><Button variant="ghost" onClick={onClose}>Annuler</Button><Button type="submit">{product ? 'Enregistrer' : 'Créer le produit'}</Button></div>
    </form>
  )
}

export default function AdminProducts() {
  const { products, categories } = useAppState()
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('')
  const [editing, setEditing] = useState<Product | 'new' | null>(null)
  const list = useMemo(() => products.filter((p) => (!cat || p.categoryId === cat) && (!q.trim() || p.name.toLowerCase().includes(q.trim().toLowerCase()))), [products, q, cat])
  const catLabel = (id: string) => categories.find((c) => c.id === id)?.label ?? '—'
  return (
    <div className="pb-10">
      <PageHeader title="Produits" subtitle="Les modifications se reflètent immédiatement dans le menu, la borne et la caisse." actions={<Button onClick={() => setEditing('new')}><Plus size={18} aria-hidden /> Nouveau produit</Button>} />
      <div className="space-y-4 px-4 md:px-8">
        <div className="grid gap-3 sm:grid-cols-2 lg:max-w-xl">
          <label className="relative block"><span className="sr-only">Rechercher un produit</span><Search size={16} className="absolute top-1/2 left-3 -translate-y-1/2 text-muted" aria-hidden /><input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher…" className={`${inputCls} mt-0 pl-9`} /></label>
          <select aria-label="Filtrer par catégorie" value={cat} onChange={(e) => setCat(e.target.value)} className={`${inputCls} mt-0`}><option value="">Catégorie : toutes</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}</select>
        </div>
        {list.length === 0 ? <p role="status" className="rounded-card border border-line bg-surface p-8 text-center text-muted">Aucun produit ne correspond.</p> : (
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {list.map((p) => (
              <li key={p.id} className="flex gap-4 rounded-card border border-line bg-surface p-4">
                <div className="size-20 shrink-0 overflow-hidden rounded-control"><ProductImage src={p.image} alt={p.name} /></div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-ink">{p.name}</p>
                  <p className="text-xs text-muted">{catLabel(p.categoryId)}</p>
                  <p className="mt-1 font-display text-lg text-brand">{formatFCFA(p.price)}</p>
                  <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
                    <Toggle checked={p.available} onChange={(v) => dispatch(setProductAvailability(p.id, v))} label={`Disponibilité de ${p.name}`} onLabel="Disponible" offLabel="Indisponible" />
                    <button type="button" onClick={() => setEditing(p)} aria-label={`Modifier ${p.name}`} className="rounded-control p-2 text-muted hover:bg-surface-raised hover:text-brand"><Pencil size={18} aria-hidden /></button>
                  </div>
                </div>
              </li>))}
          </ul>)}
      </div>
      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing === 'new' ? 'Nouveau produit' : 'Modifier le produit'}>
        {editing && <ProductForm key={editing === 'new' ? 'new' : editing.id} product={editing === 'new' ? null : editing} onClose={() => setEditing(null)} />}
      </Modal>
    </div>
  )
}
