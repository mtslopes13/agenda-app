import axios from 'axios';
import { Task, Finance, MonthlySummary } from '../types';

const API_BASE_URL = 'http://localhost:3001/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Tipo genérico para responses da API
interface ApiResponse<T> {
  data: T;
  status: number;
  statusText: string;
}

// Serviço de Tarefas
export const taskService = {
  async getTasks(): Promise<Task[]> {
    const response = await api.get<Task[]>('/tasks');
    return response.data;
  },
  
  async createTask(taskData: any): Promise<Task> {
    const response = await api.post<Task>('/tasks', taskData);
    return response.data;
  },
  
  async completeTask(id: string): Promise<Task> {
    const response = await api.patch<Task>(`/tasks/${id}/complete`);
    return response.data;
  },
  
  async deleteTask(id: string): Promise<void> {
    await api.delete(`/tasks/${id}`);
  },
};

// Serviço de Finanças
export const financeService = {
  async getFinances(): Promise<Finance[]> {
    const response = await api.get<Finance[]>('/finances');
    return response.data;
  },
  
  async getMonthlyStatement(year?: number, month?: number): Promise<MonthlySummary> {
    const response = await api.get<MonthlySummary>('/finances/monthly', { 
      params: { year, month } 
    });
    return response.data;
  },
  
  async addTransaction(transactionData: any): Promise<Finance> {
    const response = await api.post<Finance>('/finances', transactionData);
    return response.data;
  },
  
  async deleteTransaction(id: string): Promise<void> {
    await api.delete(`/finances/${id}`);
  },
};