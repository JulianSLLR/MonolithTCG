'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CardComponent } from '@/components/collection/CardComponent';
import { Search, Loader2, X, AlertCircle } from 'lucide-react';
import { PokemonCard } from '@/types';

export default function SearchPage() {
  const { data: session } = useSession();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PokemonCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedCard, setSelectedCard] = useState<PokemonCard | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query || query.length < 3) return;
    setLoading(true);
    setError('');
    setResults([]);

    try {
      // Recherche sur TCGDex (API Française)
      const res = await fetch(`https://api.tcgdex.net/v2/fr/cards?name=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error("Erreur TCGDex");
      
      const json = await res.json();

      if (!json || json.length === 0) {
          setError("Aucune carte trouvée.");
          setLoading(false);
          return;
      }

      // Nettoyage des données
      const formatted: PokemonCard[] = json
        .filter((c: any) => c.image || (c.set && c.localId)) // On garde si image ou info complète
        .slice(0, 50)
        .map((c: any) => {
             // Construction manuelle de l'URL image pour être sûr à 100%
             // Format : https://assets.tcgdex.net/fr/{setId}/{localId}/high.webp
             const setId = c.set?.id?.toLowerCase();
             const localId = c.localId?.toLowerCase();
             
             // Si l'API donne déjà une image complète, on prend, sinon on construit
             let finalImage = c.image;
             if (!finalImage && setId && localId) {
                 finalImage = `https://assets.tcgdex.net/fr/${setId}/${localId}/high.webp`;
             } else if (finalImage && !finalImage.endsWith('.webp')) {
                 finalImage = `${finalImage}/high.webp`;
             }

             return {
                id: c.id,
                name: c.name,
                imageUrl: finalImage,
                number: c.localId,
                rarity: c.rarity || 'Common',
                language: 'FR',
                marketPrice: 0, 
                condition: 'Near Mint',
                setId: c.set?.id || 'unknown',
                setName: c.set?.name || 'Série Inconnue'
             };
        });
      
      setResults(formatted);

    } catch (err) {
      console.error(err);
      setError("Erreur de connexion.");
    } finally {
      setLoading(false);
    }
  };

  const addCard = async () => {
      if(!selectedCard || !session?.user?.email) return;
      // ... (Logique d'ajout simplifiée pour la démo, tu peux remettre ton modal complet ici)
      try {
        await fetch('/api/collection', {
            method: 'POST',
            body: JSON.stringify({
                user_id: session.user.email,
                card_id: selectedCard.id,
                name: selectedCard.name,
                set_name: selectedCard.setName,
                image_url: selectedCard.imageUrl,
                price_bought: 0, // Valeur par défaut
                condition: 'Near Mint'
            })
        });
        alert("Carte ajoutée !");
        setSelectedCard(null);
      } catch(e) { console.error(e); }
  };

  return (
    <div className="space-y-6">
       <h1 className="text-3xl font-bold flex items-center gap-2 text-white">
         <Search className="text-emerald-500"/> Rechercher (VF)
       </h1>
       <form onSubmit={handleSearch} className="flex gap-2 max-w-xl">
          <Input 
            value={query} 
            onChange={e => setQuery(e.target.value)} 
            placeholder="Ex: Dracaufeu..." 
            className="bg-zinc-900 border-zinc-700 text-white"
          />
          <Button type="submit" disabled={loading} className="bg-emerald-600">
            {loading ? <Loader2 className="animate-spin"/> : "Chercher"}
          </Button>
       </form>

       {error && <div className="text-red-400">{error}</div>}

       <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {results.map(card => (
            <div key={card.id}>
                {/* On passe une image par défaut si l'URL est vide */}
                <CardComponent 
                    card={card} 
                    hideBadges={true} 
                    onAddClick={(c) => setSelectedCard(c)} 
                />
            </div>
          ))}
       </div>
       
       {/* Modal simple de confirmation */}
       {selectedCard && (
           <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
               <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-700">
                   <h2 className="text-white text-xl font-bold mb-4">Ajouter {selectedCard.name} ?</h2>
                   <div className="flex gap-4">
                       <Button variant="outline" onClick={() => setSelectedCard(null)}>Annuler</Button>
                       <Button className="bg-emerald-600" onClick={addCard}>Confirmer</Button>
                   </div>
               </div>
           </div>
       )}
    </div>
  );
}