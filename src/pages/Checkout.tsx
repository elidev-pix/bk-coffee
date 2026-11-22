import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { PaymentMethod } from '../types'
import { cartClear, useCart } from '../state/cart'
import { dispatch, useAppState } from '../state/store'
import { createOrder } from '../state/actions'
import { priceCart } from '../lib/orders'
import { formatFCFA } from '../lib/format'
import { cx } from '../lib/cx'
import Button from '../components/ui/Button'

const PHONE = /^[+\d][\d\s.-]{6,}$/
const input = 'mt-1 min-h-11 w-full rounded-control border border-line-strong bg-canvas px-3 text-ink aria-[invalid=true]:border-danger'

export default function Checkout() {
  const nav = useNavigate()
  const { products } = useAppState()
  const items = useCart('site')
  const cart = priceCart(items, products)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [method, setMethod] = useState<PaymentMethod>('especes')
  const [errors, setErrors] = useState<{ name?: string; phone?: string; form?: string }>({})
  const [busy, setBusy] = useState(false)

  if (items.length === 0) return (
    <div className="mx-auto max-w-xl px-4 py-12 text-center"><p className="text-muted">Votre panier est vide.</p><Link to="/menu" className="mt-4 inline-flex min-h-11 items-center rounded-control bg-brand px-5 font-bold text-brand-contrast">Voir le menu</Link></div>
  )

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (busy) return
    const next: typeof errors = {}
    if (!name.trim()) next.name = 'Indiquez un nom pour le retrait.'
    if (phone.trim() && !PHONE.test(phone.trim())) next.phone = 'Numéro invalide.'
    setErrors(next)
    if (next.name || next.phone) return
    setBusy(true)
    const r = dispatch(createOrder({ source: 'site', serviceMode: 'a_emporter', items, paymentMethod: method, customerName: name, customerPhone: phone }))
    if (!r.ok) { setBusy(false); setErrors({ form: r.error }); return }
    cartClear('site')
    nav(`/commande/${r.value.id}`, { replace: true })
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 md:grid-cols-[1.3fr_1fr]">
      <form onSubmit={submit} noValidate className="space-y-6">
        <h1 className="font-display text-4xl font-bold">Finaliser la commande</h1>
        {errors.form && <p role="alert" className="rounded-control border border-danger/40 bg-danger-soft p-3 text-danger">{errors.form}</p>}
        <p className="rounded-card border border-line bg-surface p-4 text-sm text-muted"><strong className="text-ink">Commande à emporter</strong> : vous récupérez votre commande au comptoir. Aucune livraison n’est proposée.</p>
        <div>
          <label htmlFor="name" className="label-caps text-muted">Nom pour le retrait *</label>
          <input id="name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" aria-invalid={!!errors.name} aria-describedby={errors.name ? 'name-err' : undefined} className={input} />
          {errors.name && <p id="name-err" className="mt-1 text-sm text-danger">{errors.name}</p>}
        </div>
        <div>
          <label htmlFor="phone" className="label-caps text-muted">Téléphone (facultatif)</label>
          <input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" aria-invalid={!!errors.phone} aria-describedby={errors.phone ? 'phone-err' : undefined} className={input} />
          {errors.phone && <p id="phone-err" className="mt-1 text-sm text-danger">{errors.phone}</p>}
        </div>
        <fieldset>
          <legend className="label-caps mb-2 text-muted">Paiement</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {([['especes', 'Espèces au retrait', 'Réglez au comptoir en récupérant votre commande.'], ['mobile_money', 'Mobile Money (simulé)', 'Paiement simulé — aucun débit réel.']] as const).map(([v, t, d]) => (
              <label key={v} className={cx('cursor-pointer rounded-card border p-4', method === v ? 'border-brand bg-accent-soft' : 'border-line hover:border-brand-strong')}>
                <input type="radio" name="method" value={v} checked={method === v} onChange={() => setMethod(v)} className="mr-2 accent-brand" />
                <span className="font-semibold">{t}</span><span className="mt-1 block text-sm text-muted">{d}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <Button type="submit" size="lg" disabled={busy || cart.hasUnavailable} className="w-full">Valider la commande · {formatFCFA(cart.total)}</Button>
      </form>
      <aside className="h-fit rounded-card border border-line bg-surface p-5" aria-label="Récapitulatif">
        <h2 className="font-display text-xl text-brand">Récapitulatif</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {cart.rows.map((r) => <li key={r.key} className="flex justify-between gap-3"><span>{r.item.quantity} × {r.product?.name ?? 'Produit supprimé'}{r.optionLabels.length > 0 && <span className="text-muted"> (+ {r.optionLabels.join(', ')})</span>}</span><span className="whitespace-nowrap text-muted">{formatFCFA(r.total)}</span></li>)}
        </ul>
        <p className="mt-4 flex justify-between border-t border-line pt-3"><span>Total</span><span className="font-display text-2xl font-semibold text-brand">{formatFCFA(cart.total)}</span></p>
        <Link to="/panier" className="mt-3 inline-block text-sm text-muted underline hover:text-brand">Modifier le panier</Link>
      </aside>
    </div>
  )
}
