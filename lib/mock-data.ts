// lib/mock-data.ts (Mise à jour)

import { SealedProduct } from '@/types'; 
// ... (imports et mockCollectionData précédents) ...

export const mockSealedData: SealedProduct[] = [
  {
    id: 's1',
    name: 'Display EV01 Écarlate et Violet',
    type: 'Display (36 boosters)',
    setId: 'display36ev01', // ID d'une Set
    language: 'FR',
    priceBought: 150.00,
    marketPrice: 220.00,
    quantity: 1,
  },
  {
    id: 's2',
    name: 'Coffret Dresseur d\'Élite (ETB) EV04.5 Destinées de Paldea',
    type: 'ETB',
    setId: 'ETBEV045',
    language: 'FR',
    priceBought: 55.00,
    marketPrice: 110.00,
    quantity: 1,
  },
  {
    id: 's3',
    name: 'Blister EV08 Étincelles Déferlantes',
    type: 'Blister',
    language: 'FR',
    priceBought: 6.00,
    marketPrice: 9.00,
    quantity: 1,
  },
];