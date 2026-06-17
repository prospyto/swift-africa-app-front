'use client'

import { useMemo, useState } from 'react'
import {
  Truck,
  ShieldCheck,
  Store,
  ShoppingBag,
  PackageCheck,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GlassCard, Spinner } from '@/components/glass'
import { useApp } from '@/lib/store'
import type { Role } from '@/lib/types'
import { ApiError } from '@/lib/api'

const ROLES: { value: Role; label: string; icon: typeof Store; desc: string }[] =
  [
    {
      value: 'acheteur',
      label: 'Acheteur',
      icon: ShoppingBag,
      desc: 'Acheter en toute sécurité',
    },
    {
      value: 'vendeur',
      label: 'Vendeur',
      icon: Store,
      desc: 'Vendre mes meubles',
    },
    {
      value: 'livreur',
      label: 'Livreur',
      icon: PackageCheck,
      desc: 'Effectuer des livraisons',
    },
  ]

const GMAIL_RE = /^[a-zA-Z0-9._%+-]+@gmail\.com$/
const PHONE_RE = /^\+?\d{8,15}$/

export function AuthScreen() {
  const { login, register } = useApp()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    nom: '',
    prenom: '',
    telephone: '',
    email: '',
    password: '',
    role: 'acheteur' as Role,
  })

  const set = (k: keyof typeof form, v: string) =>
    setForm((f) => ({ ...f, [k]: v }))

  const emailValid = GMAIL_RE.test(form.email)
  const phoneValid = PHONE_RE.test(form.telephone)
  const passwordValid = form.password.length >= 6

  const valid = useMemo(() => {
    if (mode === 'login') return emailValid && passwordValid
    return (
      emailValid &&
      phoneValid &&
      passwordValid &&
      form.nom.trim().length > 1 &&
      form.prenom.trim().length > 1
    )
  }, [mode, emailValid, phoneValid, passwordValid, form.nom, form.prenom])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!valid || loading) return
    setLoading(true)
    setError(null)
    try {
      if (mode === 'login') {
        await login(form.email, form.password)
      } else {
        await register({
          nom: form.nom,
          prenom: form.prenom,
          telephone: form.telephone,
          email: form.email,
          password: form.password,
          role: form.role,
        })
      }
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Une erreur est survenue. Réessayez.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4 md:p-8">
      <div className="grid w-full max-w-5xl gap-6 lg:grid-cols-2">
        {/* Brand panel */}
        <GlassCard
          strong
          className="hidden flex-col justify-between p-10 lg:flex"
        >
          <div>
            <div className="flex items-center gap-3">
              <div className="glass-cta flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                <Truck className="size-6" />
              </div>
              <span className="text-2xl font-bold tracking-tight">
                Swift Africa
              </span>
            </div>
            <h1 className="mt-10 text-balance text-4xl font-bold leading-tight">
              Mobilier haut de gamme, livré en toute confiance.
            </h1>
            <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
              Achat universel, paiement sécurisé par Escrow OTP et suivi de
              livraison en temps réel à travers l&apos;Afrique de l&apos;Ouest.
            </p>
          </div>
          <ul className="mt-10 grid gap-4">
            {[
              {
                icon: ShieldCheck,
                t: 'Paiement Escrow',
                d: 'Vos fonds sont libérés uniquement à la livraison.',
              },
              {
                icon: PackageCheck,
                t: 'Code OTP de sécurité',
                d: 'Un code à 4 chiffres valide chaque remise.',
              },
              {
                icon: Truck,
                t: 'Suivi GPS en direct',
                d: 'Localisez votre livreur en temps réel.',
              },
            ].map((f) => (
              <li key={f.t} className="flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-success/15 text-success">
                  <f.icon className="size-5" />
                </div>
                <div>
                  <p className="font-semibold">{f.t}</p>
                  <p className="text-sm text-muted-foreground">{f.d}</p>
                </div>
              </li>
            ))}
          </ul>
        </GlassCard>

        {/* Form panel */}
        <GlassCard strong className="p-7 md:p-9">
          <div className="mb-6 flex items-center gap-3 lg:hidden">
            <div className="glass-cta flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <Truck className="size-5" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              Swift Africa
            </span>
          </div>

          {/* Tabs */}
          <div className="glass mb-7 flex rounded-2xl p-1">
            {(['login', 'register'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMode(m)
                  setError(null)
                }}
                className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                  mode === m
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {m === 'login' ? 'Connexion' : 'Inscription'}
              </button>
            ))}
          </div>

          {/* Demo mode badge - REMOVED */}

          <form onSubmit={onSubmit} className="grid gap-4">
            {mode === 'register' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <Field
                    label="Prénom"
                    value={form.prenom}
                    onChange={(v) => set('prenom', v)}
                    placeholder="Awa"
                  />
                  <Field
                    label="Nom"
                    value={form.nom}
                    onChange={(v) => set('nom', v)}
                    placeholder="Diop"
                  />
                </div>
                <Field
                  label="Téléphone"
                  value={form.telephone}
                  onChange={(v) => set('telephone', v)}
                  placeholder="+221 77 000 00 00"
                  valid={phoneValid}
                  showValidity={form.telephone.length > 0}
                  error="Numéro invalide (8 à 15 chiffres)."
                />
              </>
            )}

            <Field
              label="Adresse Gmail"
              type="email"
              value={form.email}
              onChange={(v) => set('email', v)}
              placeholder="vous@gmail.com"
              valid={emailValid}
              showValidity={form.email.length > 0}
              error="Une adresse @gmail.com est requise."
            />

            <Field
              label="Mot de passe"
              type="password"
              value={form.password}
              onChange={(v) => set('password', v)}
              placeholder="••••••••"
              valid={passwordValid}
              showValidity={form.password.length > 0}
              error="6 caractères minimum."
            />

            {mode === 'register' && (
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Je m&apos;inscris en tant que
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {ROLES.map((r) => {
                    const active = form.role === r.value
                    return (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => set('role', r.value)}
                        className={`flex flex-col items-center gap-1.5 rounded-2xl border p-3 text-center transition ${
                          active
                            ? 'border-primary bg-primary/10 text-foreground'
                            : 'border-border bg-secondary text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <r.icon
                          className={`size-5 ${active ? 'text-primary' : ''}`}
                        />
                        <span className="text-xs font-semibold">{r.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
                <AlertCircle className="size-4 shrink-0" />
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={!valid || loading}
              className="glass-cta mt-2 h-12 rounded-2xl bg-primary text-base font-semibold text-primary-foreground hover:bg-primary/90"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Spinner /> Veuillez patienter…
                </span>
              ) : mode === 'login' ? (
                'Se connecter'
              ) : (
                'Créer mon compte'
              )}
            </Button>
          </form>
        </GlassCard>
      </div>
    </main>
  )
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  valid,
  showValidity,
  error,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
  valid?: boolean
  showValidity?: boolean
  error?: string
}) {
  const invalid = showValidity && valid === false
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full rounded-2xl border bg-input px-4 py-3 text-sm outline-none transition placeholder:text-muted-foreground/70 focus:ring-2 ${
          invalid
            ? 'border-destructive/60 focus:ring-destructive/30'
            : 'border-border focus:border-primary focus:ring-primary/30'
        }`}
      />
      {invalid && error && (
        <p className="mt-1 text-xs text-destructive">{error}</p>
      )}
    </div>
  )
}
