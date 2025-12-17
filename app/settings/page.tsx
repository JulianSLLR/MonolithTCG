"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSession, signOut } from 'next-auth/react';

const STORAGE_KEY = 'monolith:defaultSort';

export default function SettingsPage() {
  const { data: session } = useSession();
  const [defaultSort, setDefaultSort] = useState<'block' | 'alpha' | 'mostCompleted' | 'mostCards'>('block');

  useEffect(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      if (v === 'alpha' || v === 'mostCompleted' || v === 'mostCards' || v === 'block') {
        setDefaultSort(v as any);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const save = () => {
    try {
      localStorage.setItem(STORAGE_KEY, defaultSort);
      // Small feedback for user
      alert('Préférence enregistrée : ' + defaultSort);
    } catch (e) {
      alert('Impossible de sauvegarder les préférences.');
    }
  };

  const reset = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setDefaultSort('block');
      alert('Préférence réinitialisée.');
    } catch (e) {
      // ignore
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Paramètres</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Compte</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-zinc-400">Gère ton profil et tes préférences.</p>
            <div className="mt-4 flex items-center gap-3">
              <Link href="/profile">
                <Button>Voir le profil</Button>
              </Link>
              {session?.user && (
                <Button variant="outline" onClick={() => signOut()}>
                  Déconnexion
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Préférences d'affichage</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-zinc-400">Choisis comment trier et afficher ta collection par défaut.</p>
            <div className="mt-4 flex flex-col gap-3">
              <label className="text-sm text-zinc-300">Tri par défaut</label>
              <select
                aria-label="Trier par défaut"
                value={defaultSort}
                onChange={(e) => setDefaultSort(e.target.value as any)}
                className="h-10 rounded-md bg-zinc-950 border border-zinc-800 px-3 text-sm text-zinc-200"
              >
                <option value="block">Par Bloc (défaut)</option>
                <option value="alpha">Par Nom (A → Z)</option>
                <option value="mostCompleted">Par Progression (décroissant)</option>
                <option value="mostCards">Par Taille de set (décroissant)</option>
              </select>

              <div className="flex items-center gap-3">
                <Button onClick={save}>Enregistrer</Button>
                <Button variant="outline" onClick={reset}>Réinitialiser</Button>
              </div>
              <p className="text-xs text-zinc-500">Les changements sont sauvegardés localement et appliqués automatiquement à la page Collection.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
