'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { PokemonCard, CardCondition } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Plus, Check } from "lucide-react";

interface CardComponentProps {
  card: PokemonCard;
  onAddClick?: (card: PokemonCard) => void; // Nouvelle prop pour gérer le clic "Ajouter" manuellement
  hideBadges?: boolean; // Pour masquer l'état lors de la recherche
}

const conditionColor: Record<string, string> = {
  'Mint': 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
  'Near Mint': 'bg-blue-500/10 text-blue-600 border-blue-200',
  'Excellent': 'bg-yellow-500/10 text-yellow-600 border-yellow-200',
  'Good': 'bg-orange-500/10 text-orange-600 border-orange-200',
  'Played': 'bg-red-500/10 text-red-600 border-red-200',
};

const getFlagEmoji = (lang: string | undefined) => {
  if (!lang) return '🏳️';
  const code = lang.toLowerCase();
  if (code.includes('fr')) return '🇫🇷';
  if (code.includes('en') || code.includes('us')) return '🇺🇸';
  if (code.includes('jp') || code.includes('ja')) return '🇯🇵';
  return lang.toUpperCase();
};

export const CardComponent = ({ card, onAddClick, hideBadges = false }: CardComponentProps) => {
  
  // Si on fournit une fonction "onAddClick", on l'utilise, sinon comportement par défaut
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddClick) {
        onAddClick(card);
    }
  };

  return (
    <Card className="group overflow-hidden border-zinc-800 bg-zinc-950 hover:border-indigo-500/50 hover:shadow-lg transition-all duration-300 h-full flex flex-col">
      {/* Zone Image */}
      <div className="aspect-[2.5/3.5] relative overflow-hidden bg-zinc-900 flex items-center justify-center p-2">
        {card.imageUrl ? (
             <img 
               src={card.imageUrl} 
               alt={card.name} 
               className="object-contain w-full h-full group-hover:scale-105 transition-transform duration-500" 
               loading="lazy"
             />
        ) : (
             <div className="text-zinc-700 font-bold text-2xl rotate-45 select-none">Poké</div>
        )}
        
        {/* Drapeau Langue */}
        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-lg px-2 py-0.5 rounded-full shadow-sm border border-white/10" title={card.language}>
            {getFlagEmoji(card.language)}
        </div>
      </div>

      <CardContent className="p-3 pb-1 space-y-1 flex-grow">
        <div className="flex justify-between items-start">
            <h3 className="font-semibold text-zinc-100 truncate pr-2 text-sm" title={card.name}>
                {card.name}
            </h3>
            {/* Si pas de numéro, on affiche rien ou '?' */}
            <span className="text-xs font-mono text-zinc-500 whitespace-nowrap">
                {card.number !== "?" ? card.number : ""}
            </span>
        </div>
        
        {/* Nom de la série */}
        <p className="text-xs text-zinc-400 truncate" title={card.setName}>
            {card.setName}
        </p>

        {/* On affiche l'état SEULEMENT si hideBadges est faux (donc dans "Ma Collection") */}
        {!hideBadges && (
            <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 h-5 font-normal border", conditionColor[card.condition] || conditionColor['Near Mint'])}>
                    {card.condition}
                </Badge>
            </div>
        )}
      </CardContent>

      <CardFooter className="p-3 pt-2 border-t border-zinc-800/50 mt-auto">
        <Button 
            className="w-full h-8 text-xs bg-zinc-100 text-zinc-900 hover:bg-white font-semibold"
            onClick={handleClick}
        >
            <Plus size={14} className="mr-1" /> Ajouter
        </Button>
      </CardFooter>
    </Card>
  );
};