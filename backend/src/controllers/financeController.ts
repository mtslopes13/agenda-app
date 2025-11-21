import { Request, Response } from 'express';
import { PrismaClient, FinanceType } from '@prisma/client';

const prisma = new PrismaClient();

export const financeController = {
  async addTransaction(req: Request, res: Response) {
    try {
      const { type, amount, description, category, date } = req.body;
      const userId = "user-temp-123";

      const transaction = await prisma.finance.create({
        data: {
          type: type as FinanceType,
          amount: parseFloat(amount),
          description,
          category,
          date: new Date(date),
          userId
        }
      });

      res.status(201).json(transaction);
    } catch (error) {
      res.status(400).json({ error: 'Erro ao adicionar transação' });
    }
  },

  async getMonthlyStatement(req: Request, res: Response) {
    try {
      const userId = "user-temp-123";
      const { year, month } = req.query;

      const currentYear = parseInt(year as string) || new Date().getFullYear();
      const currentMonth = parseInt(month as string) || new Date().getMonth() + 1;

      const startDate = new Date(currentYear, currentMonth - 1, 1);
      const endDate = new Date(currentYear, currentMonth, 0);

      const transactions = await prisma.finance.findMany({
        where: {
          userId,
          date: {
            gte: startDate,
            lte: endDate
          }
        },
        orderBy: { date: 'desc' }
      });

      const totals = transactions.reduce((acc, transaction) => {
        if (transaction.type === 'INCOME') {
          acc.income += transaction.amount;
        } else {
          acc.expenses += transaction.amount;
        }
        return acc;
      }, { income: 0, expenses: 0 });

      res.json({
        transactions,
        totals,
        balance: totals.income - totals.expenses
      });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar extrato' });
    }
  },

  async getUserFinances(req: Request, res: Response) {
    try {
      const userId = "user-temp-123";
      const finances = await prisma.finance.findMany({
        where: { userId },
        orderBy: { date: 'desc' },
        take: 50
      });
      res.json(finances);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar finanças' });
    }
  },

  async deleteTransaction(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await prisma.finance.delete({ where: { id } });
      res.status(204).send();
    } catch (error) {
      res.status(404).json({ error: 'Transação não encontrada' });
    }
  }
};