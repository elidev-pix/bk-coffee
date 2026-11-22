import { useEffect, useState } from 'react'
import { Maximize, Minimize } from 'lucide-react'
import logo from '../assets/logo-bk-coffee.webp'
import { useAppState } from '../state/store'
import { cx } from '../lib/cx'

const HIGHLIGHT_MS = 20_000
const num = (n: number) => String(n).padStart(3, '0')
const clock = new Intl.DateTimeFormat('fr-FR', { timeStyle: 'short' })

/** Écran public : uniquement des numéros. Aucune donnée client, aucun paiement, aucune navigation. */
export default function Display() {
  const { orders } = useAppState()
  const [now, setNow] = useState(() => Date.now())
  const [full, setFull] = useState(false)
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    const onFs = () => setFull(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onFs)
    return () => { clearInterval(t); document.removeEventListener('fullscreenchange', onFs) }
  }, [])
  const prep = orders.filter((o) => o.status === 'en_preparation').sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  const ready = orders.filter((o) => o.status === 'prete').sort((a, b) => (b.readyAt ?? '').localeCompare(a.readyAt ?? ''))
  const toggleFs = () => { if (document.fullscreenElement) void document.exitFullscreen(); else void document.documentElement.requestFullscreen().catch(() => undefined) }

  return (
    <div className="relative flex min-h-screen flex-col p-6 md:p-10">
      <img src={logo} alt="" aria-hidden className="pointer-events-none absolute top-1/2 left-1/2 w-[34rem] max-w-[60vw] -translate-x-1/2 -translate-y-1/2 opacity-[0.06]" />
      <div className="relative grid flex-1 gap-8 lg:grid-cols-2">
        <section aria-labelledby="prep-title" className="rounded-card border border-line bg-surface-alt/80 p-8">
          <h1 id="prep-title" className="text-center font-display text-4xl font-bold tracking-wide text-muted uppercase md:text-6xl">En préparation</h1>
          <div className="mx-auto mt-4 h-px w-3/4 bg-line"><div className="mx-auto h-px w-20 bg-brand-strong" /></div>
          {prep.length === 0 ? <p className="mt-16 text-center text-2xl text-muted">Aucune commande en préparation</p>
            : <ul className="mt-10 grid grid-cols-[repeat(auto-fill,minmax(9rem,1fr))] gap-4">{prep.map((o) => (
                <li key={o.id} className="rounded-card border border-line bg-surface-raised py-6 text-center font-display text-5xl font-semibold text-ink md:text-6xl">{num(o.number)}</li>
              ))}</ul>}
        </section>
        <section aria-labelledby="ready-title" aria-live="polite" className="rounded-card border border-brand-strong/40 bg-surface p-8 shadow-card">
          <h2 id="ready-title" className="text-center font-display text-4xl font-bold tracking-wide text-brand uppercase md:text-6xl">Prêtes à récupérer</h2>
          <div className="mx-auto mt-4 h-px w-3/4 bg-line"><div className="mx-auto h-px w-20 bg-brand" /></div>
          {ready.length === 0 ? <p className="mt-16 text-center text-2xl text-muted">Aucune commande prête</p>
            : <ul className="mt-10 grid grid-cols-[repeat(auto-fill,minmax(11rem,1fr))] gap-4">{ready.map((o) => {
                const fresh = !!o.readyAt && now - new Date(o.readyAt).getTime() < HIGHLIGHT_MS
                return (
                  <li key={o.id} className={cx('rounded-card border-2 border-brand py-8 text-center font-display text-6xl font-bold text-brand md:text-8xl', fresh ? 'animate-ready-glow bg-accent-soft' : 'bg-surface-alt')}>
                    {num(o.number)}{fresh && <span className="label-caps mt-1 block text-base text-ink">Nouvelle</span>}
                  </li>
                )
              })}</ul>}
        </section>
      </div>
      <div className="relative mt-4 flex items-center justify-between text-muted">
        <time className="font-display text-2xl" dateTime={new Date(now).toISOString()}>{clock.format(now)}</time>
        <button type="button" onClick={toggleFs} aria-label={full ? 'Quitter le plein écran' : 'Passer en plein écran'} className="rounded-control p-2 opacity-40 transition-opacity hover:opacity-100 focus-visible:opacity-100">{full ? <Minimize size={22} aria-hidden /> : <Maximize size={22} aria-hidden />}</button>
      </div>
    </div>
  )
}
