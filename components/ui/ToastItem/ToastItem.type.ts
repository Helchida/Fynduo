import { Toast } from "@/types";

export interface ToastItemProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}
