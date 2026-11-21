import type { OrderSource, OrderStatus, PaymentMethod, PaymentStatus, Role, ServiceMode } from '../types'

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  nouvelle: 'Nouvelle', en_preparation: 'En préparation', prete: 'Prête', remise: 'Remise', annulee: 'Annulée',
}
export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  en_attente: 'En attente', paye: 'Payé', echoue: 'Échoué', annule: 'Annulé',
}
export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = { especes: 'Espèces', mobile_money: 'Mobile Money (simulé)' }
export const SOURCE_LABEL: Record<OrderSource, string> = { site: 'Site', borne: 'Borne', caisse: 'Caisse' }
export const SERVICE_MODE_LABEL: Record<ServiceMode, string> = { sur_place: 'Sur place', a_emporter: 'À emporter' }
export const ROLE_LABEL: Record<Role, string> = { administrateur: 'Administrateur', responsable: 'Responsable', caissier: 'Caissier' }
export const DAY_LABEL = ['', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']
export const PENDING_INFO = 'À renseigner'
