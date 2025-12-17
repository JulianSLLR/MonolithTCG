// middleware.ts
import { withAuth } from "next-auth/middleware";

// On exporte explicitement la fonction middleware
export default withAuth({
  // Tu pourras ajouter des options ici plus tard si besoin
});

// Configuration des routes à protéger
export const config = { 
  matcher: ["/dashboard/:path*"] 
};