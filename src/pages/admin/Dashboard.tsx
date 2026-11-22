import { useMemo, useState } from 'react'
import { Banknote, Clock, Receipt, ShoppingBasket } from 'lucide-react'
import { useAppState } from '../../state/store'
import { computeStats, salesByDay, salesByHour } from '../../lib/stats'
import { formatFCFA, formatOrderNumber, formatTime } from '../../lib/format'
import { PAYMENT_METHOD_LABEL, SOURCE_LABEL } from '../../lib/labels'
import { cx } from '../../lib/cx'
import PageHeader from '../../components/ui/PageHeader'
import BarChart from '../../components/BarChart'
import { OrderStatusBadge, PaymentStatusBadge } from '../../components/ui/Badges'

type Period = 'today' | '7d' | '30d'
const PERIODS: [Period, string][] = [['today', 'Aujourd’hui'], ['7d', '7 jours'], ['30d', '30 jours']]
const dayFmt = new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit' })
const longFmt = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'full' })

export default function Dashboard() {
  const { orders, employees, activity } = useAppState()
  const [period, setPeriod] = useState<Period>('7d')
  const [now] = useState(() => new Date())
  const since = useMemo(() => { const d = new Date(now); d.setHours(0, 0, 0, 0); if (period === '7d') d.setDate(d.getDate() - 6); if (period === '30d') d.setDate(d.getDate() - 29); return d }, [period, now])
  const stats = useMemo(() => computeStats(orders, since), [orders, since])
  const live = useMemo(() => computeStats(orders).inProgress, [orders])
  const chart = useMemo(() => period === 'today'
    ? salesByHour(orders, now).map((d) => ({ label: d.label, value: d.revenue }))
    : salesByDay(orders, period === '7d' ? 7 : 30, now).map((d) => ({ label: dayFmt.format(new Date(d.day)), value: d.revenue })), [orders, period, now])
  const recent = orders.slice(0, 6)
  const nameOf = (id?: string) => employees.find((e) => e.id === id)?.name
  const methods = [['especes', stats.byMethod.especes], ['mobile_money', stats.byMethod.mobile_money]] as const
  const maxTop = Math.max(...stats.topProducts.map((p) => p.quantity), 1)

  const kpis = [
    { icon: Banknote, label: 'Chiffre d’affaires encaissé', value: formatFCFA(stats.revenue), note: 'Paiements confirmés, hors commandes annulées' },
    { icon: Receipt, label: 'Commandes', value: String(stats.orderCount), note: 'Hors commandes annulées' },
    { icon: ShoppingBasket, label: 'Panier moyen', value: formatFCFA(stats.averageBasket), note: `Sur ${stats.paidCount} commande${stats.paidCount > 1 ? 's' : ''} payée${stats.paidCount > 1 ? 's' : ''}` },
    { icon: Clock, label: 'En cours maintenant', value: String(live), note: 'Nouvelles + en préparation' },
  ]

  return (
    <div className="pb-10">
      <PageHeader title="Vue d’ensemble" subtitle={longFmt.format(now)} actions={
        <div role="group" aria-label="Période" className="inline-flex rounded-control border border-line p-0.5">
          {PERIODS.map(([v, l]) => <button key={v} type="button" aria-pressed={period === v} onClick={() => setPeriod(v)} className={cx('min-h-9 rounded-[3px] px-3 text-sm font-semibold', period === v ? 'bg-brand text-brand-contrast' : 'text-muted hover:text-brand')}>{l}</button>)}
        </div>} />
      <div className="space-y-6 px-4 md:px-8">
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {kpis.map(({ icon: Icon, label, value, note }) => (
            <li key={label} className="rounded-card border border-line bg-surface p-5">
              <p className="flex items-center gap-2 text-sm text-muted"><Icon size={18} className="text-brand" aria-hidden />{label}</p>
              <p className="mt-3 font-display text-3xl font-semibold text-brand">{value}</p>
              <p className="mt-1 text-xs text-muted">{note}</p>
            </li>
          ))}
        </ul>

        <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
          <section aria-labelledby="sales-title" className="rounded-card border border-line bg-surface p-5">
            <h2 id="sales-title" className="font-display text-xl text-ink">Évolution des ventes</h2>
            <p className="mb-4 text-sm text-muted">{period === 'today' ? 'Par heure, aujourd’hui' : 'Par jour'} — FCFA encaissés</p>
            <BarChart data={chart} ariaLabel="Chiffre d’affaires" />
          </section>
          <section aria-labelledby="pay-title" className="rounded-card border border-line bg-surface p-5">
            <h2 id="pay-title" className="font-display text-xl text-ink">Moyens de paiement</h2>
            {stats.revenue === 0 ? <p role="status" className="py-10 text-center text-muted">Aucun encaissement sur la période.</p> : (
              <>
                <div className="mt-4 flex h-4 overflow-hidden rounded-full bg-surface-raised" role="img" aria-label={methods.map(([m, v]) => `${PAYMENT_METHOD_LABEL[m]} ${Math.round((v / stats.revenue) * 100)} %`).join(', ')}>
                  <div className="bg-brand" style={{ width: `${(stats.byMethod.especes / stats.revenue) * 100}%` }} />
                  <div className="bg-info" style={{ width: `${(stats.byMethod.mobile_money / stats.revenue) * 100}%` }} />
                </div>
                <ul className="mt-4 space-y-2 text-sm">
                  {methods.map(([m, v], i) => <li key={m} className="flex items-center justify-between gap-3"><span className="flex items-center gap-2"><span className={cx('size-3 rounded-sm', i === 0 ? 'bg-brand' : 'bg-info')} aria-hidden />{PAYMENT_METHOD_LABEL[m]}</span><span className="text-muted">{formatFCFA(v)} · {Math.round((v / stats.revenue) * 100)} %</span></li>)}
                </ul>
              </>)}
          </section>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <section aria-labelledby="top-title" className="rounded-card border border-line bg-surface p-5">
            <h2 id="top-title" className="font-display text-xl text-ink">Produits les plus vendus</h2>
            {stats.topProducts.length === 0 ? <p role="status" className="py-8 text-center text-muted">Aucune vente sur la période.</p> : (
              <ol className="mt-4 space-y-3">{stats.topProducts.map((p) => (
                <li key={p.id}><div className="flex justify-between text-sm"><span>{p.name}</span><span className="text-muted">{p.quantity} vendu{p.quantity > 1 ? 's' : ''}</span></div><div className="mt-1 h-2 rounded-full bg-surface-raised"><div className="h-2 rounded-full bg-brand" style={{ width: `${(p.quantity / maxTop) * 100}%` }} /></div></li>
              ))}</ol>)}
          </section>
          <section aria-labelledby="act-title" className="rounded-card border border-line bg-surface p-5">
            <h2 id="act-title" className="font-display text-xl text-ink">Activité récente</h2>
            {activity.length === 0 ? <p role="status" className="py-8 text-center text-muted">Aucune activité.</p> : (
              <ul className="mt-4 space-y-3 text-sm">{activity.slice(0, 6).map((a) => (
                <li key={a.id} className="flex gap-3"><span className="font-display text-muted">{formatTime(a.at)}</span><span>{a.message}{nameOf(a.employeeId) && <span className="block text-xs text-muted">{nameOf(a.employeeId)}</span>}</span></li>
              ))}</ul>)}
          </section>
        </div>

        <section aria-labelledby="recent-title" className="rounded-card border border-line bg-surface p-5">
          <h2 id="recent-title" className="font-display text-xl text-ink">Commandes récentes</h2>
          {recent.length === 0 ? <p role="status" className="py-8 text-center text-muted">Aucune commande.</p> : (
            <ul className="mt-3 divide-y divide-line">{recent.map((o) => (
              <li key={o.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3">
                <span className="w-16 font-display text-lg text-brand">{formatOrderNumber(o.number)}</span>
                <span className="text-sm text-muted">{formatTime(o.createdAt)} · {SOURCE_LABEL[o.source]}</span>
                <span className="ml-auto flex flex-wrap items-center gap-2"><OrderStatusBadge status={o.status} /><PaymentStatusBadge status={o.paymentStatus} /><span className="w-28 text-right font-display text-brand">{formatFCFA(o.total)}</span></span>
              </li>))}</ul>)}
        </section>
      </div>
    </div>
  )
}
