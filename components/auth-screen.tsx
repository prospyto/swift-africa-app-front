'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  Truck, ShieldCheck, Store, ShoppingBag,
  PackageCheck, AlertCircle, Eye, EyeOff,
  Zap, Lock, MapPin, ArrowLeft,
} from 'lucide-react'
import { Spinner } from '@/components/glass'
import { GoogleButton, GOOGLE_CLIENT_ID } from '@/components/google-button'
import { useApp } from '@/lib/store'
import type { Role } from '@/lib/types'
import { ApiError } from '@/lib/api'

const ROLES: { value: Role; label: string; icon: typeof Store; color: string; desc: string }[] = [
  { value: 'acheteur', label: 'Acheteur', icon: ShoppingBag, color: '#3b82f6', desc: 'Commander en toute sécurité' },
  { value: 'vendeur',  label: 'Vendeur',  icon: Store,       color: '#ff6b00', desc: 'Vendre mes produits' },
  { value: 'livreur',  label: 'Livreur',  icon: PackageCheck, color: '#10b981', desc: 'Effectuer des livraisons' },
]

const GMAIL_RE = /^[a-zA-Z0-9._%+-]+@gmail\.com$/
const PHONE_RE = /^\+?\d{8,15}$/

const FEATURES = [
  { icon: ShieldCheck, label: 'Paiement Escrow', color: '#10b981' },
  { icon: Lock,        label: 'Code OTP sécurisé', color: '#3b82f6' },
  { icon: MapPin,      label: 'Suivi GPS temps réel', color: '#ff6b00' },
  { icon: Zap,         label: 'Commission 0% — 2 mois', color: '#8b5cf6' },
]

export function AuthScreen({ onClose }: { onClose?: () => void } = {}) {
  const { login, register, loginWithGoogle } = useApp()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  // Compte Google inconnu : on garde le jeton le temps de choisir un rôle
  const [pendingGoogle, setPendingGoogle] = useState<
    { credential: string; email: string; prenom: string } | null
  >(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPwd, setShowPwd] = useState(false)

  const [form, setForm] = useState({
    nom: '', prenom: '', telephone: '',
    email: '', password: '', role: 'acheteur' as Role,
  })

  const set = (k: keyof typeof form, v: string) =>
    setForm((f) => ({ ...f, [k]: v }))

  const emailValid   = GMAIL_RE.test(form.email)
  const phoneValid   = PHONE_RE.test(form.telephone)
  const passwordValid = form.password.length >= 6

  const valid = useMemo(() => {
    if (mode === 'login') return emailValid && passwordValid
    return emailValid && phoneValid && passwordValid &&
      form.nom.trim().length > 1 && form.prenom.trim().length > 1
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
          nom: form.nom, prenom: form.prenom,
          telephone: form.telephone, email: form.email,
          password: form.password, role: form.role,
        })
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Une erreur est survenue. Réessayez.')
    } finally {
      setLoading(false)
    }
  }

  async function onGoogleCredential(credential: string, role?: Role) {
    if (loading) return
    setLoading(true)
    setError(null)
    try {
      // En mode "Inscription", le rôle est déjà choisi : on l'envoie tout de suite.
      const res = await loginWithGoogle(credential, role ?? (mode === 'register' ? form.role : undefined))
      if (res.needsRole) {
        setMode('register') // la couleur d'accent suit le rôle choisi
        setPendingGoogle({ credential, email: res.email, prenom: res.prenom })
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Une erreur est survenue. Réessayez.')
      setPendingGoogle(null)
    } finally {
      setLoading(false)
    }
  }

  const activeRole = ROLES.find(r => r.value === form.role)
  const accentColor = mode === 'register' ? (activeRole?.color || '#ff6b00') : '#ff6b00'

  return (
    <main
      className="relative flex min-h-screen items-center justify-center overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 40%, #16213e 70%, #0f3460 100%)',
      }}
    >
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="absolute left-4 top-4 z-20 flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/20"
        >
          <ArrowLeft className="size-4" /> Retour au catalogue
        </button>
      )}

      {/* Cercles décoratifs */}
      <div
        className="pointer-events-none absolute -left-40 -top-40 size-[600px] rounded-full opacity-20 blur-3xl transition-all duration-700"
        style={{ backgroundColor: accentColor }}
      />
      <div
        className="pointer-events-none absolute -bottom-40 -right-40 size-[500px] rounded-full opacity-15 blur-3xl transition-all duration-700"
        style={{ backgroundColor: accentColor }}
      />

      <div className="relative z-10 w-full max-w-6xl px-4 py-8 lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center">

        {/* ── PANNEAU GAUCHE — visible desktop uniquement ── */}
        <div className="hidden lg:flex lg:flex-col lg:gap-10">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div
              className="flex size-14 items-center justify-center rounded-2xl shadow-lg"
              style={{ backgroundColor: '#ff6b00', boxShadow: '0 8px 32px #ff6b0050' }}
            >
              <Truck className="size-8 text-white" />
            </div>
            <div>
              <p className="text-2xl font-black text-white">Swift Africa</p>
              <p className="text-sm" style={{ color: '#ff6b00' }}>Trust-as-a-Service</p>
            </div>
          </Link>

          {/* Headline */}
          <div>
            <h1 className="text-5xl font-black leading-tight text-white">
              Le commerce<br />
              <span style={{ color: accentColor }} className="transition-colors duration-500">
                sécurisé
              </span><br />
              en Afrique
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-white/60">
              Achetez, vendez ou livrez — chaque transaction est
              protégée par notre système Escrow unique en Afrique de l'Ouest.
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-3">
            {FEATURES.map((f) => (
              <div
                key={f.label}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm"
              >
                <div
                  className="flex size-9 shrink-0 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${f.color}20` }}
                >
                  <f.icon className="size-4" style={{ color: f.color }} />
                </div>
                <p className="text-sm font-semibold text-white/80">{f.label}</p>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-8">
            {[
              { value: '15', label: 'pays CEDEAO' },
              { value: '10%', label: 'commission seulement' },
              { value: '3min', label: 'pour créer une boutique' },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-3xl font-black" style={{ color: accentColor }}>{s.value}</p>
                <p className="text-xs text-white/50">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── PANNEAU DROIT — formulaire ── */}
        <div
          className="w-full rounded-3xl border border-white/10 bg-white/5 p-7 backdrop-blur-xl md:p-9"
          style={{ boxShadow: '0 32px 64px rgba(0,0,0,0.4)' }}
        >
          {/* Logo mobile */}
          <Link href="/" className="mb-6 flex items-center gap-3 lg:hidden">
            <div
              className="flex size-11 items-center justify-center rounded-2xl"
              style={{ backgroundColor: '#ff6b00' }}
            >
              <Truck className="size-6 text-white" />
            </div>
            <p className="text-xl font-black text-white">Swift Africa</p>
          </Link>

          {/* Titre */}
          <div className="mb-7">
            <h2 className="text-2xl font-black text-white">
              {pendingGoogle
                ? 'Un dernier détail'
                : mode === 'login' ? 'Bon retour' : 'Créer un compte'}
            </h2>
            <p className="mt-1 text-sm text-white/50">
              {pendingGoogle
                ? `Bienvenue${pendingGoogle.prenom ? ` ${pendingGoogle.prenom}` : ''} ! Choisissez votre rôle pour terminer l'inscription.`
                : mode === 'login'
                  ? 'Connectez-vous pour continuer'
                  : 'Rejoignez Swift Africa gratuitement'}
            </p>
          </div>

          {pendingGoogle ? (
            <div className="grid gap-4">
              <p className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">
                Compte Google : <span className="font-semibold text-white">{pendingGoogle.email}</span>
              </p>
              <RolePicker value={form.role} onChange={(r) => set('role', r)} />
              {error && (
                <div className="flex items-center gap-2 rounded-2xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                  <AlertCircle className="size-4 shrink-0" />
                  {error}
                </div>
              )}
              <button
                type="button"
                disabled={loading}
                onClick={() => onGoogleCredential(pendingGoogle.credential, form.role)}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl text-base font-bold text-white transition-all duration-300 disabled:opacity-40"
                style={{ backgroundColor: accentColor, boxShadow: `0 8px 24px ${accentColor}50` }}
              >
                {loading ? <><Spinner /> Veuillez patienter…</> : 'Créer mon compte'}
              </button>
              <button
                type="button"
                onClick={() => { setPendingGoogle(null); setError(null) }}
                className="text-sm text-white/50 transition hover:text-white/80"
              >
                Annuler
              </button>
            </div>
          ) : (
          <>
          {/* Tabs */}
          <div className="mb-6 flex rounded-2xl bg-white/10 p-1">
            {(['login', 'register'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => { setMode(m); setError(null) }}
                className="flex-1 rounded-xl px-4 py-2.5 text-sm font-bold transition-all duration-300"
                style={{
                  backgroundColor: mode === m ? accentColor : 'transparent',
                  color: mode === m ? 'white' : 'rgba(255,255,255,0.5)',
                  boxShadow: mode === m ? `0 4px 16px ${accentColor}60` : 'none',
                }}
              >
                {m === 'login' ? 'Connexion' : 'Inscription'}
              </button>
            ))}
          </div>

          <form onSubmit={onSubmit} className="grid gap-4">

            {/* Champs inscription */}
            {mode === 'register' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <AuthField label="Prénom" value={form.prenom} onChange={(v) => set('prenom', v)} placeholder="Awa" accentColor={accentColor} />
                  <AuthField label="Nom" value={form.nom} onChange={(v) => set('nom', v)} placeholder="Diop" accentColor={accentColor} />
                </div>
                <AuthField
                  label="Téléphone"
                  value={form.telephone}
                  onChange={(v) => set('telephone', v)}
                  placeholder="+229 97 00 00 00"
                  valid={phoneValid}
                  showValidity={form.telephone.length > 0}
                  error="Numéro invalide (8 à 15 chiffres)."
                  accentColor={accentColor}
                />
              </>
            )}

            <AuthField
              label="Adresse Gmail"
              type="email"
              value={form.email}
              onChange={(v) => set('email', v)}
              placeholder="vous@gmail.com"
              valid={emailValid}
              showValidity={form.email.length > 0}
              error="Une adresse @gmail.com est requise."
              accentColor={accentColor}
            />

            {/* Mot de passe avec toggle */}
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-white/70">Mot de passe</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => set('password', e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 pr-12 text-sm text-white outline-none placeholder:text-white/30 focus:ring-2 transition"
                  style={{
                    focusBorderColor: accentColor,
                  } as React.CSSProperties}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition"
                >
                  {showPwd ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {form.password.length > 0 && !passwordValid && (
                <p className="mt-1 text-xs text-red-400">6 caractères minimum.</p>
              )}
            </div>

            {/* Sélection rôle */}
            {mode === 'register' && (
              <RolePicker value={form.role} onChange={(r) => set('role', r)} />
            )}

            {/* Erreur */}
            {error && (
              <div className="flex items-center gap-2 rounded-2xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                <AlertCircle className="size-4 shrink-0" />
                {error}
              </div>
            )}

            {/* Bouton submit */}
            <button
              type="submit"
              disabled={!valid || loading}
              className="mt-1 flex h-12 w-full items-center justify-center gap-2 rounded-2xl text-base font-bold text-white transition-all duration-300 disabled:opacity-40"
              style={{
                backgroundColor: accentColor,
                boxShadow: valid ? `0 8px 24px ${accentColor}50` : 'none',
                transform: valid ? 'scale(1)' : 'scale(0.98)',
              }}
            >
              {loading ? (
                <><Spinner /> Veuillez patienter…</>
              ) : mode === 'login' ? (
                'Se connecter'
              ) : (
                'Créer mon compte'
              )}
            </button>
          </form>

          {/* Connexion / inscription Google (affichée seulement si configurée) */}
          {GOOGLE_CLIENT_ID && (
            <>
              <div className="my-5 flex items-center gap-3">
                <div className="h-px flex-1 bg-white/10" />
                <span className="text-xs text-white/40">ou</span>
                <div className="h-px flex-1 bg-white/10" />
              </div>
              <GoogleButton
                text={mode === 'login' ? 'signin_with' : 'signup_with'}
                disabled={loading}
                onCredential={(c) => onGoogleCredential(c)}
              />
              {mode === 'register' && (
                <p className="mt-2 text-center text-xs text-white/40">
                  Le rôle choisi ci-dessus sera utilisé pour votre compte Google.
                </p>
              )}
            </>
          )}
          </>
          )}
        </div>
      </div>
    </main>
  )
}

function RolePicker({ value, onChange }: { value: Role; onChange: (r: Role) => void }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-white/70">
        Je m'inscris en tant que
      </label>
      <div className="grid grid-cols-3 gap-2">
        {ROLES.map((r) => {
          const active = value === r.value
          const Icon = r.icon
          return (
            <button
              key={r.value}
              type="button"
              onClick={() => onChange(r.value)}
              className="flex flex-col items-center gap-2 rounded-2xl border p-3 text-center transition-all duration-300"
              style={{
                borderColor: active ? r.color : 'rgba(255,255,255,0.1)',
                backgroundColor: active ? `${r.color}20` : 'rgba(255,255,255,0.05)',
                transform: active ? 'scale(1.03)' : 'scale(1)',
                boxShadow: active ? `0 4px 20px ${r.color}40` : 'none',
              }}
            >
              <div
                className="flex size-10 items-center justify-center rounded-xl transition"
                style={{ backgroundColor: active ? `${r.color}30` : 'rgba(255,255,255,0.08)' }}
              >
                <Icon className="size-5" style={{ color: active ? r.color : 'rgba(255,255,255,0.4)' }} />
              </div>
              <span className="text-xs font-bold" style={{ color: active ? r.color : 'rgba(255,255,255,0.5)' }}>
                {r.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function AuthField({
  label, value, onChange, placeholder, type = 'text',
  valid, showValidity, error, accentColor,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
  valid?: boolean
  showValidity?: boolean
  error?: string
  accentColor: string
}) {
  const invalid = showValidity && valid === false
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-white/70">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border bg-white/10 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 transition focus:ring-2"
        style={{
          borderColor: invalid ? '#f87171' : 'rgba(255,255,255,0.1)',
        }}
      />
      {invalid && error && (
        <p className="mt-1 text-xs text-red-400">{error}</p>
      )}
    </div>
  )
}
