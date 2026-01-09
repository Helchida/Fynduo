import { IUser } from "@/types";

export interface IUserContext {
  id: string;
  displayName: string;
  households: string[];
  activeHouseholdId: string;
  token: string | null;
}

export interface IAuthContext {
  user: IUserContext | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  householdUsers: IUser[];
  setAwaitingVerification?: (value: boolean) => void;
  isAwaitingVerification?: boolean;
  sendPasswordReset: (email: string) => Promise<void>;
  updateLocalUser: (newName: string) => void;
  updateLocalActiveHousehold: (newActiveId: string) => void;
}
