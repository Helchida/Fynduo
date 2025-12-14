import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

/**
 * Hook pour utiliser le contexte d'authentification.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth doit être utilisé au sein d'un AuthProvider.");
  }

  return context;
};
