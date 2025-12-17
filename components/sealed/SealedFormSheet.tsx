// components/sealed/SealedFormSheet.tsx
'use client';

import React, { useState, useEffect } from 'react';
// Note: Assurez-vous que le chemin vers '@/types' est correct
import { SealedProduct, ProductType, Language } from '@/types'; 
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';


// --- CORRECTION 1: DÉPLACEMENT ET DÉFINITION DES OPTIONS EN DEHORS DE LA FONCTION ---

// Liste des options pour le ProductType (conversion en tableau pour le select)
const productTypeOptions: ProductType[] = [
    'ETB', 'Ultra Premium', 'Coffret', 
    'Booster', 'Échantillon', 'Mcdo', 'Pop', 'Pack Récompense', 'Demi-Display (18 boosters)', 
    'Display (24 boosters)', 'Display (36 boosters)', 'Portfolio avec booster(s)', 
    'Blister', 'Duopack', 'Tripack', 'Quadripack', 'Pentapack', 'Hexapack', 
    'Mini-Tins', 'Tincube', 'Pokébox', 'Valisette',
    'Bundle', 'Display Bundle', 'Kit Avant Première', 'Stade Stratégies et Combats',
    'Deck', 'Necessaire du Dresseur', 'Kit du Dresseur', 'Coffret Tournoi Premium', 'Calendrier des Fêtes', 
    'Exclu CostCo'
];

// Liste des options pour la Langue
const languageOptions: Language[] = ['FR', 'EN', 'JP', 'CN'];


// L'interface des Props est déjà définie, mais le composant doit l'utiliser correctement
interface SealedFormProps {
  isOpen: boolean;
  onClose: () => void;
  initialItem?: SealedProduct; 
  onSubmit: (itemData: Omit<SealedProduct, 'id'>) => void; 
}


// --- CORRECTION 2: UTILISATION DE SealedFormProps COMME ARGUMENT ---
const SealedFormSheet: React.FC<SealedFormProps> = ({ 
  isOpen, 
  onClose, 
  initialItem, 
  onSubmit 
}) => {
  
  const isEditing = !!initialItem;
  
  const [formData, setFormData] = useState<Omit<SealedProduct, 'id'>>({
    name: '',
    type: productTypeOptions[0], // Correction: productTypeOptions est maintenant visible
    language: 'FR',
    priceBought: 0,
    marketPrice: 0,
    quantity: 1,
    setId: '',
  });

  // Hydratation pour l'édition
  useEffect(() => {
    if (initialItem) {
      const { id, ...dataWithoutId } = initialItem; 
      setFormData(dataWithoutId);
    } else {
      // Réinitialisation pour l'ajout
      setFormData({ 
        name: '', type: productTypeOptions[0], language: 'FR', // Correction: productTypeOptions est visible
        priceBought: 0, marketPrice: 0, quantity: 1, setId: ''
      });
    }
  }, [initialItem]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'priceBought' || name === 'marketPrice' || name === 'quantity' ? Number(value) : value,
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>{isEditing ? 'Modifier l\'Item Scellé' : 'Ajouter un Nouvel Item Scellé'}</SheetTitle>
          <SheetDescription>
            {isEditing ? `Mise à jour de : ${initialItem?.name}` : "Entrez les détails de votre nouvel item scellé."}
          </SheetDescription>
        </SheetHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-6">
          
          {/* Champ Nom du Produit */}
          <div className="space-y-1">
            <label htmlFor="sealed-name" className="text-sm font-medium">Nom du Produit (Ex: Display Épée et Bouclier)</label>
            <Input 
              id="sealed-name"
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              required 
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {/* Champ Type de Produit (Select) */}
            <div className="space-y-1">
                <label className="text-sm font-medium">Type de Produit</label>
                 <select 
                  name="type" 
                  value={formData.type} 
                  onChange={handleChange} 
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                 >
                    {/* Correction: 'type' est correctement typé ici car productTypeOptions est visible */}
                    {productTypeOptions.map((type: ProductType) => ( 
                        <option key={type} value={type}>{type}</option>
                    ))}
                 </select>
            </div>
            
            {/* Champ Langue (Select) */}
            <div className="space-y-1">
                <label className="text-sm font-medium">Langue</label>
                 <select 
                  name="language" 
                  value={formData.language} 
                  onChange={handleChange} 
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                 >
                    {/* Correction: 'lang' est correctement typé ici car languageOptions est visible */}
                    {languageOptions.map((lang: Language) => ( 
                        <option key={lang} value={lang}>{lang}</option>
                    ))}
                 </select>
            </div>
          </div>
          
          {/* Champ ID Série */}
          <div className="space-y-1">
            <label htmlFor="sealed-setId" className="text-sm font-medium">ID de la Série (Optionnel, ex: SVI)</label>
            <Input 
              id="sealed-setId"
              name="setId" 
              value={formData.setId} 
              onChange={handleChange} 
              placeholder="Ex: EV1, FST, etc."
            />
          </div>
          
          <div className="grid grid-cols-3 gap-4">
             {/* Champ Quantité */}
             <div className="space-y-1">
              <label htmlFor="sealed-quantity" className="text-sm font-medium">Quantité en Stock</label>
              <Input 
                id="sealed-quantity"
                name="quantity" 
                type="number" 
                value={formData.quantity} 
                onChange={handleChange} 
                min="1"
                required
              />
            </div>
             {/* Champ Prix Achat */}
            <div className="space-y-1">
              <label htmlFor="sealed-priceBought" className="text-sm font-medium">Prix Achat (Unité €)</label>
              <Input 
                id="sealed-priceBought"
                name="priceBought" 
                type="number" 
                value={formData.priceBought} 
                onChange={handleChange} 
                step="0.01"
                min="0"
                required
              />
            </div>
             {/* Champ Valeur Actuelle */}
            <div className="space-y-1">
              <label htmlFor="sealed-marketPrice" className="text-sm font-medium">Valeur Actuelle (Unité €)</label>
              <Input 
                id="sealed-marketPrice"
                name="marketPrice" 
                type="number" 
                value={formData.marketPrice} 
                onChange={handleChange} 
                step="0.01"
                min="0"
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
            <Button type="submit">{isEditing ? 'Sauvegarder l\'Item' : 'Ajouter à l\'Inventaire'}</Button>
          </div>
        </form>
        
      </SheetContent>
    </Sheet>
  );
};

export default SealedFormSheet;