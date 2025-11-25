export type RootStackParamList = {
  Home: undefined;
  AddExpense: { addExpense: (expense: Expense) => void };
};

export interface Expense {
  id: string;
  label: string;
  category: string;
  amount: number;
}
