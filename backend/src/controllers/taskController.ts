import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const taskController = {
  async getUserTasks(req: Request, res: Response) {
    try {
      // Usuário temporário (implemente auth depois)
      const userId = "user-temp-123";
      
      const tasks = await prisma.task.findMany({
        where: { userId },
        orderBy: { dueDate: 'asc' }
      });

      res.json(tasks);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar tarefas' });
    }
  },

  async createTask(req: Request, res: Response) {
    try {
      const { title, description, dueDate } = req.body;
      const userId = "user-temp-123";

      const task = await prisma.task.create({
        data: {
          title,
          description,
          dueDate: new Date(dueDate),
          userId
        }
      });

      res.status(201).json(task);
    } catch (error) {
      res.status(400).json({ error: 'Erro ao criar tarefa' });
    }
  },

  async completeTask(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const task = await prisma.task.update({
        where: { id },
        data: { completed: true }
      });

      res.json(task);
    } catch (error) {
      res.status(400).json({ error: 'Erro ao completar tarefa' });
    }
  },

  async deleteTask(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await prisma.task.delete({ where: { id } });
      res.status(204).send();
    } catch (error) {
      res.status(404).json({ error: 'Tarefa não encontrada' });
    }
  }
};