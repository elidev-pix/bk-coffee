/** Emplacement unique du logo. Le logo officiel (Stitch) n'a pas pu être récupéré : à remplacer par <img src="/logo-bk-coffee.png"> ici. */
export default function BrandMark({ className = '' }: { className?: string }) {
  return <span className={`font-display font-bold tracking-tight ${className}`}>BK Coffee</span>
}
