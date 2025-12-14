import React, { createContext, useState, useEffect, ReactNode, useMemo } from "react";
import { auth, db } from "../services/firebase/config";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { IUser } from "@/types";
import * as DB from "../services/firebase/db"
import { IAuthContext, IUserContext } from "./types/AuthContext.type";



export const AuthContext = createContext<IAuthContext | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<IUserContext | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [householdUsers, setHouseholdUsers] = useState<IUser[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setIsLoading(true);
      if (firebaseUser) {
        try{
          const token = await firebaseUser.getIdToken();
          const userRef = doc(db, "users", firebaseUser.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const userData = userSnap.data() as IUser;
            const householdId = userData.householdId as string | undefined;
            const displayName = userData.displayName as string;

            if (!householdId) {
              console.error("L'utilisateur n'est associé à aucun foyer:", firebaseUser.uid);
              await signOut(auth);
              setUser(null);
            } else {
              setUser({
                id: firebaseUser.uid,
                displayName,
                householdId,
                token,
              });

              const users = await DB.getHouseholdUsers(householdId)
              setHouseholdUsers(users);
            }
          } else {
            console.error("Document colocataire non trouvé pour l'UID:", firebaseUser.uid);
            await signOut(auth);
            setUser(null);
          }
        } catch (error) {
          console.error("Erreur lors de la récupération des données utilisateur:", error);
          await signOut(auth);
          setUser(null);
        }
      } else {

        setUser(null);
        setHouseholdUsers([])
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
    householdUsers,
  }), [user, isLoading, householdUsers]);

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};
