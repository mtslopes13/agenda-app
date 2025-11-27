import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const dailyController = {
  async getDailyData(req: Request, res: Response) {
    try {
      // @ts-ignore
      const userId = req.userId;
      const { date } = req.query;

      if (!date) {
        return res.status(400).json({ error: "É necessário enviar a data (YYYY-MM-DD)" });
      }

      const selectedDate = new Date(date as string);

      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      const events = await prisma.calendarEvent.findMany({
        where: {
          userId,
          date: { gte: startOfDay, lte: endOfDay },
          allDay: true
        }
      });

      const appointments = await prisma.appointment.findMany({
        where: {
          userId,
          date: { gte: startOfDay, lte: endOfDay },
        }
      });

      return res.json({ events, appointments });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Erro ao carregar cronograma diário" });
    }
  },

  async createAppointment(req: Request, res: Response) {
    try {
      const {
        title,
        date,
        startTime,
        endTime,
        description,
        location,
        eventId,
        color,
      } = req.body;
      // @ts-ignore
      const userId = req.userId;

      if (!title || !date || !startTime || !endTime) {
        return res.status(400).json({ error: "Campos obrigatórios não preenchidos" });
      }

      const appointment = await prisma.appointment.create({
        data: {
          title,
          description,
          date: new Date(date),
          startTime,
          endTime,
          location,
          eventId,
          color: color || null,
          userId,
        },
      });

      return res.status(201).json(appointment);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Erro ao criar compromisso" });
    }
  },

  async updateAppointment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const {
        title,
        date,
        startTime,
        endTime,
        description,
        location,
        eventId,
        color,
      } = req.body;
      // @ts-ignore
      const userId = req.userId;

      const existing = await prisma.appointment.findUnique({ where: { id } });
      if (!existing || existing.userId !== userId) {
        return res.status(404).json({ error: "Compromisso não encontrado" });
      }

      const data: any = {};
      if (title !== undefined) data.title = title;
      if (date !== undefined) data.date = new Date(date);
      if (startTime !== undefined) data.startTime = startTime;
      if (endTime !== undefined) data.endTime = endTime;
      if (description !== undefined) data.description = description;
      if (location !== undefined) data.location = location;
      if (eventId !== undefined) data.eventId = eventId;
      if (color !== undefined) data.color = color;

      const appointment = await prisma.appointment.update({
        where: { id },
        data,
      });

      return res.json(appointment);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Erro ao atualizar compromisso" });
    }
  },

  async deleteAppointment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      // @ts-ignore
      const userId = req.userId;

      const appointment = await prisma.appointment.findUnique({ where: { id } });

      if (!appointment || appointment.userId !== userId) {
        return res.status(404).json({ error: "Compromisso não encontrado" });
      }

      await prisma.appointment.delete({ where: { id } });

      return res.status(204).send();
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Erro ao excluir compromisso" });
    }
  },
};
