'use client'

import { useRef, useState } from 'react'
import { ImagePlus, X, CheckCircle2 } from 'lucide-react'
import { GlassCard, Spinner } from '@/components/glass'
import { Button } from '@/components/ui/button'
import { multipartFetch } from '@/lib/api-multipart'
import { ApiError } from '@/lib/api'
import type { Allee } from '@/lib/types'

const MAX_PHOTOS = 30
const PAR_LOT = 3 // petites requêtes : plus fiables sur une connexion mobile
const MAX_OCTETS = 5 * 1024 * 1024

/**
 * Ajout en lot : le vendeur choisit plusieurs photos, chacune devient un
 * brouillon qu'il complétera (nom, prix, catégorie) avant de le publier.
 */
export function BulkUpload({
  allees,
  defaultAllee,
  onClose,
  onDone,
}: {
  allees: Allee[]
  defaultAllee?: number | null
  onClose: () => void
  onDone: (nb: number) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [fichiers, setFichiers] = useState<File[]>([])
  const [allee, setAllee] = useState(defaultAllee ? String(defaultAllee) : '')
  const [envoyes, setEnvoyes] = useState(0)
  const [enCours, setEnCours] = useState(false)
  const [erreur, setErreur] = useState<string | null>(null)

  function choisir(liste: FileList | null) {
    if (!liste) return
    setErreur(null)
    const nouveaux: File[] = []
    const refus: string[] = []
    for (const f of Array.from(liste)) {
      if (!f.type.startsWith('image/')) refus.push(`« ${f.name} » n'est pas une image`)
      else if (f.size > MAX_OCTETS) refus.push(`« ${f.name} » dépasse 5 Mo`)
      else nouveaux.push(f)
    }
    const total = [...fichiers, ...nouveaux]
    if (total.length > MAX_PHOTOS) refus.push(`maximum ${MAX_PHOTOS} photos à la fois`)
    setFichiers(total.slice(0, MAX_PHOTOS))
    if (refus.length) setErreur(refus.join(' ; ') + '.')
    if (inputRef.current) inputRef.current.value = ''
  }

  async function envoyer() {
    if (fichiers.length === 0 || enCours) return
    setEnCours(true)
    setErreur(null)
    let faits = 0
    try {
      for (let i = 0; i < fichiers.length; i += PAR_LOT) {
        const lot = fichiers.slice(i, i + PAR_LOT)
        const fd = new FormData()
        lot.forEach((f) => fd.append('images', f))
        if (allee) fd.append('allee', allee)
        await multipartFetch('produits/lot/', { method: 'POST', body: fd })
        faits += lot.length
        setEnvoyes(faits)
      }
      onDone(faits)
    } catch (e) {
      // les lots déjà envoyés sont conservés ; on retire ces photos pour ne pas les renvoyer
      setFichiers((prev) => prev.slice(faits))
      setEnvoyes(0)
      const base = e instanceof ApiError ? e.message : 'Connexion interrompue.'
      setErreur(
        faits > 0
          ? `${faits} photo(s) enregistrée(s) avant l'erreur. ${base} Réessayez avec les photos restantes.`
          : base,
      )
      if (faits > 0) onDone(faits)
    } finally {
      setEnCours(false)
    }
  }

  return (
    <GlassCard strong className="p-5 md:p-6">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h2 className="font-bold">Ajouter plusieurs produits</h2>
          <p className="text-xs text-muted-foreground">
            Choisissez vos photos : chacune devient un brouillon, invisible des clients tant que vous n'avez pas
            complété la fiche (nom, prix, catégorie).
          </p>
        </div>
        <button onClick={onClose} aria-label="Fermer" className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary">
          <X className="size-4" />
        </button>
      </div>

      <label htmlFor="lot-allee" className="mb-1.5 block text-sm font-medium">
        Ranger dans l'allée
      </label>
      <select
        id="lot-allee"
        value={allee}
        onChange={(e) => setAllee(e.target.value)}
        disabled={enCours}
        className="mb-3 w-full rounded-xl border border-border bg-input px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
      >
        <option value="">Aucune (je le ferai ensuite)</option>
        {allees.map((a) => (
          <option key={a.id} value={a.id}>
            {a.nom}
          </option>
        ))}
      </select>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        aria-label="Choisir des photos"
        onChange={(e) => choisir(e.target.files)}
      />
      <Button
        type="button"
        variant="outline"
        disabled={enCours}
        onClick={() => inputRef.current?.click()}
        className="w-full rounded-2xl"
      >
        <ImagePlus className="mr-2 size-4" />
        {fichiers.length ? 'Ajouter d’autres photos' : 'Choisir des photos'}
      </Button>

      {fichiers.length > 0 && (
        <ul className="mt-3 grid grid-cols-4 gap-2">
          {fichiers.map((f, i) => (
            <li key={`${f.name}-${i}`} className="relative aspect-square overflow-hidden rounded-xl bg-secondary">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={URL.createObjectURL(f)} alt={f.name} className="size-full object-cover" />
              {!enCours && (
                <button
                  onClick={() => setFichiers(fichiers.filter((_, j) => j !== i))}
                  aria-label={`Retirer ${f.name}`}
                  className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white"
                >
                  <X className="size-3" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {erreur && <p className="mt-3 text-sm text-destructive">{erreur}</p>}

      <Button
        onClick={envoyer}
        disabled={fichiers.length === 0 || enCours}
        className="mt-4 w-full rounded-2xl bg-primary font-semibold text-primary-foreground hover:bg-primary/90"
      >
        {enCours ? (
          <>
            <Spinner className="mr-2 size-4" /> Envoi {envoyes}/{fichiers.length}…
          </>
        ) : (
          <>
            <CheckCircle2 className="mr-2 size-4" />
            Créer {fichiers.length || ''} brouillon{fichiers.length > 1 ? 's' : ''}
          </>
        )}
      </Button>
    </GlassCard>
  )
}
