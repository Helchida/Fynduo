import { useAuth } from "./useAuth";

/**
 * Hook personnalisé pour accéder facilement aux utilisateurs du foyer
 * et pour mapper les UIDs à leurs noms d'affichage.
 */
export const useHouseholdUsers = () => {
  const { user, householdUsers } = useAuth();
  const userMap = new Map(householdUsers.map((u) => [u.id, u]));

  const getDisplayName = (uid: string): string => {
    const foundUser = userMap.get(uid);
    if (foundUser) return foundUser.displayName;
    return "Utilisateur";
  };

  const getOtherUsers = () => {
    const currentUserId = user?.id;
    if (!currentUserId) return [];
    return householdUsers.filter((u) => u.id !== currentUserId);
  };

  return {
    householdUsers,
    getDisplayName,
    getOtherUsers,
    currentUser: user,
  };
};
