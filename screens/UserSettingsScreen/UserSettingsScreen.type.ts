export interface IUserSettingsProps {
  displayName: string;
  email: string;
  loading: boolean;
  error: string | null;
}

export interface IReauthModalProps {
  isVisible: boolean;
  onClose: () => void;
  onConfirm: (password: string) => void;
  actionType: "email" | "password" | "delete";
}
