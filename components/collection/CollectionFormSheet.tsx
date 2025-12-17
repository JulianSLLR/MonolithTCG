// components/collection/CollectionFormSheet.tsx
'use client';

import React, { useState, useEffect } from 'react';
// --- CORRECTION : Import de PokemonCard au lieu de CardItem ---
import { PokemonCard } from '@/types'; 
import { Button } from '@/components/ui/button'; 
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
// Si vous utilisez un Select custom, assurez-vous de l'importer ici

interface CollectionFormProps {
  isOpen: boolean;
  onClose: () => void;
  // Utilisation de PokemonCard
  initialCard?: PokemonCard; 
  onSubmit: (cardData: Omit<PokemonCard, 'id'>) => void; 
}

const CollectionFormSheet: React.FC<CollectionFormProps> = ({ 
  isOpen, 
  onClose, 
  initialCard, 
  onSubmit 
}) => {
  
  const isEditing = !!initialCard;
  
  // Utilisation de PokemonCard
  const [formData, setFormData] = useState<Omit<PokemonCard, 'id'>>({
    name: '',
    number: '',
    rarity: '',
    condition: 'Near Mint', 
    language: 'FR',
    setId: '',
    marketPrice: 0,
    priceBought: 0,
    isGraded: false,
    imageUrl: '', // Ajout des champs de PokemonCard
  });

  // Hydrater le formulaire si on est en mode édition
  useEffect(() => {
    if (initialCard) {
      const { id, ...dataWithoutId } = initialCard; 
      setFormData({
         ...dataWithoutId, 
         // Assurer que les champs optionnels sont définis
         priceBought: dataWithoutId.priceBought ?? 0,
         isGraded: dataWithoutId.isGraded ?? false,
      });
    } else {
      // Réinitialiser pour un nouvel ajout
      setFormData({ 
        name: '', number: '', rarity: '', condition: 'Near Mint', 
        language: 'FR', setId: '', marketPrice: 0, priceBought: 0, 
        isGraded: false, imageUrl: ''
      });
    }
  }, [initialCard]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    const finalValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'marketPrice' || name === 'priceBought' ? Number(finalValue) : finalValue,
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Logique de soumission simplifiée
    const { imageUrl, priceBought, isGraded, ...dataToSend } = formData;
    onSubmit({
        ...dataToSend,
        imageUrl: imageUrl || undefined,
        priceBought: priceBought || undefined,
        isGraded: isGraded || undefined,
    });
    onClose(); 
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>{isEditing ? 'Modifier la Carte' : 'Ajouter une Nouvelle Carte'}</SheetTitle>
          <SheetDescription>
            {isEditing ? `Mise à jour de la carte : ${initialCard?.name}` : "Entrez les détails de votre nouvelle carte de collection."}
          </SheetDescription>
        </SheetHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-6">
          
          {/* CORRECTION INPUT 1 */}
          <div className="space-y-1">
            <label htmlFor="card-name" className="text-sm font-medium">Nom de la carte</label>
            <Input 
              id="card-name"
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              required 
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {/* CORRECTION INPUT 2 */}
            <div className="space-y-1">
              <label htmlFor="card-set" className="text-sm font-medium">ID de la Série (Set)</label>
              <Input 
                id="card-set"
                name="setId" 
                value={formData.setId} 
                onChange={handleChange} 
                required 
              />
            </div>
            {/* CORRECTION INPUT 3 */}
            <div className="space-y-1">
              <label htmlFor="card-number" className="text-sm font-medium">Numéro</label>
              <Input 
                id="card-number"
                name="number" 
                value={formData.number} 
                onChange={handleChange} 
              />
            </div>
          </div>
          
          {/* ... (Select Condition, etc. - le Select n'avait pas d'erreur de 'label') ... */}
          {/* Champ Condition */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Condition</label>
             <select 
              name="condition" 
              value={formData.condition} 
              onChange={handleChange} 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
             >
                <option value="Mint">Mint</option>
                <option value="Near Mint">Near Mint</option>
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Played">Played</option>
             </select>
          </div>
          
          {/* Champ Gradée */}
          <div className="flex items-center space-x-2">
             <input
              type="checkbox"
              name="isGraded"
              checked={formData.isGraded}
              onChange={handleChange}
              id="isGraded"
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="isGraded" className="text-sm font-medium">Carte Gradée</label>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {/* CORRECTION INPUT 4 */}
            <div className="space-y-1">
              <label htmlFor="card-priceBought" className="text-sm font-medium">Prix d'Achat (€)</label>
              <Input 
                id="card-priceBought"
                name="priceBought" 
                type="number" 
                value={formData.priceBought} 
                onChange={handleChange} 
                step="0.01"
                min="0"
              />
            </div>
            {/* CORRECTION INPUT 5 */}
            <div className="space-y-1">
              <label htmlFor="card-marketPrice" className="text-sm font-medium">Valeur Marchande Actuelle (€)</label>
              <Input 
                id="card-marketPrice"
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
            <Button type="submit">{isEditing ? 'Sauvegarder les Modifications' : 'Ajouter à la Collection'}</Button>
          </div>
        </form>
        
      </SheetContent>
    </Sheet>
  );
};

export default CollectionFormSheet;