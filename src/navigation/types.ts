export type RootStackParamList = {
  Home: undefined;
  AddExpense: { addExpense: (expense: Expense) => void };
  UpdateExpense: { expense: Expense; updateExpense: (expense: Expense) => void; removeExpense: (id: string) => void };
};

export interface Expense {
  id: string;
  label: string;
  category: string;
  amount: number;
}
