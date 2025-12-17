'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface ChartProps {
  data: {
    name: string; // Ex: "Total Collection"
    investi: number;
    valeur: number;
  }[];
}

export const CollectionChart = ({ data }: ChartProps) => {
  return (
    <div className="h-[300px] w-full bg-white dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
      <h3 className="text-lg font-semibold mb-4">Rentabilité de la collection</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
          <XAxis dataKey="name" />
          <YAxis unit="€" />
          <Tooltip 
            contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '8px', color: '#fff' }}
          />
          <Legend />
          <Bar dataKey="investi" name="Investissement" fill="#71717a" radius={[4, 4, 0, 0]} />
          <Bar dataKey="valeur" name="Valeur Actuelle" fill="#10b981" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};