import React, { createContext, useState, useEffect, ReactNode, useMemo } from "react";
import { auth, db } from "../services/firebase/config";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { Colocataire } from "../types";
import { doc, getDoc } from "firebase/firestore";

export interface IUserContext {
  id: string;
  nom: Colocataire;
  token: string | null;
}

interface IAuthContext {
  user: IUserContext | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<IAuthContext | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<IUserContext | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const token = await firebaseUser.getIdToken();
        const userRef = doc(db, "colocataires", firebaseUser.uid);
        const userSnap = await getDoc(userRef);

        let nom: Colocataire;
        console.log(userSnap.data());
        if (userSnap.exists()) {
          const colocataireData = userSnap.data();
          nom = colocataireData.nom as Colocataire; 
        } else {
          console.error("Document colocataire non trouvé pour l'UID:", firebaseUser.uid);
          nom = "Morgan";
        }

        setUser({
          id: firebaseUser.uid,
          nom,
          token,
        });
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);


  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Erreur login :", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };


  const logout = async () => {
    setIsLoading(true);
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Erreur logout :", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const contextValue = useMemo(() => ({
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user,
  }), [user, isLoading]);

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};
