// app/dashboard/import/page.tsx
'use client';

import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { CollectionItemImport } from '@/types'; // Utilisation de votre type
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const ImportExcelPage = () => {
  const [data, setData] = useState<CollectionItemImport[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Lit le fichier Excel/CSV et extrait les données brutes.
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsProcessing(true);

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const binaryString = event.target?.result as string;
        const workbook = XLSX.read(binaryString, { type: 'binary' });
        
        // Supposons que la première feuille contient les données
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Conversion de la feuille de calcul en tableau d'objets JSON
        const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet, {
            header: 1, // Garder le nom des colonnes pour le mappage
            raw: false,
        });

        // Le premier élément est l'en-tête (les noms des colonnes)
        const headers = rawJson[0];
        const dataRows = rawJson.slice(1);

        // --- MAPPAGE DES DONNÉES VERS LE TYPE CollectionItemImport ---
        const importedData: CollectionItemImport[] = dataRows.map((row: any[]) => {
            
            // Fonction utilitaire pour trouver la valeur par le nom de l'en-tête
            const getValue = (headerName: string) => {
                const index = headers.findIndex((h: string) => h?.toLowerCase().trim() === headerName.toLowerCase().trim());
                // Si la ligne est vide, row[index] peut être undefined, on retourne la valeur brute
                return index !== -1 ? row[index] : undefined; 
            };

            return {
                // Utilisation de plusieurs noms de colonnes possibles pour plus de robustesse
                name: getValue('name') || getValue('Nom') || '',
                set: getValue('set') || getValue('Série') || '',
                language: getValue('language') || getValue('Langue') || '',
                condition: getValue('condition') || getValue('État') || '',
                // Type par défaut à 'Card' si non spécifié
                type: (getValue('type') || 'Card') as 'Card' | 'Sealed',
                price_bought: Number(getValue('price_bought') || getValue('Prix Achat') || 0),
                market_price: Number(getValue('market_price') || getValue('Prix Marché') || 0),
                notes: getValue('notes') || getValue('Notes') || undefined,
            };
        });
        
        setData(importedData.filter(item => item.name)); // Filtrer les lignes vides (sans nom)
        setIsProcessing(false);

      } catch (e) {
        // En cas d'erreur de lecture (fichier corrompu, format incorrect, etc.)
        console.error("Erreur de lecture XLSX:", e);
        setError("Erreur lors de la lecture du fichier. Assurez-vous que le format est correct (XLSX, XLS ou CSV).");
        setIsProcessing(false);
        setData([]);
      }
    };

    reader.readAsBinaryString(file);
  };
  
  /**
   * Envoie les données traitées à l'API/au Store (À implémenter)
   */
  const handleImportToDatabase = () => {
      // TODO: Remplacer l'alerte par un appel à votre API ou à votre store (ex: useStore)
      alert(`Tentative d'import de ${data.length} éléments dans la base de données.`);
      
      // Ici, vous ajouteriez la logique d'appel API vers votre backend.
      
      // Réinitialisation après succès
      setData([]);
      setFileName(null);
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">📂 Import de Données (Excel/CSV)</h1>
      <p className="text-neutral-400 mt-2">Importez vos collections en masse pour les cartes et items scellés.</p>

      <Separator className="my-6" />
      
      <div className="flex items-center space-x-4">
        
        {/* INPUT FILE MASQUÉ (doit être rendu pour pouvoir être référencé) */}
        <input 
          id="file-upload-input" // <--- ID utilisé par le Label
          type="file" 
          accept=".xlsx, .xls, .csv" 
          onChange={handleFileChange} 
          className="hidden" // Cache l'input par défaut
        />

        {/* LABEL qui agit comme un bouton (GRÂCE AU htmlFor) */}
        <label htmlFor="file-upload-input" className="cursor-pointer">
          <Button>
            {fileName ? `Fichier chargé : ${fileName}` : "Sélectionner un Fichier Excel/CSV"}
          </Button>
        </label>
        
        
        {fileName && data.length > 0 && (
            <Button 
                onClick={handleImportToDatabase} 
                variant="default"
                disabled={isProcessing}
            >
                Importer {data.length} Éléments
            </Button>
        )}
      </div>
      
      {isProcessing && <p className="mt-4 text-yellow-500">Traitement du fichier en cours...</p>}
      {error && <p className="mt-4 text-red-500 font-medium">Erreur : {error}</p>}
      
      {/* Aperçu des Données Importées */}
      {data.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">{data.length} lignes prêtes à être importées :</h2>
          
          <div className="overflow-x-auto border rounded-lg">
            <table className="min-w-full table-auto text-sm">
              <thead>
                <tr className="bg-neutral-800">
                  <th className="px-4 py-2 text-left">Type</th>
                  <th className="px-4 py-2 text-left">Nom</th>
                  <th className="px-4 py-2 text-left">Série</th>
                  <th className="px-4 py-2 text-right">Achat (€)</th>
                  <th className="px-4 py-2 text-right">Marché (€)</th>
                </tr>
              </thead>
              <tbody>
                {data.slice(0, 10).map((item, index) => ( // Affichage des 10 premières lignes
                  <tr key={index} className="border-t hover:bg-neutral-700">
                    <td className="px-4 py-2 font-medium">{item.type}</td>
                    <td className="px-4 py-2">{item.name}</td>
                    <td className="px-4 py-2">{item.set}</td>
                    <td className="px-4 py-2 text-right">{item.price_bought.toFixed(2)}</td>
                    <td className="px-4 py-2 text-right">{item.market_price.toFixed(2)}</td>
                  </tr>
                ))}
                {data.length > 10 && (
                     <tr className="border-t bg-neutral-800/50">
                        <td colSpan={5} className="px-4 py-2 text-center text-neutral-400">
                            ... et {data.length - 10} lignes supplémentaires.
                        </td>
                     </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImportExcelPage;