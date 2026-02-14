import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useMemo,
} from "react";
import { auth } from "../services/firebase/config";
import { supabase } from "../services/supabase/config";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} from "firebase/auth";
import { IUser } from "@/types";
import * as DB from "../services/supabase/db";
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
    let userChannel: any = null;
    let householdChannel: any = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      setIsLoading(true);

      if (!firebaseUser) {
        setUser(null);
        setHouseholdUsers([]);
        if (userChannel) supabase.removeChannel(userChannel);
        if (householdChannel) supabase.removeChannel(householdChannel);
        setIsLoading(false);
        return;
      }

      const canAccess = firebaseUser.emailVerified || __DEV__;

      if (canAccess) {
        try {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', firebaseUser.uid)
            .single();

          if (userError || !userData) {
            console.error("Erreur récupération user:", userError);
            setIsLoading(false);
            return;
          }

          const token = await firebaseUser.getIdToken();
          const activeId = userData.active_household_id;

          if (user && user.activeHouseholdId !== activeId) {
            setHouseholdUsers([]);
          }

          const currentUserObj: IUser = {
            id: firebaseUser.uid,
            displayName: userData.display_name || "Moi",
            email: firebaseUser.email || "",
            households: userData.households || [],
            activeHouseholdId: activeId,
          };

          setUser({
            id: firebaseUser.uid,
            displayName: userData.display_name,
            activeHouseholdId: activeId,
            households: userData.households,
            token,
          });

          if (userChannel) supabase.removeChannel(userChannel);
          if (householdChannel) supabase.removeChannel(householdChannel);

          userChannel = supabase
            .channel(`user:${firebaseUser.uid}`)
            .on(
              'postgres_changes',
              {
                event: '*',
                schema: 'public',
                table: 'users',
                filter: `id=eq.${firebaseUser.uid}`,
              },
              async (payload) => {
                const newData = payload.new as any;
                if (newData) {
                  setUser((prev) => prev ? {
                    ...prev,
                    displayName: newData.display_name,
                    activeHouseholdId: newData.active_household_id,
                    households: newData.households,
                  } : null);
                }
              }
            )
            .subscribe();

          if (activeId === firebaseUser.uid) {
            setHouseholdUsers([currentUserObj]);
          } else {
            const members = await DB.getHouseholdUsers(activeId);
            setHouseholdUsers(members);

            householdChannel = supabase
              .channel(`household:${activeId}`)
              .on(
                'postgres_changes',
                {
                  event: '*',
                  schema: 'public',
                  table: 'households',
                  filter: `id=eq.${activeId}`,
                },
                async () => {
                  const updatedMembers = await DB.getHouseholdUsers(activeId);
                  setHouseholdUsers(updatedMembers);
                }
              )
              .subscribe();
          }

          setIsLoading(false);
        } catch (error) {
          console.error("Erreur chargement profil:", error);
          setIsLoading(false);
        }
      } else {
        setUser(null);
        setIsAwaitingVerification(true);
        setIsLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (userChannel) supabase.removeChannel(userChannel);
      if (householdChannel) supabase.removeChannel(householdChannel);
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
