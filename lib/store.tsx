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
  fundOrder: (orderId: number) => void
  confirmOtp: (orderId: number, code: string) => boolean
  rateOrder: (orderId: number) => void
}

const AppContext = createContext<AppState | null>(null)

// Convertit la réponse brute de /api/me/ en objet User du frontend
interface BackendMe {
  id: string
  username: string
  email: string
  telephone: string
  est_acheteur: boolean
  est_vendeur: boolean
  est_livreur: boolean
  solde: string
}

function backendMeToUser(me: BackendMe, storedRole?: string | null): User {
  // Déduire le rôle principal
  let role: Role = 'acheteur'
  if (storedRole && ['acheteur', 'vendeur', 'livreur'].includes(storedRole)) {
    role = storedRole as Role
  } else if (me.est_vendeur) {
    role = 'vendeur'
  } else if (me.est_livreur) {
    role = 'livreur'
  }

  // Rôles disponibles
  const availableRoles: Role[] = []
  if (me.est_acheteur) availableRoles.push('acheteur')
  if (me.est_vendeur) availableRoles.push('vendeur')
  if (me.est_livreur) availableRoles.push('livreur')
  if (availableRoles.length === 0) availableRoles.push('acheteur')

  // username peut être "prenom.nom" ou juste email
  const parts = me.username.split('.')
  const prenom = parts.length >= 2 ? parts[0] : me.username.split('@')[0]
  const nom = parts.length >= 2 ? parts.slice(1).join(' ') : ''

  return {
    id: 0, // UUID → number non critique
    nom,
    prenom,
    telephone: me.telephone || '',
    email: me.email,
    role,
    availableRoles,
    score: 4.8,
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
          if (active) setUser(backendMeToUser(me, getStoredRole()))
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

  // ----- auth -----
  const login = useCallback(async (email: string, password: string) => {
    // SimpleJWT attend "username" (qui est l'email dans notre modèle)
    const res = await apiFetch<{ access: string; refresh: string }>('auth/login/', {
      auth: false,
      method: 'POST',
      body: { email, password },
    })
    // Stocker le token provisoirement
    setSession(res.token, 'acheteur')
    // Récupérer le profil réel
    const me = await apiFetch<BackendMe>('auth/me/')
    const userData = backendMeToUser(me, null)
    setSession(res.token, userData.role)
    setUser(userData)
  }, [])

  const register = useCallback(async (payload: RegisterPayload) => {
    // username = email (car SimpleJWT utilise username pour l'auth)
    await apiFetch('utilisateurs/', {
      auth: false,
      method: 'POST',
      body: {
        username: payload.email,
        email: payload.email,
        password: payload.password,
        telephone: payload.telephone,
        est_acheteur: payload.role === 'acheteur',
        est_vendeur: payload.role === 'vendeur',
        est_livreur: payload.role === 'livreur',
      },
    })
    // Connexion automatique
    await login(payload.email, payload.password)
  }, [login])

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

  const fundOrder = useCallback((orderId: number) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, statut: 'finance' as const, livreur: "En cours d'assignation" } : o,
      ),
    )
  }, [])

  const confirmOtp = useCallback(
    (orderId: number, code: string): boolean => {
      const order = orders.find((o) => o.id === orderId)
      if (!order || order.otp !== code) return false
      setOrders((prev) =>
        prev.map((o) => o.id === orderId ? { ...o, statut: 'decaisse' as const } : o),
      )
      return true
    },
    [orders],
  )

  const rateOrder = useCallback((orderId: number) => {
    setOrders((prev) =>
      prev.map((o) => o.id === orderId ? { ...o, note_donnee: true } : o),
    )
  }, [])

  const value: AppState = {
    user, ready, offline, waking, mode, availableRoles, setMode,
    products, productsLoading, refreshProducts: loadProducts, cart, orders,
    login, register, logout,
    addToCart, updateQty, removeFromCart, clearCart,
    cartTotal, cartCount,
    checkout, fundOrder, confirmOtp, rateOrder,
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

