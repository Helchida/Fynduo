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
import { doc, onSnapshot } from "firebase/firestore";
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

  const updateLocalUser = (newName: string) => {
    setUser((prev) => (prev ? { ...prev, displayName: newName } : null));
  };

  const updateLocalActiveHousehold = (newActiveId: string) => {
    setUser((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        activeHouseholdId: newActiveId,
      };
    });
  };

  useEffect(() => {
    let unsubscribeDoc: () => void;
    let unsubscribeHousehold: () => void;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      setIsLoading(true);

      if (!firebaseUser) {
        setUser(null);
        setHouseholdUsers([]);
        if (unsubscribeDoc) unsubscribeDoc();
        if (unsubscribeHousehold) unsubscribeHousehold();
        setIsLoading(false);
        return;
      }

      const canAccess = firebaseUser.emailVerified || __DEV__;

      if (canAccess) {
        const userRef = doc(db, "users", firebaseUser.uid);

        unsubscribeDoc = onSnapshot(
          userRef,
          async (docSnap) => {
            if (docSnap.exists()) {
              const userData = docSnap.data() as IUser;
              const token = await firebaseUser.getIdToken();
              const activeId = userData.activeHouseholdId;

              if (user && user.activeHouseholdId !== activeId) {
                setHouseholdUsers([]);
              }

              setUser({
                id: firebaseUser.uid,
                displayName: userData.displayName,
                activeHouseholdId: activeId,
                households: userData.households,
                token,
              });

              if (unsubscribeHousehold) unsubscribeHousehold();
              if (activeId === firebaseUser.uid) {
                setHouseholdUsers([]);
              } else {
                const householdRef = doc(db, "households", activeId);
                unsubscribeHousehold = onSnapshot(
                  householdRef,
                  async (householdSnap) => {
                    if (householdSnap.exists()) {
                      const members = await DB.getHouseholdUsers(activeId);
                      setHouseholdUsers(members);
                    } else {
                      setHouseholdUsers([]);
                    }
                  },
                  (error) => {
                    console.error("Erreur listener household:", error);
                    setHouseholdUsers([]);
                  },
                );
              }
            }
            setIsLoading(false);
          },
          (error: any) => {
            console.error("Erreur listener profil:", error);
            setIsLoading(false);
          },
        );
      } else {
        setUser(null);
        setIsAwaitingVerification(true);
        setIsLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeDoc) unsubscribeDoc();
      if (unsubscribeHousehold) unsubscribeHousehold();
    };
  }, []);

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
      setHouseholdUsers([]);
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
      updateLocalUser,
      updateLocalActiveHousehold,
    }),
    [user, isLoading, householdUsers, isAwaitingVerification],
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
