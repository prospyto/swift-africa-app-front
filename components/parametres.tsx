'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, Check, Copy, ExternalLink, ImagePlus, KeyRound, Link2, LogOut, MessageCircle, Store, Trash2, Wallet } from 'lucide-react'
import { GlassCard, Spinner } from '@/components/glass'
import { Button } from '@/components/ui/button'
import { apiFetch, ApiError } from '@/lib/api'
import { multipartFetch } from '@/lib/api-multipart'
import { useApp } from '@/lib/store'
import type { MaBoutique } from '@/lib/types'

const champ =
  'w-full rounded-xl border border-border bg-input px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30'

const erreurDe = (e: unknown) =>
  e instanceof ApiError ? e.message : 'Une erreur est survenue. Réessayez.'

function Etiquette({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
      {children}
    </label>
  )
}

/** ⚙ Paramètres — la seule page où vivent les réglages du compte et de la boutique. */
export function Parametres({ onBack }: { onBack: () => void }) {
  const { user, logout } = useApp()
  const estVendeur = !!user?.availableRoles?.includes('vendeur')

  return (
    <section className="mx-auto grid max-w-2xl gap-5 px-3 py-6 md:px-6">
      <div>
        <button onClick={onBack} className="mb-3 flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Retour
        </button>
        <h1 className="text-2xl font-bold tracking-tight">Paramètres</h1>
      </div>

      {estVendeur && <BoutiqueEtPaiement />}
      <Compte />

      <Button
        variant="outline"
        onClick={logout}
        className="h-11 rounded-2xl text-destructive hover:bg-destructive/10"
      >
        <LogOut className="mr-2 size-4" /> Se déconnecter
      </Button>
    </section>
  )
}

/* ───────────── Boutique + paiement (vendeur) ───────────── */

function BoutiqueEtPaiement() {
  const [b, setB] = useState<MaBoutique | null>(null)
  const [nom, setNom] = useState('')
  const [description, setDescription] = useState('')
  const [adresse, setAdresse] = useState('')
  const [operateur, setOperateur] = useState('')
  const [numero, setNumero] = useState('')
  const [logo, setLogo] = useState<File | null>(null)
  const [banniere, setBanniere] = useState<File | null>(null)
  const [retirerLogo, setRetirerLogo] = useState(false)
  const [retirerBanniere, setRetirerBanniere] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ ok: boolean; texte: string } | null>(null)
  const logoRef = useRef<HTMLInputElement>(null)
  const banniereRef = useRef<HTMLInputElement>(null)

  function remplir(x: MaBoutique) {
    setB(x)
    setNom(x.boutique)
    setDescription(x.description || '')
    setAdresse(x.adresse_point_vente || '')
    setOperateur(x.operateur_paiement || '')
    setNumero(x.numero_paiement || '')
    setLogo(null)
    setBanniere(null)
    setRetirerLogo(false)
    setRetirerBanniere(false)
  }

  useEffect(() => {
    apiFetch<MaBoutique>('ma-boutique/').then(remplir).catch(() => setB(null))
  }, [])

  async function enregistrer() {
    setSaving(true)
    setMessage(null)
    try {
      const fd = new FormData()
      fd.append('boutique', nom)
      fd.append('description', description)
      fd.append('adresse_point_vente', adresse)
      fd.append('operateur_paiement', numero.trim() ? operateur : '')
      fd.append('numero_paiement', numero)
      if (logo) fd.append('logo', logo)
      else if (retirerLogo) fd.append('logo', '')
      if (banniere) fd.append('banniere', banniere)
      else if (retirerBanniere) fd.append('banniere', '')
      remplir(await multipartFetch<MaBoutique>('ma-boutique/', { method: 'PATCH', body: fd }))
      setMessage({ ok: true, texte: 'Enregistré.' })
    } catch (e) {
      setMessage({ ok: false, texte: erreurDe(e) })
    } finally {
      setSaving(false)
    }
  }

  if (!b) {
    return (
      <GlassCard strong className="flex justify-center p-6">
        <Spinner className="size-5 text-primary" />
      </GlassCard>
    )
  }

  const apercuLogo = logo ? URL.createObjectURL(logo) : retirerLogo ? null : b.logo_url
  const apercuBanniere = banniere ? URL.createObjectURL(banniere) : retirerBanniere ? null : b.banniere_url

  return (
    <>
      <GlassCard strong className="p-5 md:p-6">
        <h2 className="mb-4 flex items-center gap-2 font-bold">
          <Store className="size-5 text-primary" /> Ma boutique
        </h2>

        {/* Bannière */}
        <div className="mb-4">
          <p className="mb-1.5 text-sm font-medium">Bannière</p>
          <div className="flex aspect-[16/6] w-full items-center justify-center overflow-hidden rounded-2xl bg-secondary">
            {apercuBanniere ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={apercuBanniere} alt="Bannière de la boutique" className="size-full object-cover" />
            ) : (
              <span className="text-xs text-muted-foreground">Aucune bannière</span>
            )}
          </div>
          <div className="mt-2 flex gap-2">
            <input ref={banniereRef} type="file" accept="image/*" hidden aria-label="Choisir la bannière"
              onChange={(e) => { setBanniere(e.target.files?.[0] ?? null); setRetirerBanniere(false) }} />
            <Button type="button" variant="outline" size="sm" className="rounded-xl" onClick={() => banniereRef.current?.click()}>
              <ImagePlus className="mr-1.5 size-4" /> {apercuBanniere ? 'Changer la bannière' : 'Ajouter une bannière'}
            </Button>
            {apercuBanniere && (
              <Button type="button" variant="ghost" size="sm" className="rounded-xl text-muted-foreground"
                onClick={() => { setBanniere(null); setRetirerBanniere(true) }}>
                <Trash2 className="mr-1.5 size-4" /> Retirer
              </Button>
            )}
          </div>
        </div>

        {/* Logo */}
        <div className="mb-5">
          <p className="mb-1.5 text-sm font-medium">Logo</p>
          <div className="flex items-center gap-3">
            <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-secondary">
              {apercuLogo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={apercuLogo} alt="Logo de la boutique" className="size-full object-cover" />
              ) : (
                <Store className="size-7 text-muted-foreground" />
              )}
            </div>
            <input ref={logoRef} type="file" accept="image/*" hidden aria-label="Choisir le logo"
              onChange={(e) => { setLogo(e.target.files?.[0] ?? null); setRetirerLogo(false) }} />
            <Button type="button" variant="outline" size="sm" className="rounded-xl" onClick={() => logoRef.current?.click()}>
              <ImagePlus className="mr-1.5 size-4" /> {apercuLogo ? 'Changer le logo' : 'Ajouter un logo'}
            </Button>
            {apercuLogo && (
              <Button type="button" variant="ghost" size="sm" className="rounded-xl text-muted-foreground"
                onClick={() => { setLogo(null); setRetirerLogo(true) }} aria-label="Retirer le logo">
                <Trash2 className="size-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="grid gap-3">
          <div>
            <Etiquette id="p-nom">Nom de la boutique</Etiquette>
            <input id="p-nom" value={nom} onChange={(e) => setNom(e.target.value)} maxLength={255} className={champ} />
          </div>
          <div>
            <Etiquette id="p-desc">Présentation</Etiquette>
            <textarea id="p-desc" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={1000} rows={3}
              placeholder="Ce que vous vendez, ce qui vous distingue…" className={champ} />
          </div>
          <div>
            <Etiquette id="p-adr">Adresse du point de vente</Etiquette>
            <input id="p-adr" value={adresse} onChange={(e) => setAdresse(e.target.value)} maxLength={500} className={champ} />
          </div>
        </div>
      </GlassCard>

      <LienBoutique slug={b.slug} nom={b.boutique} />

      <GlassCard strong className="p-5 md:p-6">
        <h2 className="mb-1 flex items-center gap-2 font-bold">
          <Wallet className="size-5 text-primary" /> Numéro de paiement
        </h2>
        <p className="mb-3 text-xs text-muted-foreground">
          Privé : jamais affiché aux clients ni sur votre page boutique. Il servira à vous verser vos gains.
        </p>
        <div className="grid gap-3 sm:grid-cols-[9rem_1fr]">
          <div>
            <Etiquette id="p-op">Opérateur</Etiquette>
            <select id="p-op" value={operateur} onChange={(e) => setOperateur(e.target.value)} className={champ}>
              <option value="">—</option>
              <option value="MTN">MTN</option>
              <option value="MOOV">Moov</option>
            </select>
          </div>
          <div>
            <Etiquette id="p-num">Numéro Mobile Money</Etiquette>
            <input id="p-num" inputMode="tel" value={numero} onChange={(e) => setNumero(e.target.value)} maxLength={20}
              placeholder="Ex : 01 90 00 00 00" className={champ} />
          </div>
        </div>

        {message && (
          <p role="status" className={`mt-4 text-sm ${message.ok ? 'text-success' : 'text-destructive'}`}>{message.texte}</p>
        )}
        <Button onClick={enregistrer} disabled={saving}
          className="mt-4 w-full rounded-2xl bg-primary font-semibold text-primary-foreground hover:bg-primary/90">
          {saving ? 'Enregistrement…' : 'Enregistrer la boutique et le paiement'}
        </Button>
      </GlassCard>
    </>
  )
}

/* ───────────── Lien public de la boutique ───────────── */

function LienBoutique({ slug, nom }: { slug?: string; nom: string }) {
  const [copie, setCopie] = useState(false)
  if (!slug) return null
  const lien = `${typeof window !== 'undefined' ? window.location.origin : ''}/boutique/${slug}`
  const texte = `Découvrez ma boutique « ${nom} » sur Swift Africa : ${lien}`

  async function copier() {
    try {
      await navigator.clipboard.writeText(lien)
      setCopie(true)
      setTimeout(() => setCopie(false), 2000)
    } catch {
      window.prompt('Copiez ce lien :', lien)
    }
  }

  return (
    <GlassCard strong className="p-5 md:p-6">
      <h2 className="mb-1 flex items-center gap-2 font-bold">
        <Link2 className="size-5 text-primary" /> Lien de ma boutique
      </h2>
      <p className="mb-3 text-xs text-muted-foreground">
        Partagez ce lien : n'importe qui peut ouvrir votre boutique, sans compte.
      </p>
      <input readOnly value={lien} aria-label="Lien de la boutique" onFocus={(e) => e.currentTarget.select()} className={`${champ} mb-3`} />
      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={copier} className="rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90">
          {copie ? <Check className="mr-1.5 size-4" /> : <Copy className="mr-1.5 size-4" />}
          {copie ? 'Lien copié' : 'Copier le lien'}
        </Button>
        <a
          href={`https://wa.me/?text=${encodeURIComponent(texte)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="glass inline-flex h-9 items-center gap-1.5 rounded-2xl px-4 text-sm font-medium"
        >
          <MessageCircle className="size-4 text-[#25D366]" /> WhatsApp
        </a>
        <a href={lien} target="_blank" rel="noopener noreferrer" className="glass inline-flex h-9 items-center gap-1.5 rounded-2xl px-4 text-sm font-medium">
          <ExternalLink className="size-4" /> Ouvrir
        </a>
      </div>
    </GlassCard>
  )
}

/* ───────────── Compte (tous les rôles) ───────────── */

function Compte() {
  const { user } = useApp()
  const [aMotDePasse, setAMotDePasse] = useState(user?.a_mot_de_passe !== false)
  const [ancien, setAncien] = useState('')
  const [nouveau, setNouveau] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ ok: boolean; texte: string } | null>(null)

  async function changer(e: React.FormEvent) {
    e.preventDefault()
    setMessage(null)
    if (nouveau !== confirmation) {
      setMessage({ ok: false, texte: 'Les deux mots de passe ne sont pas identiques.' })
      return
    }
    setSaving(true)
    try {
      await apiFetch('auth/mot-de-passe/', {
        method: 'POST',
        body: aMotDePasse ? { ancien, nouveau } : { nouveau },
      })
      setAMotDePasse(true)
      setAncien('')
      setNouveau('')
      setConfirmation('')
      setMessage({ ok: true, texte: 'Mot de passe enregistré.' })
    } catch (err) {
      setMessage({ ok: false, texte: erreurDe(err) })
    } finally {
      setSaving(false)
    }
  }

  return (
    <GlassCard strong className="p-5 md:p-6">
      <h2 className="mb-4 flex items-center gap-2 font-bold">
        <KeyRound className="size-5 text-primary" /> Compte
      </h2>

      <div className="mb-4">
        <Etiquette id="c-email">Adresse e-mail</Etiquette>
        <input id="c-email" value={user?.email ?? ''} readOnly className={`${champ} opacity-70`} />
        {!aMotDePasse && (
          <p className="mt-1 text-xs text-muted-foreground">Compte créé avec Google : l'e-mail ne se modifie pas ici.</p>
        )}
      </div>

      <form onSubmit={changer} className="grid gap-3">
        <h3 className="text-sm font-bold">{aMotDePasse ? 'Changer le mot de passe' : 'Définir un mot de passe'}</h3>
        {aMotDePasse && (
          <div>
            <Etiquette id="c-ancien">Mot de passe actuel</Etiquette>
            <input id="c-ancien" type="password" autoComplete="current-password" value={ancien} onChange={(e) => setAncien(e.target.value)} className={champ} required />
          </div>
        )}
        <div>
          <Etiquette id="c-nouveau">Nouveau mot de passe</Etiquette>
          <input id="c-nouveau" type="password" autoComplete="new-password" minLength={8} value={nouveau} onChange={(e) => setNouveau(e.target.value)} className={champ} required />
        </div>
        <div>
          <Etiquette id="c-confirm">Confirmer</Etiquette>
          <input id="c-confirm" type="password" autoComplete="new-password" minLength={8} value={confirmation} onChange={(e) => setConfirmation(e.target.value)} className={champ} required />
        </div>
        {message && (
          <p role="status" className={`text-sm ${message.ok ? 'text-success' : 'text-destructive'}`}>{message.texte}</p>
        )}
        <Button type="submit" disabled={saving} className="rounded-2xl bg-primary font-semibold text-primary-foreground hover:bg-primary/90">
          {saving ? 'Enregistrement…' : aMotDePasse ? 'Changer le mot de passe' : 'Définir le mot de passe'}
        </Button>
      </form>
    </GlassCard>
  )
}
