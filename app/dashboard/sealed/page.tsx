// app/dashboard/sealed/page.tsx
'use client'; 

import { useState } from 'react';
// Assurez-vous que ce chemin est correct pour accéder à vos données mockées
import { mockSealedData } from '@/lib/mock-data'; 
// Assurez-vous que le type SealedProduct est bien exporté de '@/types'
import { SealedProduct } from '@/types'; 

// Imports des composants UI
import { Button } from '@/components/ui/button'; 
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator'; 
import SealedFormSheet from '@/components/sealed/SealedFormSheet'; 

const SealedPage = () => {
  // État local (sera remplacé par un store/API plus tard)
  const [sealedItems, setSealedItems] = useState<SealedProduct[]>(mockSealedData);
  const [searchTerm, setSearchTerm] = useState('');
  
  // États pour la gestion du formulaire (Sheet)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<SealedProduct | undefined>(undefined); 

  // --- Gestion du Formulaire ---
  
  const handleOpenAdd = () => {
    setItemToEdit(undefined); // Mode Ajout
    setIsFormOpen(true);
  };

  const handleOpenEdit = (item: SealedProduct) => {
    setItemToEdit(item); // Mode Édition
    setIsFormOpen(true);
  };
  
  const handleFormSubmit = (itemData: Omit<SealedProduct, 'id'>) => {
    if (itemToEdit) {
      // LOGIQUE DE MODIFICATION (Mock)
      setSealedItems(prev => 
        prev.map(i => i.id === itemToEdit.id ? { ...itemToEdit, ...itemData } : i)
      );
    } else {
      // LOGIQUE D'AJOUT (Mock)
      const newItem: SealedProduct = {
        id: Date.now().toString(), // ID simple pour le mock
        ...itemData,
      };
      setSealedItems(prev => [...prev, newItem]);
    }
  };
  // -----------------------------

  // Logique de Filtrage
  const filteredItems = sealedItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.type.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Calculs des Totaux
  const totalCost = filteredItems.reduce((acc, item) => acc + (item.priceBought * item.quantity), 0);
  const totalMarketValue = filteredItems.reduce((acc, item) => acc + (item.marketPrice * item.quantity), 0);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">📦 Mes Items Scellés</h1>
        <Button onClick={handleOpenAdd}>
          + Ajouter un Item Scellé
        </Button>
      </div>

      <Separator className="mb-6" />

      {/* Affichage des Totaux (Mini-Dashboard) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 border rounded-lg bg-neutral-900">
          <p className="text-sm text-neutral-400">Nombre d'Items Uniques</p>
          <p className="text-2xl font-semibold">{filteredItems.length}</p>
        </div>
        <div className="p-4 border rounded-lg bg-neutral-900">
          <p className="text-sm text-neutral-400">Coût Total d'Achat</p>
          <p className="text-2xl font-semibold">{totalCost.toFixed(2)} €</p>
        </div>
        <div className="p-4 border rounded-lg bg-neutral-900">
          <p className="text-sm text-neutral-400">Valeur Marchande Actuelle</p>
          <p className="text-2xl font-semibold">{totalMarketValue.toFixed(2)} €</p>
        </div>
      </div>
      
      <div className="mb-6">
        <Input
          placeholder="Rechercher par nom ou type de produit..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* Tableau des Items Scellés */}
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border-collapse">
          <thead>
            <tr className="border-b">
              <th className="px-4 py-2 text-left">Nom du Produit</th>
              <th className="px-4 py-2 text-left">Type</th>
              <th className="px-4 py-2 text-left">Langue</th>
              <th className="px-4 py-2 text-right">Qté</th>
              <th className="px-4 py-2 text-right">Prix Achat (U.)</th>
              <th className="px-4 py-2 text-right">Valeur Marchande (U.)</th>
              <th className="px-4 py-2 text-right">Total Valeur</th>
              <th className="px-4 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item) => (
              <tr key={item.id} className="border-b hover:bg-neutral-800">
                <td className="px-4 py-2 font-medium">{item.name}</td>
                <td className="px-4 py-2 text-sm">{item.type}</td>
                <td className="px-4 py-2 text-sm">{item.language}</td>
                <td className="px-4 py-2 text-right">{item.quantity}</td>
                <td className="px-4 py-2 text-right">{item.priceBought.toFixed(2)} €</td>
                <td className="px-4 py-2 text-right">{item.marketPrice.toFixed(2)} €</td>
                <td className="px-4 py-2 text-right font-bold">{(item.marketPrice * item.quantity).toFixed(2)} €</td>
                <td className="px-4 py-2 text-right">
                  <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(item)}>
                    Modifier
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredItems.length === 0 && (
        <p className="mt-8 text-center text-neutral-500">
          Aucun item scellé trouvé.
        </p>
      )}

      {/* Composant de Formulaire Modale */}
      <SealedFormSheet
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        initialItem={itemToEdit}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
};

export default SealedPage;