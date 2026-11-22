const nf = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0, useGrouping: 'always' })
const dtf = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short', timeStyle: 'short' })
const tf = new Intl.DateTimeFormat('fr-FR', { timeStyle: 'short' })

export const formatFCFA = (n: number) => `${nf.format(Math.round(n))} FCFA`
export const formatOrderNumber = (n: number) => `#${String(n).padStart(3, '0')}`
export const formatDateTime = (iso: string) => dtf.format(new Date(iso))
export const formatTime = (iso: string) => tf.format(new Date(iso))
