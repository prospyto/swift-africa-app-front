import type { Product } from './types'

export const DEMO_PRODUCTS: Product[] = [
  {
    id: 1,
    nom: 'Canapé Modulaire Savane',
    description:
      'Canapé 4 places en velours côtelé, structure bois massif. Confort enveloppant et lignes épurées.',
    prix: 480000,
    prix_solde: 399000,
    image: '/products/sofa-savane.png',
    categorie: 'Salon',
    vendeur: 'Atelier Dakar',
    ville: 'Dakar',
  },
  {
    id: 2,
    nom: 'Fauteuil Lounge Baobab',
    description:
      'Fauteuil pivotant en cuir pleine fleur avec piètement laiton brossé. Élégance intemporelle.',
    prix: 215000,
    prix_solde: null,
    image: '/products/fauteuil-baobab.png',
    categorie: 'Salon',
    vendeur: 'Maison Abidjan',
    ville: 'Abidjan',
  },
  {
    id: 3,
    nom: 'Table à Manger Sahel',
    description:
      'Grande table 8 personnes en noyer, finition huilée naturelle. Pièce maîtresse de la salle à manger.',
    prix: 360000,
    prix_solde: 320000,
    image: '/products/table-sahel.png',
    categorie: 'Salle à manger',
    vendeur: 'Atelier Dakar',
    ville: 'Dakar',
  },
  {
    id: 4,
    nom: 'Lit Plateforme Niamey',
    description:
      'Lit king size avec tête de lit capitonnée en lin. Sérénité et minimalisme pour la chambre.',
    prix: 295000,
    prix_solde: null,
    image: '/products/lit-niamey.png',
    categorie: 'Chambre',
    vendeur: 'Mobilier Bamako',
    ville: 'Bamako',
  },
  {
    id: 5,
    nom: 'Bibliothèque Sénoufo',
    description:
      'Étagère modulable en chêne clair, 5 niveaux. Rangement design pour le bureau ou le salon.',
    prix: 178000,
    prix_solde: 149000,
    image: '/products/bibliotheque-senoufo.png',
    categorie: 'Bureau',
    vendeur: 'Maison Abidjan',
    ville: 'Abidjan',
  },
  {
    id: 6,
    nom: 'Bureau Exécutif Harmattan',
    description:
      'Bureau en placage noyer avec rangements intégrés et passe-câbles. Pensé pour le télétravail.',
    prix: 240000,
    prix_solde: null,
    image: '/products/bureau-harmattan.png',
    categorie: 'Bureau',
    vendeur: 'Mobilier Bamako',
    ville: 'Bamako',
  },
]
