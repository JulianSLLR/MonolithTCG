// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  
  // --- MODIFICATION 1 : Lien vers ta page de login ---
  pages: {
    signIn: '/login', // Redirige les utilisateurs non connectés vers ta belle page /login
  },

  // --- MODIFICATION 2 : Gestion des données de session ---
  callbacks: {
    async session({ session, token }) {
      // On s'assure que l'ID utilisateur est bien disponible dans la session côté client
      if (session.user && token.sub) {
        (session.user as any).id = token.sub;
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };