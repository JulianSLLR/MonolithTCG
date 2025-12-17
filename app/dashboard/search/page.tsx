'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CardComponent } from '@/components/collection/CardComponent';
import { Search, Loader2, X, Calendar as CalendarIcon, MapPin, Euro, AlertCircle } from 'lucide-react';
import { PokemonCard } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// --- Types pour le formulaire ---
interface AddCardForm {
  price: string;
  condition: string;
  language: string;
  isGraded: boolean;
  gradeNote?: string;
  dateBought: string;
  location: string;
}

export default function SearchPage() {
  const { data: session } = useSession();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PokemonCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // --- Gestion du Pop-up (Modal) ---
  const [selectedCard, setSelectedCard] = useState<PokemonCard | null>(null);
  const [formData, setFormData] = useState<AddCardForm>({
    price: '',
    condition: 'Near Mint',
    language: 'FR',
    isGraded: false,
    gradeNote: '',
    dateBought: new Date().toISOString().split('T')[0],
    location: ''
  });
  const [adding, setAdding] = useState(false);

  // 1. Fonction de Recherche (Assouplie)
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    setLoading(true);
    setError('');
    setResults([]);

    try {
      const safeQuery = encodeURIComponent(query);
      // On demande les cartes FR
      const res = await fetch(`https://api.tcgdex.net/v2/fr/cards?name=${safeQuery}`);
      
      if (!res.ok) throw new Error("Erreur réseau TCGDex");
      
      const json = await res.json();

      if (!json || json.length === 0) {
          setError("Aucune carte trouvée. Essayez un nom exact (ex: 'Pikachu').");
          setLoading(false);
          return;
      }

      // --- FILTRAGE ET NETTOYAGE ---
      const formatted: PokemonCard[] = json
        // On retire les cartes qui n'ont pas de Set ID (souvent des bugs ou cartes online)
        .filter((c: any) => c.set && c.localId)
        .slice(0, 50)
        .map((c: any) => {
             // Construction URL image sécurisée
             let imgUrl = c.image;
             // Si l'image est juste un chemin partiel ou termine bizarrement, on tente le high.webp
             if (imgUrl && !imgUrl.endsWith('.png') && !imgUrl.endsWith('.webp') && !imgUrl.endsWith('.jpg')) {
                imgUrl = `${imgUrl}/high.webp`;
             }

             return {
                id: c.id,
                name: c.name,
                imageUrl: imgUrl || "", // Si vide, le composant affichera "Poké"
                number: c.localId,
                rarity: c.rarity || 'Common',
                language: 'FR',
                marketPrice: 0, 
                condition: 'Near Mint', 
                setId: c.set.id,
                setName: c.set.name
             };
        });
      
      setResults(formatted);

    } catch (err) {
      console.error(err);
      setError("Erreur technique lors de la recherche.");
    } finally {
      setLoading(false);
    }
  };

  // 2. Ouvrir le formulaire
  const openAddModal = (card: PokemonCard) => {
    setSelectedCard(card);
    setFormData({ ...formData, price: '0' }); 
  };

  // 3. Envoyer à la base de données
  const confirmAdd = async () => {
    if (!selectedCard || !session?.user?.email) return;
    setAdding(true);

    try {
        const payload = {
            user_id: session.user.email,
            card_id: selectedCard.id,
            name: selectedCard.name,
            set_name: selectedCard.setName, // Correction ici : on utilise setName
            image_url: selectedCard.imageUrl,
            price_bought: parseFloat(formData.price) || 0,
            condition: formData.condition,
            date_bought: formData.dateBought,
            location: formData.location,
            language: formData.language,
            is_graded: formData.isGraded,
            grade_note: formData.gradeNote
        };

        const response = await fetch('/api/collection', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (response.ok) {
            alert("Carte ajoutée !");
            setSelectedCard(null); 
        } else {
            alert("Erreur lors de l'ajout.");
        }
    } catch (e) {
        console.error(e);
    } finally {
        setAdding(false);
    }
  };

  return (
    <div className="space-y-6 relative">
       <h1 className="text-3xl font-bold flex items-center gap-2 text-white">
         <Search className="text-emerald-500"/> Rechercher
       </h1>
       
       <form onSubmit={handleSearch} className="flex gap-2 max-w-xl">
          <Input 
            value={query} 
            onChange={e => setQuery(e.target.value)} 
            placeholder="Ex: Dracaufeu, Pikachu..." 
            className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500"
          />
          <Button type="submit" disabled={loading} className="min-w-[100px] bg-emerald-600 hover:bg-emerald-700 text-white">
            {loading ? <Loader2 className="animate-spin"/> : "Chercher"}
          </Button>
       </form>

       {error && <div className="text-red-400 bg-red-900/20 p-4 rounded border border-red-900 flex items-center gap-2"><AlertCircle size={16}/> {error}</div>}

       <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {results.map(card => (
            <div key={card.id} className="animate-in fade-in zoom-in duration-300">
                <CardComponent card={card} hideBadges={true} onAddClick={openAddModal} />
            </div>
          ))}
       </div>

       {/* MODAL D'AJOUT (Identique à avant) */}
       {selectedCard && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-zinc-900 border border-zinc-800 w-full max-w-lg rounded-xl shadow-2xl p-6 relative">
                <button onClick={() => setSelectedCard(null)} className="absolute top-4 right-4 text-zinc-400 hover:text-white"><X size={24} /></button>
                <h2 className="text-2xl font-bold text-white mb-1">Ajouter à la collection</h2>
                <p className="text-zinc-400 text-sm mb-6">{selectedCard.name} - {selectedCard.setName}</p>
                <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-zinc-400 flex items-center gap-1"><Euro size={12}/> Prix d'achat</label>
                            <Input type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="bg-zinc-950 border-zinc-800 text-white" placeholder="0.00"/>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-zinc-400 flex items-center gap-1"><CalendarIcon size={12}/> Date d'achat</label>
                            <Input type="date" value={formData.dateBought} onChange={e => setFormData({...formData, dateBought: e.target.value})} className="bg-zinc-950 border-zinc-800 text-white"/>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <label className="text-xs font-medium text-zinc-400">État</label>
                            <Select value={formData.condition} onValueChange={v => setFormData({...formData, condition: v})}>
                                <SelectTrigger className="bg-zinc-950 border-zinc-800 text-white"><SelectValue /></SelectTrigger>
                                <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                    <SelectItem value="Mint">Mint (Parfait)</SelectItem>
                                    <SelectItem value="Near Mint">Near Mint (Très bon)</SelectItem>
                                    <SelectItem value="Excellent">Excellent</SelectItem>
                                    <SelectItem value="Good">Good (Bon)</SelectItem>
                                    <SelectItem value="Played">Played (Abimé)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-zinc-400">Langue</label>
                            <Select value={formData.language} onValueChange={v => setFormData({...formData, language: v})}>
                                <SelectTrigger className="bg-zinc-950 border-zinc-800 text-white"><SelectValue /></SelectTrigger>
                                <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                    <SelectItem value="FR">🇫🇷 Français</SelectItem>
                                    <SelectItem value="EN">🇺🇸 Anglais</SelectItem>
                                    <SelectItem value="JP">🇯🇵 Japonais</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-zinc-400 flex items-center gap-1"><MapPin size={12}/> Lieu d'achat</label>
                        <Input value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="bg-zinc-950 border-zinc-800 text-white" placeholder="Ex: Vide grenier, eBay..."/>
                    </div>
                    <Button onClick={confirmAdd} disabled={adding} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold mt-4">
                        {adding ? <Loader2 className="animate-spin mr-2"/> : "Confirmer l'ajout"}
                    </Button>
                </div>
            </div>
         </div>
       )}
    </div>
  );
}