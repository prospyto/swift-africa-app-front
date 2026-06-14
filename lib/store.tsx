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
  isOfflineError,
  setSession,
} from './api'
import { DEMO_PRODUCTS } from './demo-data'
import type { CartItem, Order, Product, Role, User } from './types'

const DEMO_ORDERS_KEY = 'sa_demo_orders'

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
  mode: Role
  availableRoles: Role[]
  setMode: (role: Role) => void
  products: Product[]
  productsLoading: boolean
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

function genOtp() {
  return String(Math.floor(1000 + Math.random() * 9000))
}

function loadDemoOrders(): Order[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(DEMO_ORDERS_KEY) || '[]')
  } catch {
    return []
  }
}

function saveDemoOrders(orders: Order[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(DEMO_ORDERS_KEY, JSON.stringify(orders))
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [ready, setReady] = useState(false)
  const [offline, setOffline] = useState(false)
  const [mode, setMode] = useState<Role>('acheteur')
  const [products, setProducts] = useState<Product[]>([])
  const [productsLoading, setProductsLoading] = useState(true)
  const [cart, setCart] = useState<CartItem[]>([])
  const [orders, setOrders] = useState<Order[]>([])

  // ----- session bootstrap -----
  useEffect(() => {
    function onUnauthorized() {
      setUser(null)
      clearSession()
    }
    function onOffline() {
      setOffline(true)
    }
    window.addEventListener('sa:unauthorized', onUnauthorized)
    window.addEventListener('sa:offline', onOffline)
    return () => {
      window.removeEventListener('sa:unauthorized', onUnauthorized)
      window.removeEventListener('sa:offline', onOffline)
    }
  }, [])

  useEffect(() => {
    let active = true
    async function bootstrap() {
      const token = getToken()
      if (token) {
        try {
          const me = await apiFetch<User>('auth/me/')
          if (active) setUser(me)
        } catch (err) {
          if (isOfflineError(err)) {
            // restore a lightweight demo user from stored role
            const role = (getStoredRole() as Role) || 'acheteur'
            if (active)
              setUser({
                id: 0,
                nom: 'Démo',
                prenom: 'Utilisateur',
                telephone: '+221770000000',
                email: 'demo@gmail.com',
                role,
                score: 4.8,
              })
          } else {
            clearSession()
          }
        }
      }
      if (active) setReady(true)
    }
    bootstrap()
    return () => {
      active = false
    }
  }, [])

  // ----- products -----
  const loadProducts = useCallback(async () => {
    setProductsLoading(true)
    try {
      const data = await apiFetch<Product[]>('produits/', { auth: false })
      setProducts(data)
    } catch (err) {
      if (isOfflineError(err)) {
        setOffline(true)
        setProducts(DEMO_PRODUCTS)
      } else {
        setProducts(DEMO_PRODUCTS)
      }
    } finally {
      setProductsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProducts()
    setOrders(loadDemoOrders())
  }, [loadProducts])

  // ----- auth -----
  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await apiFetch<{ token: string; user: User }>('auth/login/', {
        auth: false,
        method: 'POST',
        body: { email, password },
      })
      setSession(res.token, res.user.role)
      setUser(res.user)
    } catch (err) {
      if (isOfflineError(err)) {
        // demo login: infer role from any stored value, default acheteur
        const role = (getStoredRole() as Role) || 'acheteur'
        const demoUser: User = {
          id: 0,
          nom: 'Démo',
          prenom: 'Utilisateur',
          telephone: '+221770000000',
          email,
          role,
          score: 4.8,
        }
        setSession('demo-token', role)
        setUser(demoUser)
        setOffline(true)
        return
      }
      throw err
    }
  }, [])

  const register = useCallback(async (payload: RegisterPayload) => {
    try {
      const res = await apiFetch<{ token: string; user: User }>(
        'auth/register/',
        { auth: false, method: 'POST', body: payload },
      )
      setSession(res.token, res.user.role)
      setUser(res.user)
    } catch (err) {
      if (isOfflineError(err)) {
        const demoUser: User = {
          id: 0,
          nom: payload.nom,
          prenom: payload.prenom,
          telephone: payload.telephone,
          email: payload.email,
          role: payload.role,
          score: 5,
        }
        setSession('demo-token', payload.role)
        setUser(demoUser)
        setOffline(true)
        return
      }
      throw err
    }
  }, [])

  const logout = useCallback(() => {
    clearSession()
    setUser(null)
    setCart([])
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
        .map((i) =>
          i.product.id === productId ? { ...i, quantite: Math.max(0, qty) } : i,
        )
        .filter((i) => i.quantite > 0),
    )
  }, [])

  const removeFromCart = useCallback((productId: number) => {
    setCart((prev) => prev.filter((i) => i.product.id !== productId))
  }, [])

  const clearCart = useCallback(() => setCart([]), [])

  const cartTotal = useMemo(
    () =>
      cart.reduce(
        (sum, i) => sum + (i.product.prix_solde ?? i.product.prix) * i.quantite,
        0,
      ),
    [cart],
  )
  const cartCount = useMemo(
    () => cart.reduce((sum, i) => sum + i.quantite, 0),
    [cart],
  )

  // ----- orders / escrow -----
  const persistOrders = useCallback((next: Order[]) => {
    setOrders(next)
    saveDemoOrders(next)
  }, [])

  const checkout = useCallback(
    async (depart: string, arrivee: string): Promise<Order> => {
      const newOrder: Order = {
        id: Date.now(),
        produits: cart,
        total: cartTotal,
        statut: 'en_attente',
        otp: genOtp(),
        ville_depart: depart,
        ville_arrivee: arrivee,
        cree_le: new Date().toISOString(),
        livreur: null,
        note_donnee: false,
      }
      try {
        const res = await apiFetch<Order>('commandes/', {
          method: 'POST',
          body: {
            produits: cart.map((i) => ({
              id: i.product.id,
              quantite: i.quantite,
            })),
            ville_depart: depart,
            ville_arrivee: arrivee,
          },
        })
        persistOrders([res, ...orders])
        setCart([])
        return res
      } catch (err) {
        if (isOfflineError(err)) {
          persistOrders([newOrder, ...orders])
          setCart([])
          return newOrder
        }
        throw err
      }
    },
    [cart, cartTotal, orders, persistOrders],
  )

  const fundOrder = useCallback(
    (orderId: number) => {
      persistOrders(
        orders.map((o) =>
          o.id === orderId
            ? { ...o, statut: 'finance', livreur: 'Moussa D.' }
            : o,
        ),
      )
    },
    [orders, persistOrders],
  )

  const confirmOtp = useCallback(
    (orderId: number, code: string): boolean => {
      const order = orders.find((o) => o.id === orderId)
      if (!order || order.otp !== code) return false
      persistOrders(
        orders.map((o) =>
          o.id === orderId ? { ...o, statut: 'decaisse' } : o,
        ),
      )
      return true
    },
    [orders, persistOrders],
  )

  const rateOrder = useCallback(
    (orderId: number) => {
      persistOrders(
        orders.map((o) =>
          o.id === orderId ? { ...o, note_donnee: true } : o,
        ),
      )
    },
    [orders, persistOrders],
  )

  const value: AppState = {
    user,
    ready,
    offline,
    products,
    productsLoading,
    cart,
    orders,
    login,
    register,
    logout,
    addToCart,
    updateQty,
    removeFromCart,
    clearCart,
    cartTotal,
    cartCount,
    checkout,
    fundOrder,
    confirmOtp,
    rateOrder,
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
