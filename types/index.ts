// types/index.ts

export type Language = 'FR' | 'EN' | 'JP' | 'CN';

export type CardCondition = 'Mint' | 'Near Mint' | 'Excellent' | 'Good' | 'Played';

export type ProductType =
'ETB' | 'Ultra Premium' | 'Coffret' 
| 'Demi-Display (18 boosters)' | 'Display (24 boosters)' | 'Display (36 boosters)'
| 'Blister' | 'Duopack' | 'Tripack' | 'Quadripack' | 'Pentapack' | 'Hexapack' 
| 'Booster' | 'Échantillon' | 'Mcdo' | 'Pop' | 'Pack Récompense'
| 'Portfolio avec booster(s)' 
| 'Mini-Tins' | 'Tincube' | 'Pokébox' | 'Valisette'
| 'Bundle' | 'Display Bundle' | 'Kit Avant Première' | 'Stade Stratégies et Combats'
| 'Deck' | 'Necessaire du Dresseur' | 'Kit du Dresseur' | 'Coffret Tournoi Premium' | 'Calendrier des Fêtes' 
| 'Exclu CostCo';


// Hiérarchie : Bloc > Série (Extension) > Carte
export interface Block {
  id: string;
  name: string; // ex: "Écarlate et Violet"
  releaseDate: string;
}

export interface Set {
  id: string;
  name: string; // ex: "151", "Obsidienne"
  blockId: string;
  cardCount: number;
}

// Interface principale pour une Carte
export interface PokemonCard {
  id: string;
  name: string;
  imageUrl: string;
  number: string;
  rarity: string;
  language: string;
  condition: string; // ou CardCondition si vous êtes strict
  marketPrice: number;
  setId: string;
  
  // --- AJOUTEZ CETTE LIGNE ---
  setName: string; 
  // ---------------------------
}

// Interface pour les Items Scellés
export interface SealedProduct {
  id: string;
  name: string;
  type: ProductType;
  setId?: string; // Optionnel car certains items sont hors série
  language: Language;
  priceBought: number;
  marketPrice: number;
  quantity: number;
}

// Interface générique pour l'import Excel
// Compatible avec les colonnes de ton fichier "Invest Pokémon"
export interface CollectionItemImport {
  name: string;
  set: string; // Nom de la série à mapper
  language: string; // "Français" -> mapper vers 'FR'
  condition: string;
  type: 'Card' | 'Sealed';
  price_bought: number;
  market_price: number;
  notes?: string;
}