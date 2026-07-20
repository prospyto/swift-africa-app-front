'use client'

import { useState } from 'react'
import { AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react'

interface FormData {
  [key: string]: string | string[]
}

export function SurveyForm() {
  const [currentSection, setCurrentSection] = useState(0)
  const [formData, setFormData] = useState<FormData>({})
  const [loading, setLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sections = [
    {
      id: 'section0_common',
      title: 'Tronc commun',
      questions: [
        {
          id: 'q1_profil',
          text: 'Quel est ton profil ?',
          type: 'checkbox',
          options: ['Acheteur', 'Vendeur', 'Livreur'],
          required: true,
        },
        {
          id: 'q2_pays',
          text: 'Pays',
          type: 'short_answer',
          required: true,
        },
        {
          id: 'q3_ville',
          text: 'Ville / Quartier',
          type: 'short_answer',
          required: false,
        },
        {
          id: 'q4_whatsapp',
          text: 'Numéro WhatsApp (confidentiel, utilisé uniquement pour te recontacter)',
          type: 'short_answer',
          required: true,
        },
        {
          id: 'q5_smartphone',
          text: 'As-tu un smartphone ?',
          type: 'multiple_choice',
          options: ['Oui', 'Non'],
          required: false,
        },
        {
          id: 'q6_preference_usage',
          text: 'Comment préfères-tu utiliser un service comme celui-ci ?',
          type: 'multiple_choice',
          options: ['Application mobile', 'Site web', 'WhatsApp'],
          required: false,
        },
      ],
    },
    {
      id: 'section1_acheteur',
      title: 'Section Acheteur',
      questions: [
        {
          id: 'q7_age',
          text: 'Tranche d\'âge',
          type: 'multiple_choice',
          options: ['Moins de 18', '18-25', '26-35', '36-45', '46+'],
        },
        {
          id: 'q8_achat_en_ligne',
          text: 'Achètes-tu déjà en ligne ?',
          type: 'multiple_choice',
          options: ['Oui', 'Non'],
        },
        {
          id: 'q9_frequence',
          text: 'Si oui, à quelle fréquence ?',
          type: 'multiple_choice',
          options: ['Quotidienne', 'Hebdomadaire', 'Mensuelle', 'Rare'],
        },
        {
          id: 'q10_moyens_paiement',
          text: 'Moyens de paiement utilisés',
          type: 'checkbox',
          options: ['Mobile Money', 'Cash à la livraison', 'Virement bancaire', 'Autre'],
        },
        {
          id: 'q11_service_existant',
          text: 'Utilises-tu déjà un service de livraison ou une plateforme d\'achat en ligne ?',
          type: 'multiple_choice',
          options: ['Oui', 'Non'],
        },
        {
          id: 'q12_plateformes',
          text: 'Si oui, laquelle(s) ?',
          type: 'checkbox',
          options: ['Jumia', 'Sabi.bj', 'Kangoo', 'CoinAfrique', 'WhatsApp Business', 'Facebook Shop', 'Autre'],
        },
        {
          id: 'q13_difficultes_livraison',
          text: 'Difficultés rencontrées avec les livraisons actuelles',
          type: 'matrix',
          rows: ['Retard', 'Produit abîmé', 'Livreur injoignable', 'Prix élevé'],
          columns: ['Jamais', 'Parfois', 'Souvent'],
        },
        {
          id: 'q15_types_produits',
          text: 'Quels types de produits achètes-tu le plus souvent ?',
          type: 'checkbox',
          options: ['Alimentaire', 'Mode', 'Électronique', 'Autre'],
        },
      ],
    },
    {
      id: 'section2_vendeur',
      title: 'Section Vendeur',
      questions: [
        {
          id: 'q16_type_vendeur',
          text: 'Type de vendeur',
          type: 'multiple_choice',
          options: ['Petit commerce', 'Importateur', 'PME'],
        },
        {
          id: 'q17_part_ventes_ligne',
          text: 'Part de tes ventes en ligne (%)',
          type: 'short_answer',
        },
        {
          id: 'q18_plateforme_existante',
          text: 'Utilises-tu déjà une plateforme de vente en ligne ?',
          type: 'multiple_choice',
          options: ['Oui', 'Non'],
        },
        {
          id: 'q19_plateformes_vendeur',
          text: 'Si oui, laquelle ?',
          type: 'checkbox',
          options: ['Jumia', 'Sabi.bj', 'WhatsApp Business', 'Facebook Marketplace', 'Site web propre', 'Autre'],
        },
        {
          id: 'q20_gestion_livraison',
          text: 'Gères-tu toi-même tes livraisons ou passes-tu par un tiers ?',
          type: 'multiple_choice',
          options: ['Moi-même', 'Tiers', 'Les deux'],
        },
        {
          id: 'q24_couts_caches',
          text: 'Quels coûts cachés impactent ton activité ?',
          type: 'checkbox',
          options: ['Emballage', 'Stockage', 'Retours-invendus', 'Autre'],
        },
        {
          id: 'q25_modele_paiement',
          text: 'Quel modèle de paiement préférerais-tu pour un service de livraison ?',
          type: 'multiple_choice',
          options: ['Commission en %', 'Montant fixe par livraison'],
        },
      ],
    },
    {
      id: 'section3_livreur',
      title: 'Section Livreur',
      questions: [
        {
          id: 'q26_activite_principale',
          text: 'La livraison est-elle ton activité principale ou secondaire ?',
          type: 'multiple_choice',
          options: ['Principale', 'Secondaire'],
        },
        {
          id: 'q27_equipement',
          text: 'Quel est ton équipement principal ?',
          type: 'multiple_choice',
          options: ['Moto', 'Vélo', 'À pied', 'Voiture'],
        },
        {
          id: 'q28_plateforme_existante',
          text: 'Travailles-tu déjà pour une plateforme de livraison ?',
          type: 'multiple_choice',
          options: ['Oui', 'Non'],
        },
        {
          id: 'q29_plateformes_livreur',
          text: 'Si oui, laquelle(s) ?',
          type: 'checkbox',
          options: ['Kangoo', 'Jumia Force', 'Livraison indépendante', 'Autre'],
        },
        {
          id: 'q31_zone_operation',
          text: 'Zone d\'opération (ville/pays)',
          type: 'short_answer',
        },
        {
          id: 'q33_interet_automatisation',
          text: 'Serais-tu intéressé par une plateforme qui automatise l\'attribution des missions ?',
          type: 'multiple_choice',
          options: ['Oui', 'Non', 'Peut-être'],
        },
      ],
    },
  ]

  const section = sections[currentSection]

  const handleInputChange = (questionId: string, value: string | string[]) => {
    setFormData((prev) => ({
      ...prev,
      [questionId]: value,
    }))
  }

  const handleCheckboxChange = (questionId: string, option: string) => {
    const current = Array.isArray(formData[questionId]) ? formData[questionId] : []
    const updated = current.includes(option)
      ? current.filter((item) => item !== option)
      : [...current, option]
    handleInputChange(questionId, updated)
  }

  const handleMatrixChange = (questionId: string, row: string, column: string) => {
    const current = formData[questionId] || {}
    const key = `${row}|${column}`
    handleInputChange(questionId, {
      ...current,
      [key]: column,
    })
  }

  const validateSection = () => {
    for (const question of section.questions) {
      if (question.required) {
        const value = formData[question.id]
        if (!value || (Array.isArray(value) && value.length === 0)) {
          setError(`Veuillez remplir: ${question.text}`)
          return false
        }
      }
    }
    setError(null)
    return true
  }

  const handleNext = () => {
    if (!validateSection()) return
    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1)
    }
  }

  const handlePrev = () => {
    setCurrentSection(Math.max(0, currentSection - 1))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateSection()) return

    setLoading(true)

    try {
      // Les données seront envoyées à Formspree après intégration
      // Pour l'instant, on stocke juste
      console.log('Form data:', formData)
      setShowSuccess(true)
      setTimeout(() => {
        setShowSuccess(false)
        setCurrentSection(0)
        setFormData({})
      }, 3000)
    } catch (err) {
      setError('Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  if (showSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="w-full max-w-sm rounded-3xl bg-white p-8 text-center shadow-2xl">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-[#ff6b00]/10">
            <CheckCircle2 className="size-9 text-[#ff6b00]" />
          </div>
          <h2 className="mb-2 text-xl font-bold text-gray-900">Merci !</h2>
          <p className="mb-6 text-sm text-gray-500">
            Vos réponses ont bien été enregistrées. Nous allons vous recontacter très bientôt.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-3 py-6 md:px-6 md:py-8">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-3">
          <h1 className="text-2xl font-bold text-gray-900">{section.title}</h1>
          <span className="text-sm font-medium text-[#ff6b00]">
            {currentSection + 1}/{sections.length}
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
          <div
            className="h-full bg-[#ff6b00] transition-all duration-300"
            style={{ width: `${((currentSection + 1) / sections.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Glass Card */}
      <div className="rounded-2xl p-6 md:p-8 backdrop-blur-xl bg-white/60 border border-white/50 shadow-lg">
        {error && (
          <div className="mb-6 flex items-center gap-2 rounded-2xl bg-red-50 p-4 text-sm text-red-700 border border-red-200">
            <AlertCircle className="size-4 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {section.questions.map((question) => (
            <div key={question.id}>
              <label className="block text-sm font-medium text-gray-900 mb-3">
                {question.text}
                {question.required && <span className="text-red-500 ml-1">*</span>}
              </label>

              {/* Short Answer */}
              {question.type === 'short_answer' && (
                <input
                  type="text"
                  value={(formData[question.id] as string) || ''}
                  onChange={(e) => handleInputChange(question.id, e.target.value)}
                  placeholder="Votre réponse"
                  className="w-full rounded-xl border border-gray-200 bg-white/80 px-4 py-3 text-sm outline-none transition focus:border-[#ff6b00] focus:ring-2 focus:ring-[#ff6b00]/20"
                />
              )}

              {/* Multiple Choice */}
              {question.type === 'multiple_choice' && (
                <div className="space-y-2">
                  {question.options?.map((option) => (
                    <label key={option} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="radio"
                        name={question.id}
                        value={option}
                        checked={(formData[question.id] as string) === option}
                        onChange={(e) => handleInputChange(question.id, e.target.value)}
                        className="w-4 h-4 text-[#ff6b00] cursor-pointer"
                      />
                      <span className="text-sm text-gray-700 group-hover:text-gray-900">
                        {option}
                      </span>
                    </label>
                  ))}
                </div>
              )}

              {/* Checkbox */}
              {question.type === 'checkbox' && (
                <div className="space-y-2">
                  {question.options?.map((option) => (
                    <label key={option} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={
                          Array.isArray(formData[question.id])
                            ? (formData[question.id] as string[]).includes(option)
                            : false
                        }
                        onChange={() => handleCheckboxChange(question.id, option)}
                        className="w-4 h-4 text-[#ff6b00] rounded cursor-pointer"
                      />
                      <span className="text-sm text-gray-700 group-hover:text-gray-900">
                        {option}
                      </span>
                    </label>
                  ))}
                </div>
              )}

              {/* Matrix */}
              {question.type === 'matrix' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr>
                        <th className="text-left py-2 px-3 font-medium text-gray-700"></th>
                        {question.columns?.map((col) => (
                          <th key={col} className="text-center py-2 px-3 font-medium text-gray-700">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {question.rows?.map((row) => (
                        <tr key={row} className="border-t border-gray-200">
                          <td className="py-3 px-3 font-medium text-gray-700">{row}</td>
                          {question.columns?.map((col) => (
                            <td key={`${row}-${col}`} className="text-center py-3 px-3">
                              <input
                                type="radio"
                                name={`${question.id}-${row}`}
                                value={col}
                                onChange={() => handleMatrixChange(question.id, row, col)}
                                className="w-4 h-4 text-[#ff6b00] cursor-pointer"
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}

          {/* Buttons */}
          <div className="flex gap-3 pt-6 border-t border-gray-200">
            {currentSection > 0 && (
              <button
                type="button"
                onClick={handlePrev}
                className="flex items-center gap-2 px-4 py-3 rounded-2xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition"
              >
                <ArrowLeft className="size-4" />
                Précédent
              </button>
            )}

            {currentSection < sections.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex-1 px-4 py-3 rounded-2xl bg-[#ff6b00] text-white font-medium hover:bg-[#e55f00] transition"
              >
                Suivant
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-3 rounded-2xl bg-[#ff6b00] text-white font-medium hover:bg-[#e55f00] transition disabled:opacity-50"
              >
                {loading ? 'Envoi...' : 'Envoyer'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
