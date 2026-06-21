'use client'

import { useState, useEffect, useCallback } from 'react'
import { Wallet, Plus, ArrowDownCircle, ArrowUpCircle, RefreshCw, CheckCircle2 } from 'lucide-react'
import { GlassCard, Spinner } from '@/components/glass'
import { Button } from '@/components/ui/button'
import { apiFetch } from '@/lib/api'
import { formatXOF } from '@/lib/store'

interface Transaction {
  id: number
  type_transaction: string
  montant: number
  statut: string
  reference_externe: string
  cree_le: string
}

interface WalletData {
  solde: number
  transactions: Transaction[]
}

const TYPE_LABELS: Record<string, string> = {
  DEPOT:           'Dépôt',
  ESCROW:          'Commande',
  GAIN_LIVRAISON:  'Gain livraison',
  REMBOURSEMENT:   'Remboursement',
  LITIGE:          'Litige',
}

const CREDITS = ['DEPOT', 'GAIN_LIVRAISON', 'REMBOURSEMENT']
const MONTANTS_RAPIDES = [5000, 10000, 25000, 50000]

export function WalletCard() {
  const [wallet, setWallet] = useState<WalletData | null>(null)
  const [loading, setLoading] = useState(true)
  const [montant, setMontant] = useState('')
  const [depositing, setDepositing] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  const loadWallet = useCallback(async () => {
    try {
      const data = await apiFetch<WalletData>('portefeuille/')
      setWallet(data)
    } catch { /* silencieux */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { loadWallet() }, [loadWallet])

  async function handleDepot() {
    const val = parseFloat(montant)
    if (!val || val <= 0) { setError('Montant invalide'); return }
    if (val < 500) { setError('Minimum 500 FCFA'); return }
    setDepositing(true); setError(null)
    try {
      await apiFetch('portefeuille/depot-simulation/', {
        method: 'POST',
        body: { montant: val },
      })
      setSuccess(true); setMontant(''); setShowForm(false)
      await loadWallet()
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Dépôt échoué')
    } finally { setDepositing(false) }
  }

  if (loading) return (
    <GlassCard className="flex items-center justify-center p-8">
      <Spinner className="size-6 text-primary" />
    </GlassCard>
  )

  return (
    <GlassCard strong className="overflow-hidden p-0">
      {/* Header solde */}
      <div className="relative bg-primary px-6 py-6 text-primary-foreground">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium opacity-75">Solde disponible</p>
            <p className="mt-1 text-3xl font-bold tracking-tight">
              {formatXOF(wallet?.solde ?? 0)}
            </p>
          </div>
          <div className="flex size-14 items-center justify-center rounded-2xl bg-white/15">
            <Wallet className="size-7" />
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => { setShowForm((v) => !v); setError(null) }}
            className="flex items-center gap-1.5 rounded-xl bg-white/20 px-4 py-2 text-sm font-semibold transition hover:bg-white/30"
          >
            <Plus className="size-4" /> Recharger
          </button>
          <button
            onClick={loadWallet}
            className="flex size-9 items-center justify-center rounded-xl bg-white/20 transition hover:bg-white/30"
            aria-label="Rafraîchir"
          >
            <RefreshCw className="size-4" />
          </button>
        </div>
      </div>

      {/* Formulaire dépôt */}
      {showForm && (
        <div className="border-b border-border/60 px-5 py-4">
          <p className="mb-3 text-sm font-semibold">Simulation Mobile Money</p>
          <div className="mb-3 flex flex-wrap gap-2">
            {MONTANTS_RAPIDES.map((m) => (
              <button
                key={m}
                onClick={() => setMontant(String(m))}
                className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
                  montant === String(m)
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-secondary hover:border-primary'
                }`}
              >
                {formatXOF(m)}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="number"
                value={montant}
                onChange={(e) => { setMontant(e.target.value); setError(null) }}
                placeholder="Montant en FCFA"
                min={500}
                className="w-full rounded-xl border border-border bg-input px-4 py-2.5 pr-16 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">FCFA</span>
            </div>
            <Button
              onClick={handleDepot}
              disabled={depositing || !montant}
              className="rounded-xl bg-primary px-5 font-semibold text-primary-foreground hover:bg-primary/90"
            >
              {depositing ? <Spinner className="size-4" /> : 'Valider'}
            </Button>
          </div>
          {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
          <p className="mt-2 text-[11px] text-muted-foreground">
            Simulation — aucun vrai débit. Intégration MTN/Moov à venir.
          </p>
        </div>
      )}

      {/* Succès */}
      {success && (
        <div className="flex items-center gap-2 border-b border-border/60 bg-success/10 px-5 py-3 text-sm font-semibold text-success">
          <CheckCircle2 className="size-4" /> Dépôt effectué avec succès !
        </div>
      )}

      {/* Historique */}
      <div className="px-5 py-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Historique
        </p>
        {!wallet?.transactions?.length ? (
          <p className="py-4 text-center text-sm text-muted-foreground">Aucune transaction</p>
        ) : (
          <ul className="grid gap-2">
            {wallet.transactions.slice(0, 8).map((t) => {
              const isCredit = CREDITS.includes(t.type_transaction)
              return (
                <li key={t.id} className="flex items-center gap-3 rounded-xl py-1">
                  <div className={`flex size-8 shrink-0 items-center justify-center rounded-xl ${
                    isCredit ? 'bg-success/15 text-success' : 'bg-destructive/15 text-destructive'
                  }`}>
                    {isCredit ? <ArrowDownCircle className="size-4" /> : <ArrowUpCircle className="size-4" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{TYPE_LABELS[t.type_transaction] ?? t.type_transaction}</p>
                    <p className="truncate text-xs text-muted-foreground">{t.reference_externe}</p>
                  </div>
                  <p className={`text-sm font-bold ${isCredit ? 'text-success' : 'text-destructive'}`}>
                    {isCredit ? '+' : '-'}{formatXOF(t.montant)}
                  </p>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </GlassCard>
  )
}
