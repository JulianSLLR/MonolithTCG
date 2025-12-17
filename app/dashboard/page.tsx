// app/dashboard/page.tsx
<<<<<<< HEAD
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Layers, Package, TrendingUp } from "lucide-react";
import { CollectionChart } from "@/components/dashboard/CollectionChart"; 

export default function DashboardPage() {
  
  // Données factices pour le graphique (en attendant de connecter la vraie base de données)
  const chartData = [
    { name: 'Jan', investi: 400, valeur: 450 },
    { name: 'Fév', investi: 600, valeur: 720 },
    { name: 'Mar', investi: 850, valeur: 1100 },
    { name: 'Avr', investi: 950, valeur: 1300 },
    { name: 'Mai', investi: 1100, valeur: 1650 },
    { name: 'Juin', investi: 1250, valeur: 1890 },
  ];

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight text-white">Vue d'ensemble</h2>
        <span className="text-sm text-neutral-500">Dernière mise à jour : Aujourd'hui</span>
      </div>
=======
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Layers, Package } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Vue d'ensemble</h2>
>>>>>>> 7dfb18ec2f5ffeff2b24b472528cdca5c16065b5
      
      {/* KPIs (Indicateurs clés) */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valeur Totale</CardTitle>
<<<<<<< HEAD
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,890.00 €</div>
            <p className="text-xs text-emerald-600 flex items-center mt-1">
              <TrendingUp size={12} className="mr-1" /> +51.2% de plus-value
            </p>
=======
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12,340.00 €</div>
            <p className="text-xs text-muted-foreground">+20.1% par rapport au mois dernier</p>
>>>>>>> 7dfb18ec2f5ffeff2b24b472528cdca5c16065b5
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cartes Collectionnées</CardTitle>
<<<<<<< HEAD
            <Layers className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">142</div>
=======
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+2350</div>
>>>>>>> 7dfb18ec2f5ffeff2b24b472528cdca5c16065b5
            <p className="text-xs text-muted-foreground">Cartes uniques</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Items Scellés</CardTitle>
<<<<<<< HEAD
            <Package className="h-4 w-4 text-purple-500" />
=======
            <Package className="h-4 w-4 text-muted-foreground" />
>>>>>>> 7dfb18ec2f5ffeff2b24b472528cdca5c16065b5
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Coffrets & Displays</p>
          </CardContent>
        </Card>
      </div>
<<<<<<< HEAD

      {/* Zone Graphique */}
      <div className="grid gap-4 grid-cols-1">
        <Card className="col-span-1">
            <CardHeader>
                <CardTitle>Analyse de la rentabilité</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
                {/* --- CORRECTION ICI : Ajout du conteneur avec hauteur fixe --- */}
                <div className="h-[300px] w-full"> 
                    <CollectionChart data={chartData} />
                </div>
                {/* ------------------------------------------------------------- */}
            </CardContent>
        </Card>
      </div>
=======
>>>>>>> 7dfb18ec2f5ffeff2b24b472528cdca5c16065b5
    </div>
  );
}