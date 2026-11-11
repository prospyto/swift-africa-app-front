'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  apiFetch,
  clearSession,
  getStoredRole,
  getToken,
  setSession,
} from './api'
import type { CartItem, Order, Product, Role, User } from './types'

interface RegisterPayload {
  nom: string
  prenom: string
  telephone: string
  email: string
  role: Role
  password: string
}

const ALL_ROLES: Role[] = ['acheteur', 'vendeur', 'livreur']
const CART_KEY = 'sa_cart'

/** Résultat de la connexion Google : soit connecté, soit il faut choisir un rôle. */
export type GoogleLoginResult =
  | { needsRole: false }
  | { needsRole: true; email: string; prenom: string; nom: string }

interface AppState {
  user: User | null
  ready: boolean
  offline: boolean
  waking: boolean
  mode: Role
  availableRoles: Role[]
  setMode: (role: Role) => void
  products: Product[]
  productsLoading: boolean
  refreshProducts: () => Promise<void>
  cart: CartItem[]
  orders: Order[]
  refreshOrders: () => Promise<void>
  login: (email: string, password: string) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  loginWithGoogle: (credential: string, role?: Role) => Promise<GoogleLoginResult>
  logout: () => void
  addToCart: (product: Product) => void
  updateQty: (productId: number, qty: number) => void
  removeFromCart: (productId: number) => void
  clearCart: () => void
  cartTotal: number
  cartCount: number
  /** Une commande par boutique : renvoie les commandes créées. */
  checkout: (adresse: string, ville: string, etiquette?: string) => Promise<Order[]>
  fundOrder: (orderId: number) => Promise<void>
  confirmOtp: (orderId: number, code: string) => Promise<boolean>
  decaisserOrder: (orderId: number) => Promise<void>
  rateOrder: (orderId: number) => void
}

const AppContext = createContext<AppState | null>(null)

// Convertit la réponse brute de /api/me/ en objet User du frontend
interface BackendMe {
  id: string
  nom: string
  prenom: string
  // null pour les comptes créés via Google (pas de numéro à l'inscription)
  telephone: string | null
  email: string
  role: Role
  availableRoles?: Role[]
  score?: number
  scores?: Partial<Record<Role, number>>
  a_mot_de_passe?: boolean
}

function backendMeToUser(me: BackendMe): User {
  return {
    id: Number(me.id) || 0,
    nom: me.nom,
    prenom: me.prenom,
    telephone: me.telephone ?? '',
    email: me.email,
    role: me.role,
    availableRoles: me.availableRoles?.length ? me.availableRoles : [me.role],
    score: me.score,
    scores: me.scores,
    a_mot_de_passe: me.a_mot_de_passe,
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [ready, setReady] = useState(false)
  const [offline, setOffline] = useState(false)
  const [waking, setWaking] = useState(false)
  const [mode, setMode] = useState<Role>('acheteur')
  const [products, setProducts] = useState<Product[]>([])
  const [productsLoading, setProductsLoading] = useState(true)
  const [cart, setCart] = useState<CartItem[]>([])
  // Le panier est lu après le premier rendu (localStorage n'existe pas côté
  // serveur) ; on n'écrit qu'une fois cette lecture faite, sinon le panier
  // sauvegardé serait écrasé par un panier vide.
  const [cartLoaded, setCartLoaded] = useState(false)
  const [orders, setOrders] = useState<Order[]>([])

  const availableRoles = useMemo<Role[]>(() => {
    if (!user) return ALL_ROLES
    return user.availableRoles && user.availableRoles.length > 0
      ? user.availableRoles
      : [user.role]
  }, [user])

  // mode pilote l'affichage (onglets, espace). Sans cette synchro,
  // mode reste figé sur sa valeur initiale 'acheteur' même après
  // connexion d'un vendeur ou d'un livreur, et l'app affiche les
  // onglets/contenus du mauvais rôle.
  useEffect(() => {
    if (user) setMode(user.role)
  }, [user])

  // ----- events -----
  useEffect(() => {
    function onUnauthorized() {
      setUser(null)
      clearSession()
    }
    function onOffline() {
      setOffline(true)
      setWaking(false)
    }
    function onWaking() { setWaking(true) }
    function onAwake() { setWaking(false) }

    window.addEventListener('sa:unauthorized', onUnauthorized)
    window.addEventListener('sa:offline', onOffline)
    window.addEventListener('sa:waking', onWaking)
    window.addEventListener('sa:awake', onAwake)
    return () => {
      window.removeEventListener('sa:unauthorized', onUnauthorized)
      window.removeEventListener('sa:offline', onOffline)
      window.removeEventListener('sa:waking', onWaking)
      window.removeEventListener('sa:awake', onAwake)
    }
  }, [])

  // ----- session bootstrap -----
  useEffect(() => {
    let active = true
    async function bootstrap() {
      const token = getToken()
      if (token) {
        try {
          const me = await apiFetch<BackendMe>('auth/me/')
          if (active) setUser(backendMeToUser(me))
        } catch {
          clearSession()
        }
      }
      if (active) setReady(true)
    }
    bootstrap()
    return () => { active = false }
  }, [])

  // ----- products -----
  const loadProducts = useCallback(async () => {
    setProductsLoading(true)
    try {
      // L'API renvoie `vendeur` = identifiant et `vendeur_nom` = nom de la boutique.
      type Brut = Omit<Product, 'vendeur' | 'vendeur_id'> & { vendeur: number | string | null; vendeur_nom?: string | null }
      const data = await apiFetch<Brut[]>('produits/', { auth: false })
      setProducts(
        data.map((p) => ({
          ...p,
          vendeur: p.vendeur_nom ?? (typeof p.vendeur === 'string' ? p.vendeur : ''),
          vendeur_id: typeof p.vendeur === 'number' ? p.vendeur : null,
        })),
      )
    } catch {
      setProducts([])
    } finally {
      setProductsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  // ----- panier : sauvegarde dans le navigateur (visiteur ou connecté) -----
  useEffect(() => {
    try {
      const raw = localStorage.getItem(CART_KEY)
      if (raw) {
        const saved = JSON.parse(raw)
        if (Array.isArray(saved)) {
          setCart(saved.filter((i) => i?.product?.id != null && i.quantite > 0))
        }
      }
    } catch {
      // stockage indisponible ou contenu illisible : on part d'un panier vide
    }
    setCartLoaded(true)
  }, [])

  useEffect(() => {
    if (!cartLoaded) return
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart))
    } catch {
      // navigation privée / quota : le panier reste en mémoire seulement
    }
  }, [cart, cartLoaded])

  // Remet à jour prix et noms depuis le catalogue frais, et retire les
  // produits qui n'existent plus (le panier sauvegardé peut dater).
  useEffect(() => {
    if (!cartLoaded || productsLoading || products.length === 0) return
    setCart((prev) => {
      const next = prev
        .map((i) => {
          const fresh = products.find((p) => p.id === i.product.id)
          return fresh ? { ...i, product: fresh } : null
        })
        .filter((i): i is CartItem => i !== null)
      const same =
        next.length === prev.length &&
        next.every((n, idx) => n.product === prev[idx].product && n.quantite === prev[idx].quantite)
      return same ? prev : next
    })
  }, [products, productsLoading, cartLoaded])

  // ----- orders (fetch au login et toutes les 30s) -----
  const loadOrders = useCallback(async () => {
    if (!getToken()) return
    try {
      const data = await apiFetch<Order[]>('commandes/')
      setOrders(data)
    } catch {
      // silencieux : on garde les commandes en mémoire si le fetch échoue
    }
  }, [])

  useEffect(() => {
    if (!user) return
    loadOrders()
    const interval = setInterval(loadOrders, 30_000)
    return () => clearInterval(interval)
  }, [user, loadOrders])

  // ----- auth -----
  const login = useCallback(async (email: string, password: string) => {
    const res = await apiFetch<{ token: string; refresh: string; user: BackendMe }>('auth/login/', {
      auth: false,
      method: 'POST',
      body: { email, password },
    })
    const userData = backendMeToUser(res.user)
    setSession(res.token, userData.role)
    setUser(userData)
  }, [])

  const register = useCallback(async (payload: RegisterPayload) => {
    const res = await apiFetch<{ token: string; refresh: string; user: BackendMe }>('auth/register/', {
      auth: false,
      method: 'POST',
      body: {
        nom: payload.nom,
        prenom: payload.prenom,
        telephone: payload.telephone,
        email: payload.email,
        role: payload.role,
        password: payload.password,
      },
    })
    const userData = backendMeToUser(res.user)
    setSession(res.token, userData.role)
    setUser(userData)
  }, [])

  const loginWithGoogle = useCallback(
    async (credential: string, role?: Role): Promise<GoogleLoginResult> => {
      const res = await apiFetch<
        | { needs_role: true; email: string; prenom: string; nom: string }
        | { token: string; refresh: string; user: BackendMe }
      >('auth/google/', {
        auth: false,
        method: 'POST',
        body: { credential, role },
      })
      if ('needs_role' in res) {
        return { needsRole: true, email: res.email, prenom: res.prenom, nom: res.nom }
      }
      const userData = backendMeToUser(res.user)
      setSession(res.token, userData.role)
      setUser(userData)
      return { needsRole: false }
    },
    [],
  )

  const logout = useCallback(() => {
    clearSession()
    setUser(null)
    setCart([])
    setOrders([])
  }, [])

  // ----- cart -----
  const addToCart = useCallback((product: Product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id)
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id
            ? { ...i, quantite: i.quantite + 1 }
            : i,
        )
      }
      return [...prev, { product, quantite: 1 }]
    })
  }, [])

  const updateQty = useCallback((productId: number, qty: number) => {
    setCart((prev) =>
      prev
        .map((i) => i.product.id === productId ? { ...i, quantite: Math.max(0, qty) } : i)
        .filter((i) => i.quantite > 0),
    )
  }, [])

  const removeFromCart = useCallback((productId: number) => {
    setCart((prev) => prev.filter((i) => i.product.id !== productId))
  }, [])

  const clearCart = useCallback(() => setCart([]), [])

  const cartTotal = useMemo(
    () => cart.reduce((sum, i) => sum + (i.product.prix_solde ?? i.product.prix) * i.quantite, 0),
    [cart],
  )
  const cartCount = useMemo(
    () => cart.reduce((sum, i) => sum + i.quantite, 0),
    [cart],
  )

  // ----- orders -----
  const checkout = useCallback(
    async (adresse: string, ville: string, etiquette?: string): Promise<Order[]> => {
      // Règle : une commande = une boutique. On scinde le panier par boutique.
      const groupes = new Map<string, CartItem[]>()
      for (const item of cart) {
        const cle = String(item.product.vendeur_id ?? item.product.vendeur)
        groupes.set(cle, [...(groupes.get(cle) ?? []), item])
      }
      const label = (etiquette ?? '').trim()
      const crees: Order[] = []
      try {
        for (const items of groupes.values()) {
          const boutique = items[0].product.vendeur
          const nom = label
            ? (groupes.size > 1 && boutique ? `${label} · ${boutique}` : label).slice(0, 80)
            : ''
          // Ville de départ : celle du premier produit de la boutique ; sinon le
          // backend prend la ville d'arrivée.
          const villeDepart = items[0].product.ville
          const res = await apiFetch<Order>('commandes/', {
            method: 'POST',
            body: {
              produits: items.map((i) => ({ id: i.product.id, quantite: i.quantite })),
              ville_arrivee: ville,
              adresse_livraison: adresse,
              ...(nom ? { etiquette: nom } : {}),
              ...(villeDepart ? { ville_depart: villeDepart } : {}),
            },
          })
          crees.push(res)
          // on retire du panier ce qui est commandé, pour ne jamais commander deux fois
          const ids = new Set(items.map((i) => i.product.id))
          setCart((prev) => prev.filter((i) => !ids.has(i.product.id)))
        }
      } catch (err) {
        if (crees.length > 0) setOrders((prev) => [...crees.reverse(), ...prev])
        const reste = err instanceof Error ? err.message : 'Erreur lors de la commande'
        throw new Error(
          crees.length > 0
            ? `${crees.length} commande(s) passée(s), mais une boutique a échoué : ${reste} Elle reste dans votre panier.`
            : reste,
        )
      }
      setOrders((prev) => [...crees.slice().reverse(), ...prev])
      return crees
    },
    [cart],
  )

  const fundOrder = useCallback(async (orderId: number) => {
    const res = await apiFetch<Order>(`commandes/${orderId}/financer/`, { method: 'POST' })
    setOrders((prev) => prev.map((o) => (o.id === orderId ? res : o)))
  }, [])

  const confirmOtp = useCallback(
    async (orderId: number, code: string): Promise<boolean> => {
      const order = orders.find((o) => o.id === orderId)
      // Si mission_id manque, on ne peut pas valider
      if (!order?.mission_id) {
        console.error('confirmOtp: mission_id manquant sur la commande', orderId)
        return false
      }
      try {
        const res = await apiFetch<{ status: string; commande?: Order }>(
          `missions/${order.mission_id}/valider/`,
          { method: 'POST', body: { code } },
        )
        // Mettre à jour la commande avec les données fraîches du backend
        if (res.commande) {
          setOrders((prev) =>
            prev.map((o) => (o.id === orderId ? res.commande! : o)),
          )
        } else {
          setOrders((prev) =>
            prev.map((o) => (o.id === orderId ? { ...o, statut: 'livre' as const } : o)),
          )
        }
        return res.status === 'success'
      } catch {
        return false
      }
    },
    [orders],
  )

  const decaisserOrder = useCallback(async (orderId: number) => {
    const res = await apiFetch<Order>(`commandes/${orderId}/decaisser/`, { method: 'POST' })
    setOrders((prev) => prev.map((o) => (o.id === orderId ? res : o)))
  }, [])

  const rateOrder = useCallback((orderId: number) => {
    setOrders((prev) =>
      prev.map((o) => o.id === orderId ? { ...o, note_donnee: true } : o),
    )
  }, [])

  const value: AppState = {
    user, ready, offline, waking, mode, availableRoles, setMode,
    products, productsLoading, refreshProducts: loadProducts, cart, orders, refreshOrders: loadOrders,
    login, register, loginWithGoogle, logout,
    addToCart, updateQty, removeFromCart, clearCart,
    cartTotal, cartCount,
    checkout, fundOrder, confirmOtp, decaisserOrder, rateOrder,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}

export function formatXOF(value: number) {
  return new Intl.NumberFormat('fr-FR').format(value) + ' FCFA'
}

