export interface DatePickerModalProps {
  isVisible: boolean;
  onClose: () => void;
  date: Date;
  onSelect: (date: Date) => void;
}
