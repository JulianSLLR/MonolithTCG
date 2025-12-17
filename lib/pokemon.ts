// lib/pokemon.ts
import pokemon from 'pokemontcgsdk'; // <-- Sans le tiret ici aussi

// Configure l'API avec ta clé
pokemon.configure({ apiKey: process.env.POKEMON_TCG_API_KEY });

export default pokemon;