import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useMemo,
} from "react";
import { auth, db } from "../services/firebase/config";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { IUser } from "@/types";
import * as DB from "../services/firebase/db";
import { IAuthContext, IUserContext } from "./types/AuthContext.type";

export const AuthContext = createContext<IAuthContext | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<IUserContext | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [householdUsers, setHouseholdUsers] = useState<IUser[]>([]);
  const [isAwaitingVerification, setIsAwaitingVerification] = useState(false);

  const loadUserProfile = async (firebaseUser: any) => {
    try {
      const token = await firebaseUser.getIdToken();
      const userRef = doc(db, "users", firebaseUser.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        throw new Error("Profil utilisateur introuvable");
      }

      const userData = userSnap.data() as IUser;

      setUser({
        id: firebaseUser.uid,
        displayName: userData.displayName,
        householdId: userData.householdId,
        token,
      });

      const users = await DB.getHouseholdUsers(userData.householdId);
      setHouseholdUsers(users);
      setIsAwaitingVerification(false);
    } catch (error) {
      console.error("Erreur chargement profil :", error);
      setUser(null);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setIsLoading(true);

      if (!firebaseUser) {
        setUser(null);
        setHouseholdUsers([]);
        setIsAwaitingVerification(false);
        setIsLoading(false);
        return;
      }

      await firebaseUser.reload();

      const canAccess = firebaseUser.emailVerified || __DEV__;

      if (canAccess) {
        await loadUserProfile(firebaseUser);
      } else {
        console.warn("Email non vérifié en mode Prod :", firebaseUser.email);
        setUser(null);
        setIsAwaitingVerification(true);
      }

      setIsLoading(false);
    });

    const verificationInterval = setInterval(async () => {
      if (isAwaitingVerification && auth.currentUser && !__DEV__) {
        await auth.currentUser.reload();
        if (auth.currentUser.emailVerified) {
          clearInterval(verificationInterval);
          await loadUserProfile(auth.currentUser);
        }
      }
    }, 3000);

    return () => {
      unsubscribe();
      clearInterval(verificationInterval);
    };
  }, [isAwaitingVerification]);

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Erreur login :", error);
      throw error;
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

  const setAwaitingVerification = (value: boolean) => {
    setIsAwaitingVerification(value);
  };

  const sendPasswordReset = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error("Erreur reset password :", error);
      throw error;
    }
  };

  const contextValue = useMemo(
    () => ({
      user,
      isLoading,
      login,
      logout,
      isAuthenticated: !!user,
      householdUsers,
      setAwaitingVerification,
      isAwaitingVerification,
      sendPasswordReset,
    }),
    [user, isLoading, householdUsers, isAwaitingVerification]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
