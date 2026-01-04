import { IUser } from "@/types";

export interface IUserContext {
  id: string;
  displayName: string;
  householdId: string;
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
}
