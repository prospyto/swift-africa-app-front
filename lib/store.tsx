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
  logout: () => void
  addToCart: (product: Product) => void
  updateQty: (productId: number, qty: number) => void
  removeFromCart: (productId: number) => void
  clearCart: () => void
  cartTotal: number
  cartCount: number
  checkout: (depart: string, arrivee: string) => Promise<Order>
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
  telephone: string
  email: string
  role: Role
  availableRoles?: Role[]
  score?: number
}

function backendMeToUser(me: BackendMe): User {
  return {
    id: Number(me.id) || 0,
    nom: me.nom,
    prenom: me.prenom,
    telephone: me.telephone,
    email: me.email,
    role: me.role,
    availableRoles: me.availableRoles?.length ? me.availableRoles : [me.role],
    score: me.score,
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
      const data = await apiFetch<Product[]>('produits/', { auth: false })
      setProducts(data)
    } catch {
      setProducts([])
    } finally {
      setProductsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

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
    async (depart: string, arrivee: string): Promise<Order> => {
      const res = await apiFetch<Order>('commandes/', {
        method: 'POST',
        body: {
          produits: cart.map((i) => ({ id: i.product.id, quantite: i.quantite })),
          ville_depart: depart,
          ville_arrivee: arrivee,
        },
      })
      setOrders((prev) => [res, ...prev])
      setCart([])
      return res
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
      if (!order?.mission_id) return false
      try {
        await apiFetch(`missions/${order.mission_id}/valider/`, {
          method: 'POST',
          body: { code },
        })
      } catch {
        return false
      }
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, statut: 'livre' as const } : o)),
      )
      return true
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
    login, register, logout,
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

