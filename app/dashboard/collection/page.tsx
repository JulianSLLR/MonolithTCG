'use client';

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2, ArrowLeft, X, Calendar, MapPin, Euro, Check, Trophy, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

// --- TYPES ---
interface TCGSet {
  id: string;
  name: string;
  logo?: string;
  symbol?: string;
  cardCount: { total: number };
  series: { name: string };
}

interface CardItem {
  id: string;
  localId: string;
  name: string;
  image?: string;
  rarity?: string;
}

// --- CONFIGURATION ---
const BLOCK_ORDER = [
  "Écarlate et Violet",
  "Épée et Bouclier",
  "Soleil et Lune",
  "XY",
  "Noir et Blanc",
  "Appel des légendes",
  "HeartGold SoulSilver",
  "Platine",
  "Diamant et Perle",
  "Bloc EX",
  "Bloc Wizards",
  "POP Series",
  "Kits Dresseur",
  "Autres"
];

const BLACKLIST_SETS = [
  "Crise Interdimensionnelle", "Gardiens astraux", "Réjouissances rayonnantes", 
  "Lumière triomphale", "Choc spatio-temporel", "L'île fabuleuse", 
  "Puissance génétique", "Pocket", "TCG Pocket"
];

// Mots-clés pour forcer la catégorie "Kits Dresseur"
const TRAINER_KIT_KEYWORDS = [
  "kit du dresseur", "trainer kit", "deck de combat", "v battle deck",
  "raichu d'alola", "lougaroc", "pikachu libre", "suicune", 
  "scalproie", "grodoudou", "bruyeverne", "latias", "latios"
];

const CONDITIONS = ["Mint", "Near Mint", "Excellent", "Good", "Light Played", "Played"];
const GRADING_COMPANIES = ["PCA", "PSA", "CCC", "CollectAura", "Beckett"];
const GRADING_SCALES: Record<string, string[]> = {
  "PCA": ["10+", "10", "9.5", "9", "8", "7", "6", "5", "4", "3", "2", "1"],
  "PSA": ["10", "9", "8.5", "8", "7.5", "7", "6.5", "6", "5", "4", "3", "2", "1"],
  "CCC": ["10 Black Label", "10 Gold Label", "10", "9.5", "9", "8.5", "8", "7", "6", "5", "4", "3", "2", "1"],
  "CollectAura": ["10", "9.5", "9", "8", "7", "6", "5", "4", "3", "2", "1", "Authentic", "Off-Centered", "Misprint", "Miscut", "Crimped", "Marked"],
  "Beckett": ["10", "9.5", "9", "8.5", "8", "7.5", "7", "6.5", "6", "5", "4", "3", "2", "4"]
};

export default function CollectionPage() {
  const { data: session } = useSession();
  
  // Données
  const [groupedSets, setGroupedSets] = useState<{ series: string, sets: TCGSet[], isOpen: boolean }[]>([]);
  const [userCollection, setUserCollection] = useState<any[]>([]);
  const [selectedSet, setSelectedSet] = useState<TCGSet | null>(null);
  const [setCards, setSetCards] = useState<CardItem[]>([]);
  
  // UI States
  const [loading, setLoading] = useState(true);
  const [loadingCards, setLoadingCards] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Formulaire
  const [modalCard, setModalCard] = useState<CardItem | null>(null);
  const defaultForm = {
    price: '',
    condition: 'Near Mint',
    dateBought: new Date().toISOString().split('T')[0],
    location: '',
    isGraded: false,
    gradingCompany: '',
    gradeNote: ''
  };
  const [formData, setFormData] = useState(defaultForm);

  // --- LOGIQUE DE TRI ---
  const detectBlock = (set: any): string => {
    const name = (set.name || "").toLowerCase();
    const series = (set.series?.name || "").toLowerCase();

    // 1. Catégories Spéciales (POP & Kits)
    if (name.includes("pop series") || name.includes("pop série")) return "POP Series";
    
    // Détection améliorée pour les Kits Dresseur avec tes mots-clés
    if (TRAINER_KIT_KEYWORDS.some(kw => name.includes(kw))) return "Kits Dresseur";

    // 2. Mapping Blocs
    if (series === "scarlet & violet") return "Écarlate et Violet";
    if (series === "sword & shield") return "Épée et Bouclier";
    if (series === "sun & moon") return "Soleil et Lune";
    if (series === "xy") return "XY";
    if (series === "black & white") return "Noir et Blanc";
    if (series === "call of legends") return "Appel des légendes";
    if (series === "heartgold & soulsilver") return "HeartGold SoulSilver";
    if (series === "platinum") return "Platine";
    if (series === "diamond & pearl") return "Diamant et Perle";
    if (series === "ex") return "Bloc EX";
    if (["base", "gym", "neo", "e-card", "legendary collection"].includes(series)) return "Bloc Wizards";

    return set.series?.name || "Autres";
  };

  // --- CHARGEMENT ---
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const [setsRes, userRes] = await Promise.all([
            fetch('https://api.tcgdex.net/v2/fr/sets'),
            session?.user?.email ? fetch(`/api/collection?userId=${session.user.email}`) : Promise.resolve(null)
        ]);
        
        const rawSets = await setsRes.json();
        const userCards = userRes && userRes.ok ? await userRes.json() : [];
        setUserCollection(Array.isArray(userCards) ? userCards : []);

        const groups: Record<string, TCGSet[]> = {};
        
        (Array.isArray(rawSets) ? rawSets : []).forEach((set: any) => {
            if (BLACKLIST_SETS.some(b => set.name.toLowerCase().includes(b.toLowerCase()))) return;
            if (set.cardCount.total === 0) return;

            const blockName = detectBlock(set);
            if (!groups[blockName]) groups[blockName] = [];
            groups[blockName].push(set);
        });

        // Création des groupes avec état "isOpen" (Fermé par défaut sauf le premier ?)
        const sorted = BLOCK_ORDER
            .filter(s => groups[s])
            .map((s, index) => ({ 
                series: s, 
                sets: groups[s].reverse(), 
                isOpen: index === 0 // Ouvre seulement le premier bloc par défaut (Écarlate)
            }));

        Object.keys(groups).forEach(k => {
            if(!BLOCK_ORDER.includes(k)) sorted.push({ series: k, sets: groups[k], isOpen: false });
        });

        setGroupedSets(sorted);
      } catch (e) { console.error(e); } 
      finally { setLoading(false); }
    };
    if (session?.user) init();
  }, [session]);

  const toggleBlock = (seriesName: string) => {
      setGroupedSets(prev => prev.map(g => g.series === seriesName ? { ...g, isOpen: !g.isOpen } : g));
  };

  const openSet = async (set: TCGSet) => {
      setSelectedSet(set);
      setLoadingCards(true);
      try {
          const res = await fetch(`https://api.tcgdex.net/v2/fr/sets/${set.id}`);
          const json = await res.json();
          setSetCards(json.cards || []);
      } catch (e) { console.error(e); }
      finally { setLoadingCards(false); }
  };

  const openModal = (card: CardItem) => {
      setModalCard(card);
      const existing = userCollection.find((c: any) => c.card_id === card.id);
      if (existing) {
          setFormData({
              price: existing.price_bought?.toString() || '',
              condition: existing.condition || 'Near Mint',
              dateBought: existing.date_bought || new Date().toISOString().split('T')[0],
              location: existing.location || '',
              isGraded: existing.is_graded || false,
              gradingCompany: existing.grade_note ? existing.grade_note.split(' ')[0] : '',
              gradeNote: existing.grade_note || ''
          });
      } else {
          setFormData(defaultForm); // Reset form si nouvelle carte
      }
  };

  const saveCard = async () => {
      if(!modalCard || !session?.user?.email || !selectedSet) return;
      const finalGrade = formData.isGraded ? formData.gradeNote : null;
      const payload = {
          user_id: session.user.email,
          card_id: modalCard.id,
          name: modalCard.name,
          set_name: selectedSet.name,
          image_url: `${modalCard.image}/high.webp`,
          price_bought: parseFloat(formData.price) || 0,
          condition: formData.condition,
          date_bought: formData.dateBought,
          location: formData.location,
          is_graded: formData.isGraded,
          grade_note: finalGrade,
          language: 'FR'
      };

      try {
          await fetch('/api/collection', { method: 'POST', body: JSON.stringify(payload) });
          const newCol = userCollection.filter(c => c.card_id !== modalCard.id);
          newCol.push({ ...payload, card_id: modalCard.id });
          setUserCollection(newCol);
          setModalCard(null);
      } catch(e) { console.error(e); }
  };

  const getStats = (setName: string, total: number) => {
    const count = userCollection.filter((c: any) => c.set_name === setName).length;
    return { count, percent: Math.round((count / (total || 1)) * 100) };
  };

  if (loading) return <div className="h-[50vh] flex items-center justify-center"><Loader2 className="animate-spin text-emerald-500 w-10 h-10"/></div>;

  // --- VUE BLOCS (ACCORDÉON) ---
  if (!selectedSet) {
    return (
      <div className="space-y-6 pb-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800">
          <div>
            <h2 className="text-3xl font-bold text-white">Ma Collection</h2>
            <p className="text-zinc-400">Progression par Blocs</p>
          </div>
          <div className="relative w-full md:w-64">
             <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500"/>
             <Input placeholder="Filtrer un bloc..." className="pl-9 bg-zinc-950 border-zinc-800" onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>

        <div className="space-y-3">
            {groupedSets.map((group) => {
                if (searchTerm && !group.series.toLowerCase().includes(searchTerm.toLowerCase())) return null;
                return (
                    <div key={group.series} className="bg-zinc-900/30 border border-zinc-800 rounded-xl overflow-hidden animate-in fade-in">
                        {/* HEADER DU BLOC (CLIQUABLE) */}
                        <button 
                            onClick={() => toggleBlock(group.series)}
                            className="w-full flex items-center justify-between p-4 hover:bg-zinc-900 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <span className={cn("transition-transform duration-300", group.isOpen ? "rotate-180" : "")}>
                                    <ChevronDown className="text-zinc-500" />
                                </span>
                                <h3 className="text-xl font-bold text-emerald-400">{group.series}</h3>
                                <Badge variant="secondary" className="bg-zinc-800 text-zinc-400 border-zinc-700">{group.sets.length} Sets</Badge>
                            </div>
                        </button>

                        {/* CONTENU DU BLOC */}
                        {group.isOpen && (
                            <div className="p-4 pt-0 border-t border-zinc-800/50 bg-zinc-950/30">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
                                    {group.sets.map((set) => {
                                        const stats = getStats(set.name, set.cardCount.total);
                                        return (
                                            <div key={set.id} onClick={() => openSet(set)} className="cursor-pointer group bg-zinc-900 border border-zinc-800 rounded-lg p-3 flex flex-col relative h-36 hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-900/10 transition-all">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="font-bold text-zinc-100 truncate pr-2 w-3/4 text-sm">{set.name}</span>
                                                    {set.symbol && <img src={`${set.symbol}.png`} className="h-4 w-4 opacity-70" alt="" />}
                                                </div>
                                                <div className="flex-grow flex items-center justify-center">
                                                    {set.logo ? (
                                                        <img src={`${set.logo}.png`} className="max-h-12 max-w-full object-contain drop-shadow-md" alt="" />
                                                    ) : (
                                                        <span className="font-bold text-lg text-zinc-500">{set.name.substring(0, 3).toUpperCase()}</span>
                                                    )}
                                                </div>
                                                <div className="mt-auto pt-2">
                                                    <div className="h-1.5 w-full bg-zinc-950 rounded-full overflow-hidden">
                                                        <div className={cn("h-full transition-all", stats.percent >= 100 ? "bg-emerald-500" : "bg-indigo-500")} style={{ width: `${stats.percent}%` }} />
                                                    </div>
                                                    <div className="flex justify-between text-[10px] text-zinc-400 mt-1">
                                                        <span>{stats.count}/{set.cardCount.total}</span>
                                                        <span>{stats.percent}%</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
      </div>
    );
  }

  // --- VUE CARTES ---
  return (
      <div className="space-y-6 pb-20 animate-in slide-in-from-right-10 duration-300">
          <div className="flex items-center gap-4 bg-zinc-900/80 p-4 rounded-xl border border-zinc-800 sticky top-4 z-10 backdrop-blur-md shadow-lg">
              <Button variant="ghost" size="icon" onClick={() => setSelectedSet(null)} className="hover:bg-white/10 text-white">
                  <ArrowLeft />
              </Button>
              {selectedSet.logo ? <img src={`${selectedSet.logo}.png`} className="h-10 w-auto" alt="" /> : <span className="font-bold text-xl text-zinc-500">{selectedSet.name}</span>}
              <div>
                  <h2 className="text-xl font-bold text-white hidden sm:block">{selectedSet.name}</h2>
                  <p className="text-xs text-zinc-400">{setCards.length} Cartes • {getStats(selectedSet.name, selectedSet.cardCount.total).count} Possédées</p>
              </div>
          </div>

          {loadingCards ? (
              <div className="flex justify-center py-20"><Loader2 className="animate-spin text-white w-8 h-8"/></div>
          ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {setCards.map((card) => {
                      const owned = userCollection.find((c: any) => c.card_id === card.id);
                      const imgUrl = card.image ? `${card.image}/high.webp` : null;
                      return (
                          <div key={card.id} onClick={() => openModal(card)} className={cn("relative aspect-[2.5/3.5] rounded-lg overflow-hidden cursor-pointer transition-all duration-300 border border-transparent", owned ? "opacity-100 scale-100 shadow-xl shadow-black/50 ring-2 ring-emerald-500" : "opacity-40 grayscale hover:opacity-100 hover:grayscale-0 hover:scale-105 hover:border-zinc-500")}>
                              {imgUrl ? <img src={imgUrl} className="w-full h-full object-cover" loading="lazy" alt={card.name} /> : <div className="w-full h-full bg-zinc-800 flex flex-col items-center justify-center text-zinc-600 p-2 text-center"><span className="text-xs font-bold">{card.name}</span></div>}
                              <div className="absolute bottom-0 right-0 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded-tl-md font-mono">{card.localId}</div>
                              {owned && <div className="absolute top-2 right-2 bg-emerald-500 text-black p-1 rounded-full shadow-lg z-10"><Check size={12} strokeWidth={4} /></div>}
                          </div>
                      );
                  })}
              </div>
          )}

          {/* MODAL */}
          {modalCard && (
             <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in">
                <div className="bg-zinc-950 border border-zinc-800 w-full max-w-md rounded-2xl p-6 relative shadow-2xl overflow-y-auto max-h-[90vh]">
                    <button onClick={() => setModalCard(null)} className="absolute top-4 right-4 text-zinc-500 hover:text-white"><X /></button>
                    
                    <div className="flex gap-4 mb-6">
                        <div className="w-20 aspect-[2.5/3.5] rounded-lg overflow-hidden border border-zinc-700 bg-zinc-900">
                             {modalCard.image ? <img src={`${modalCard.image}/high.webp`} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-zinc-800"/>}
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white line-clamp-2">{modalCard.name}</h3>
                            <p className="text-emerald-400 text-xs font-medium mb-1">{selectedSet.name}</p>
                            <Badge variant="outline" className="text-xs text-zinc-400 border-zinc-700">#{modalCard.localId}</Badge>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs text-zinc-400 flex gap-1"><Euro size={12}/> Prix</label>
                                <Input type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="bg-zinc-900 border-zinc-800 text-white h-9"/>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-zinc-400 flex gap-1"><Calendar size={12}/> Date</label>
                                <Input type="date" value={formData.dateBought} onChange={e => setFormData({...formData, dateBought: e.target.value})} className="bg-zinc-900 border-zinc-800 text-white h-9"/>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs text-zinc-400">État</label>
                            <Select value={formData.condition} onValueChange={v => setFormData({...formData, condition: v})}>
                                <SelectTrigger className="bg-zinc-900 border-zinc-800 text-white h-9"><SelectValue /></SelectTrigger>
                                <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                    {CONDITIONS.map(cond => <SelectItem key={cond} value={cond}>{cond}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs text-zinc-400 flex gap-1"><MapPin size={12}/> Lieu d'achat</label>
                            <Input placeholder="Ebay, Vinted..." value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="bg-zinc-900 border-zinc-800 text-white h-9"/>
                        </div>

                        <div className="border-t border-zinc-800 my-2 pt-2"></div>

                        <div className="flex items-center gap-2 mb-2">
                             <input type="checkbox" id="graded" checked={formData.isGraded} onChange={e => setFormData({...formData, isGraded: e.target.checked})} className="w-4 h-4 rounded bg-zinc-800 border-zinc-600 text-emerald-500 accent-emerald-500"/>
                             <label htmlFor="graded" className="text-sm font-medium text-white cursor-pointer select-none">Gradée ?</label>
                        </div>

                        {formData.isGraded && (
                            <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2">
                                <div className="space-y-1">
                                    <label className="text-xs text-zinc-400">Société</label>
                                    <Select value={formData.gradingCompany} onValueChange={v => setFormData({...formData, gradingCompany: v, gradeNote: ''})}>
                                        <SelectTrigger className="bg-zinc-900 border-zinc-800 text-white h-9"><SelectValue placeholder="-" /></SelectTrigger>
                                        <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                            {GRADING_COMPANIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-zinc-400">Note</label>
                                    <Select value={formData.gradeNote} onValueChange={v => setFormData({...formData, gradeNote: v})} disabled={!formData.gradingCompany}>
                                        <SelectTrigger className="bg-zinc-900 border-zinc-800 text-white h-9"><SelectValue placeholder="-" /></SelectTrigger>
                                        <SelectContent className="bg-zinc-900 border-zinc-800 text-white max-h-48">
                                            {formData.gradingCompany && GRADING_SCALES[formData.gradingCompany]?.map(note => <SelectItem key={note} value={note}>{note}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        )}

                        <Button onClick={saveCard} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-10 mt-4">
                            {userCollection.find((c: any) => c.card_id === modalCard.id) ? "Mettre à jour" : "Ajouter à ma collection"}
                        </Button>
                    </div>
                </div>
             </div>
          )}
      </div>
  );
}