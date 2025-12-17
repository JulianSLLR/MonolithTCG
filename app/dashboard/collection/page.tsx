"use client";

import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2, CheckCircle2, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface TCGSet {
  id: string;
  name: string;
  logo?: string;
  symbol?: string;
  cardCount: { total: number };
  series: { name: string };
}

// Ordre d'affichage souhaité des blocs (Du plus récent au plus vieux)
const SERIES_ORDER = [
  "Écarlate et Violet",
  "Épée et Bouclier",
  "Soleil et Lune",
  "XY",
  "Noir et Blanc",
  "HeartGold SoulSilver",
  "Platine",
  "Diamant et Perle",
  "Bloc EX",
  "Wizards of the Coast",
  "Autres Séries"
];

export default function CollectionPage() {
  const { data: session } = useSession();
  const [groupedSets, setGroupedSets] = useState<{ series: string, sets: TCGSet[] }[]>([]);
  const [userCollection, setUserCollection] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortMode, setSortMode] = useState<'block' | 'alpha' | 'mostCompleted' | 'mostCards'>(() => {
    try {
      const v = localStorage.getItem('monolith:defaultSort');
      if (v === 'alpha' || v === 'mostCompleted' || v === 'mostCards' || v === 'block') return v as any;
    } catch (e) {
      // ignore
    }
    return 'block';
  });

  useEffect(() => {
    let controller: AbortController | null = null;
    const fetchData = async () => {
      setLoading(true);
      setFetchError(null);
  controller = new AbortController();
  const timeoutId: any = setTimeout(() => controller?.abort(), 10000);

      try {
        const setsRes = await fetch('https://api.tcgdex.net/v2/fr/sets', { signal: controller.signal });
        const setsJson = await setsRes.json();

        let userCards: any[] = [];
        if (session?.user?.email) {
          try {
            const myCollectionRes = await fetch(`/api/collection?userId=${session.user.email}`, { signal: controller.signal });
            if (myCollectionRes.ok) userCards = await myCollectionRes.json();
          } catch (innerErr) {
            // ignore user collection errors but keep loading sets
            console.warn('Erreur chargement collection utilisateur', innerErr);
          }
        }

        const rawSets = Array.isArray(setsJson) ? setsJson : [];
        setUserCollection(Array.isArray(userCards) ? userCards : []);

        // --- TRAITEMENT DES DONNÉES ---
        // 1. Filtrer les indésirables (TCG Pocket)
        const filteredSets = rawSets.filter((s: any) => {
          const seriesName = (s.series?.name || '').toLowerCase();
          if (!seriesName) return false;
          if (seriesName.includes('pocket')) return false;
          if ((s.cardCount?.total || 0) === 0) return false;
          return true;
        });

        // 2. Grouper par Série
        const groups: Record<string, TCGSet[]> = {};
        filteredSets.forEach((set: any) => {
          const sName = set.series?.name || 'Autres Séries';
          if (!groups[sName]) groups[sName] = [];
          groups[sName].push(set);
        });

        // 3. Grouper en tableau
        let sortedGroups: { series: string; sets: TCGSet[] }[] = SERIES_ORDER
          .filter(series => groups[series])
          .map(series => ({ series, sets: groups[series].slice().reverse() }));

        Object.keys(groups).forEach(key => {
          if (!SERIES_ORDER.includes(key)) {
            sortedGroups.push({ series: key, sets: groups[key] });
          }
        });

        // 4. Appliquer un tri additionnel selon sortMode
        const getCompletion = (set: TCGSet) => {
          const total = set.cardCount?.total || 0;
          const owned = userCards.filter((c: any) => c.set_name === set.name).length;
          return total === 0 ? 0 : Math.round((owned / total) * 100);
        };

        if (sortMode === 'alpha') {
          sortedGroups = sortedGroups.map(g => ({ ...g, sets: g.sets.slice().sort((a, b) => a.name.localeCompare(b.name)) }));
        } else if (sortMode === 'mostCards') {
          sortedGroups = sortedGroups.map(g => ({ ...g, sets: g.sets.slice().sort((a, b) => (b.cardCount?.total || 0) - (a.cardCount?.total || 0)) }));
        } else if (sortMode === 'mostCompleted') {
          sortedGroups = sortedGroups.map(g => ({ ...g, sets: g.sets.slice().sort((a, b) => getCompletion(b) - getCompletion(a)) }));
        }

        setGroupedSets(sortedGroups);
      } catch (e: any) {
        if (e.name === 'AbortError') {
          console.warn('Fetch aborted or timed out');
          setFetchError('Le chargement a pris trop de temps. Réessaye plus tard.');
        } else {
          console.error('Erreur chargement:', e);
          setFetchError('Erreur lors du chargement des séries.');
        }
      } finally {
        setLoading(false);
        if (controller) {
          clearTimeout(timeoutId);
        }
      }
    };

    fetchData();

    return () => {
      try {
        controller?.abort();
      } catch (e) {
        // ignore
      }
    };
  }, [session, sortMode]);

  // Filtre local pour la recherche : recherche par nom de série OU nom de set
  const filteredGroups = useMemo(() => {
    if (!searchTerm) return groupedSets;
    const q = searchTerm.toLowerCase();
    return groupedSets
      .map(g => ({ ...g, sets: g.sets.filter(s => s.name.toLowerCase().includes(q)) }))
      .filter(g => g.series.toLowerCase().includes(q) || (g.sets && g.sets.length > 0));
  }, [groupedSets, searchTerm]);

  // Réagir aux changements de préférences sauvegardées dans d'autres onglets
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'monolith:defaultSort') {
        const v = e.newValue;
        if (v === 'alpha' || v === 'mostCompleted' || v === 'mostCards' || v === 'block') {
          setSortMode(v as any);
        }
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Export simple CSV de la collection utilisateur
  const exportCSV = () => {
    if (!userCollection || userCollection.length === 0) {
      alert('Aucune donnée à exporter.');
      return;
    }

    const headers = Array.from(new Set(userCollection.flatMap(Object.keys)));
    const rows = userCollection.map((item: any) => headers.map(h => (item[h] !== undefined && item[h] !== null) ? String(item[h]).replace(/\n/g, ' ') : ''));
    const csv = [headers.join(';'), ...rows.map(r => r.map(cell => `"${cell.replace(/"/g, '""')}"`).join(';'))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'collection_export.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const getSetStats = (setName: string, total: number) => {
    // Comparaison par nom de set (plus fiable avec TCGDex)
    const myCardsInSet = userCollection.filter((c: any) => c.set_name === setName).length;
    const safeTotal = total || 100; 
    return { count: myCardsInSet, percentage: Math.min(100, Math.round((myCardsInSet / safeTotal) * 100)) };
  };

  if (loading) return <div className="h-[50vh] flex items-center justify-center"><Loader2 className="animate-spin text-indigo-500 w-10 h-10"/></div>;

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800">
        <div>
          <h2 className="text-3xl font-bold text-white mb-1">🃏 Mes cartes</h2>
        </div>
        <div className="w-full md:w-96 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500"/>
            <Input placeholder="Filtrer par série ou extension..." className="pl-9 bg-zinc-950 border-zinc-800" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>

          <select
            aria-label="Trier"
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value as any)}
            className="h-10 rounded-md bg-zinc-950 border border-zinc-800 px-3 text-sm text-zinc-200"
          >
            <option value="block">Par Bloc (défaut)</option>
            <option value="alpha">Par Nom (A → Z)</option>
            <option value="mostCompleted">Par Progression (décroissant)</option>
            <option value="mostCards">Par Taille de set (décroissant)</option>
          </select>

          <Button variant="outline" onClick={exportCSV} title="Exporter la collection en CSV">
            <FileText className="mr-2 w-4 h-4" /> Export
          </Button>
        </div>
      </div>

      {fetchError && (
        <div className="p-4 rounded-md bg-yellow-900 text-yellow-100">{fetchError}</div>
      )}

  {filteredGroups.map((group) => {
         if (searchTerm && !group.series.toLowerCase().includes(searchTerm.toLowerCase())) return null;

         return (
            <div key={group.series} className="space-y-4 animate-in fade-in duration-500">
                <div className="flex items-center gap-3 border-b border-zinc-800 pb-2 mt-8">
                    <h3 className="text-2xl font-bold text-indigo-400">{group.series}</h3>
                    <span className="text-xs text-zinc-500 bg-zinc-900 px-2 py-1 rounded-full border border-zinc-800">
                        {group.sets.length} Extensions
                    </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {group.sets.map((set) => {
                        const totalCards = set.cardCount?.total || 0;
                        const stats = getSetStats(set.name, totalCards);
                        const isCompleted = stats.percentage >= 100;

                        return (
                            <div key={set.id} className="group bg-zinc-900 border border-zinc-800 hover:border-indigo-500 rounded-xl p-4 transition-all relative overflow-hidden flex flex-col h-full">
                                <div className="flex justify-between items-start mb-4">
                                    <span className="font-bold text-zinc-100 truncate pr-2" title={set.name}>{set.name}</span>
                                    {set.symbol && <img src={`${set.symbol}.png`} loading="lazy" decoding="async" className="h-6 w-6 opacity-60" alt="" />}
                                </div>
                                
                                {/* Logo ou Texte si pas de logo */}
                                <div className="h-24 flex items-center justify-center mb-6 flex-grow">
                  {set.logo ? (
                    <img src={`${set.logo}.png`} loading="lazy" decoding="async" className="max-h-full max-w-full object-contain" alt={set.name} />
                  ) : (
                                        <div className="text-center">
                                            <span className="text-xl font-bold text-zinc-700 block">{set.name}</span>
                                            <span className="text-xs text-zinc-600">(Pas d'image)</span>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2 mt-auto">
                                    <div className="flex justify-between text-xs font-medium text-zinc-400">
                                        <span>{stats.count} / {totalCards}</span><span>{stats.percentage}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
                                        <div className={cn("h-full transition-all duration-500", isCompleted ? "bg-emerald-500" : "bg-indigo-600")} style={{ width: `${stats.percentage}%` }} />
                                    </div>
                                </div>
                                {isCompleted && <CheckCircle2 className="absolute top-2 right-2 text-emerald-500 h-5 w-5"/>}
                            </div>
                        );
                    })}
                </div>
            </div>
         );
      })}
    </div>
  );
}