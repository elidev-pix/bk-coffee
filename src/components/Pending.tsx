export default function Pending({ title, lot }: { title: string; lot: string }) {
  return (
    <section className="mx-auto max-w-2xl p-8">
      <h1 className="font-display text-3xl text-brand">{title}</h1>
      <p className="mt-3 rounded-card border border-line bg-surface p-4 text-muted shadow-card">
        Écran non encore implémenté ({lot}). La route, le layout et les données partagées sont en place.
      </p>
    </section>
  )
}
