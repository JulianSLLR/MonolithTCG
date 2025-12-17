"use client";

import React from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ProfilePage() {
  const { data: session } = useSession();

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Profil</h1>

      <Card>
        <CardHeader>
          <CardTitle>Informations</CardTitle>
        </CardHeader>
        <CardContent>
          {session?.user ? (
            <div className="space-y-3">
              <p className="text-sm"><strong>Nom:</strong> {session.user.name}</p>
              <p className="text-sm"><strong>Email:</strong> {session.user.email}</p>
              <div className="mt-4">
                <Button onClick={() => alert('Page profil minimal — ajouter édition si besoin')}>Éditer le profil</Button>
              </div>
            </div>
          ) : (
            <p className="text-zinc-400">Aucun utilisateur connecté.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
