import { IUser } from "@/types";

export const useGetDisplayNameUserInHousehold = (userId: string | null, householdUsers: IUser[]) : string => {
        if (!userId) {
            return "Sélectionner le payeur"; 
        }
        const userFound = householdUsers.find(u => u.id === userId);
        return userFound?.displayName ?? userId;
};