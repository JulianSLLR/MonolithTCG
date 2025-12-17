import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
<<<<<<< HEAD
// IMPORT IMPORTANT : Le composant qui gère la session utilisateur
import AuthSessionProvider from '@/components/layout/AuthSessionProvider';
=======
>>>>>>> 7dfb18ec2f5ffeff2b24b472528cdca5c16065b5

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Monolith",
  description: "Gérez votre collection de cartes Pokémon et items scellés",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* On enveloppe toute l'application avec le Provider d'Authentification */}
        <AuthSessionProvider>
          {children}
        </AuthSessionProvider>
      </body>
    </html>
  );
}