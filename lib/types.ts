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
  /** Note moyenne reçue (sur 5) par rôle ; 0 = aucune note. */
  scores?: Partial<Record<Role, number>>
  /** false = compte créé avec Google, sans mot de passe */
  a_mot_de_passe?: boolean
}

export interface Product {
  id: number
  nom: string
  description: string
  prix: number
  prix_solde?: number | null
  image: string
  image_url?: string | null
  categorie: string
  vendeur: string
  /** identifiant de la boutique (page publique /boutique) */
  vendeur_id?: number | null
  ville: string
  allee?: number | null
  allee_nom?: string | null
  /** null = non suivi, 1 = pièce unique, 0 = épuisé */
  stock?: number | null
  /** ajouté en lot, pas encore publié */
  brouillon?: boolean
}

export interface Boutique {
  id: number
  /** identifiant lisible de l'adresse publique : /boutique/<slug> */
  slug?: string
  nom: string
  description: string
  adresse_point_vente?: string | null
  nb_produits: number
  villes: string[]
  allees?: { id: number; nom: string; nb_produits: number }[]
  logo_url?: string | null
  banniere_url?: string | null
  en_vacances?: boolean
  note_moyenne?: number | null
  nb_avis?: number
}

export interface Allee {
  id: number
  nom: string
  ordre: number
  nb_produits: number
}

export interface MaBoutique {
  id: number
  slug?: string
  boutique: string
  description: string
  adresse_point_vente: string | null
  logo_url?: string | null
  banniere_url?: string | null
  numero_paiement?: string
  operateur_paiement?: '' | 'MTN' | 'MOOV'
  en_vacances?: boolean
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
  /** montant payé : produits + livraison */
  total: number
  frais_livraison?: number
  /** nom donné par l'acheteur pour retrouver sa commande */
  etiquette?: string
  statut: OrderStatus
  otp: string
  ville_depart: string
  ville_arrivee: string
  cree_le: string
  livreur?: string | null
  mission_id?: number | null
  note_donnee?: boolean
}
