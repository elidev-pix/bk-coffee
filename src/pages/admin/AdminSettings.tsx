import { useState, type FormEvent } from 'react'
import type { Establishment } from '../../types'
import { dispatch, useAppState } from '../../state/store'
import { resetAll, updateEstablishment } from '../../state/actions'
import { cartClear } from '../../state/cart'
import { PENDING_INFO } from '../../lib/labels'
import PageHeader from '../../components/ui/PageHeader'
import Button from '../../components/ui/Button'
import Field from '../../components/ui/Field'
import Modal from '../../components/ui/Modal'
import ThemeToggle from '../../components/ThemeToggle'

function EstablishmentForm({ initial }: { initial: Establishment }) {
  const [f, setF] = useState(initial)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const set = (k: keyof Establishment) => (e: { target: { value: string } }) => { setF({ ...f, [k]: e.target.value }); setMsg(null) }
  const submit = (e: FormEvent) => {
    e.preventDefault()
    const r = dispatch(updateEstablishment(f))
    setMsg(r.ok ? { ok: true, text: 'Informations enregistrées.' } : { ok: false, text: r.error })
  }
  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <Field label="Nom de l’établissement" error={msg && !msg.ok ? msg.text : undefined}>{(p) => <input {...p} value={f.name} onChange={set('name')} />}</Field>
      <Field label="Adresse" hint={`Affichée sur le site. Laisser vide : « ${PENDING_INFO} ».`}>{(p) => <input {...p} value={f.address} onChange={set('address')} />}</Field>
      <Field label="Téléphone">{(p) => <input {...p} type="tel" value={f.phone} onChange={set('phone')} />}</Field>
      <Field label="Horaires d’ouverture" hint="Texte libre, par exemple « Lun–Sam 7h–19h ». Ne rien inventer : à renseigner par le gérant.">{(p) => <input {...p} value={f.hours} onChange={set('hours')} />}</Field>
      <div className="flex items-center gap-3"><Button type="submit">Enregistrer</Button>{msg?.ok && <p role="status" className="text-sm text-ok">{msg.text}</p>}</div>
    </form>
  )
}

export default function AdminSettings() {
  const state = useAppState()
  const [confirm, setConfirm] = useState(false)
  const reset = () => { dispatch(resetAll()); cartClear('site'); setConfirm(false) }
  const card = 'rounded-card border border-line bg-surface p-5'
  return (
    <div className="pb-10">
      <PageHeader title="Paramètres" subtitle="Réglages locaux de la démonstration (aucun serveur, aucun secret)." />
      <div className="grid gap-6 px-4 md:px-8 xl:grid-cols-2">
        <section aria-labelledby="etab" className={card}><h2 id="etab" className="mb-4 font-display text-xl">Établissement</h2><EstablishmentForm key={JSON.stringify(state.establishment)} initial={state.establishment} /></section>
        <div className="space-y-6">
          <section aria-labelledby="aff" className={card}>
            <h2 id="aff" className="font-display text-xl">Affichage</h2>
            <p className="mt-1 mb-3 text-sm text-muted">Thème de cette interface sur cet appareil : clair, sombre, ou suivre le réglage du système.</p>
            <ThemeToggle />
          </section>
          <section aria-labelledby="demo" className={card}>
            <h2 id="demo" className="font-display text-xl">Données de démonstration</h2>
            <p className="mt-1 text-sm text-muted">{state.products.length} produits · {state.orders.length} commandes · {state.employees.length} employés. Stockées dans ce navigateur uniquement ; partagées entre onglets du même navigateur, pas entre appareils.</p>
            <Button variant="danger" className="mt-4" onClick={() => setConfirm(true)}>Réinitialiser les données locales</Button>
          </section>
        </div>
      </div>
      <Modal open={confirm} onClose={() => setConfirm(false)} title="Réinitialiser les données ?">
        <p className="text-muted">Les produits, commandes, employés, horaires et le panier du site reviendront aux données de démonstration d’origine. Cette action est définitive.</p>
        <div className="mt-5 flex justify-end gap-3"><Button variant="ghost" onClick={() => setConfirm(false)}>Annuler</Button><Button variant="danger" onClick={reset}>Réinitialiser</Button></div>
      </Modal>
    </div>
  )
}
