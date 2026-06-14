export type Role = 'acheteur' | 'vendeur' | 'livreur'

export interface User {
  id: number
  nom: string
  prenom: string
  telephone: string
  email: string
  role: Role
  /** All roles this account can operate as (multi-role accounts). */
  availableRoles?: Role[]
  score?: number
}

export interface Product {
  id: number
  nom: string
  description: string
  prix: number
  prix_solde?: number | null
  image: string
  categorie: string
  vendeur: string
  ville: string
}

export interface CartItem {
  product: Product
  quantite: number
}

export type OrderStatus =
  | 'en_attente'
  | 'finance'
  | 'en_livraison'
  | 'livre'
  | 'decaisse'

export interface Order {
  id: number
  produits: CartItem[]
  total: number
  statut: OrderStatus
  otp: string
  ville_depart: string
  ville_arrivee: string
  cree_le: string
  livreur?: string | null
  note_donnee?: boolean
}
