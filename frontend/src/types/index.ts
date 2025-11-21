export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Finance {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  description: string;
  category: string;
  date: string;
  userId: string;
  createdAt: string;
}

export interface MonthlySummary {
  transactions: Finance[];
  totals: {
    income: number;
    expenses: number;
  };
  balance: number;
}

// Tipos para as requests/responses da API
export interface ApiResponse<T> {
  data: T;
  status: number;
  statusText: string;
}