// app/api/cards/search/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) return NextResponse.json({ error: 'Query required' }, { status: 400 });

  const apiKey = process.env.POKEMON_TCG_API_KEY;

  try {
    // 1. On retire l'étoile * pour l'instant pour alléger la recherche
    // 2. On trie par date de sortie pour avoir les cartes récentes en premier
    const url = `https://api.pokemontcg.io/v2/cards?q=name:"${query}"&pageSize=20&orderBy=-set.releaseDate&select=id,name,images,number,rarity,set,tcgplayer,cardmarket`;

    console.log("Appel API :", url);

    const response = await fetch(url, {
      headers: {
        'X-Api-Key': apiKey || '',
        // IMPORTANT : On se fait passer pour un navigateur pour ne pas être bloqué (Erreur 504)
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Content-Type': 'application/json'
      },
      next: { revalidate: 3600 } // Cache les résultats 1h pour éviter de spammer l'API
    });

    if (!response.ok) {
        throw new Error(`Erreur API distante: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json({ data: data.data });

  } catch (error: any) {
    console.error("ERREUR API:", error);
    return NextResponse.json({ error: 'Erreur lors de la recherche' }, { status: 500 });
  }
}