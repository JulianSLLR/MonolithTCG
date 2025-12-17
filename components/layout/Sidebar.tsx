// components/layout/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Layers, 
  Package, 
  Upload, 
  Settings,
  Search,
  LogOut,
  User
} from "lucide-react";
// J'ai retiré l'import qui posait problème (Avatar)

const routes = [
  { 
    label: "Dashboard", 
    icon: LayoutDashboard, 
    href: "/dashboard", 
    color: "text-sky-500" 
  },
  { 
    label: "Rechercher", 
    icon: Search, 
    href: "/dashboard/search", 
    color: "text-emerald-500"
  },
  { 
    label: "Cartes", 
    icon: Layers, 
    href: "/dashboard/collection", 
    color: "text-violet-500" 
  },
  { 
    label: "Scellés", 
    icon: Package, 
    href: "/dashboard/sealed", 
    color: "text-pink-700" 
  },
  { 
    label: "Importation", 
    icon: Upload, 
    href: "/dashboard/import", 
    color: "text-orange-700" 
  },
];

export const Sidebar = () => {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-zinc-950 text-white border-r border-zinc-800">
      {/* --- EN-TÊTE / LOGO --- */}
      <div className="px-3 py-2 flex-1">
        <Link href="/dashboard" className="flex items-center pl-3 mb-14">
          <div className="relative w-8 h-8 mr-4 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
            M
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Monolith
          </h1>
        </Link>
        
        {/* --- MENU DE NAVIGATION --- */}
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                pathname === route.href ? "text-white bg-white/10" : "text-zinc-400"
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                {route.label}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* --- BAS DE PAGE (UTILISATEUR & PARAMÈTRES) --- */}
      <div className="px-3 py-2">
         {/* Lien Paramètres */}
         <Link href="/settings" className="flex items-center p-3 text-zinc-400 hover:text-white transition mb-2">
            <Settings className="h-5 w-5 mr-3" />
            Paramètres
         </Link>

         {/* Carte Utilisateur */}
         {session?.user && (
            <div className="flex items-center gap-x-3 bg-zinc-900/50 p-3 rounded-xl border border-zinc-800">
                
                {/* Avatar personnalisé (Sans composant externe) */}
                <div className="h-9 w-9 rounded-full overflow-hidden border border-zinc-700 bg-indigo-600 flex items-center justify-center shrink-0">
                    {session.user.image ? (
                        <img 
                            src={session.user.image} 
                            alt="User" 
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <span className="text-xs font-bold text-white">
                            {session.user.name?.[0]?.toUpperCase() || "U"}
                        </span>
                    )}
                </div>
                
                {/* Nom + Email */}
                <div className="flex flex-col overflow-hidden">
                    <p className="text-sm font-medium text-white truncate">
                        {session.user.name}
                    </p>
                    <p className="text-xs text-zinc-500 truncate max-w-[100px]">
                        {session.user.email}
                    </p>
                </div>

                {/* Bouton Déconnexion */}
                <button 
                    onClick={() => signOut()} 
                    className="ml-auto text-zinc-500 hover:text-red-500 transition p-1"
                    title="Se déconnecter"
                >
                    <LogOut size={18} />
                </button>
            </div>
         )}
      </div>
    </div>
  );
};