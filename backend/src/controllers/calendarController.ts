import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const calendarController = {
  async getMonthlyEvents(req: Request, res: Response) {
    try {
      const year = Number(req.query.year);
      const month = Number(req.query.month);

      // @ts-ignore
      const userId = req.userId;

      if (!year || !month) {
        return res.status(400).json({ error: "Ano e mês são obrigatórios" });
      }

      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0);

      // 1) Eventos de calendário (all-day / normais)
      const events = await prisma.calendarEvent.findMany({
        where: {
          userId,
          date: {
            gte: start,
            lte: end
          }
        }
      });

      // 2) Compromissos com horário (Appointment)
      const appointments = await prisma.appointment.findMany({
        where: {
          userId,
          date: {
            gte: start,
            lte: end
          }
        }
      });

      const eventItems = events.map(event => ({
        id: event.id,
        title: event.title,
        date: event.date.toISOString().split("T")[0],
        allDay: event.allDay,
        type: event.type,
        color: event.color || null,
        kind: 'EVENT' as const,
      }));

      // Compromissos aparecem como “HH:MM Título” naquele dia
      const appointmentItems = appointments.map(ap => ({
        id: `apt_${ap.id}`, // 👈 prefixo pra sabermos que é compromisso
        title: `${ap.startTime} ${ap.title}`,
        date: ap.date.toISOString().split("T")[0],
        allDay: true,        // para caber bonitinho na célula do dia
        type: 'APPOINTMENT',
        color: ap.color || '#BAE1FF', // usa cor do compromisso ou um default
        kind: 'APPOINTMENT' as const,
      }));

      return res.json([...eventItems, ...appointmentItems]);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Erro ao buscar eventos do mês" });
    }
  },

  async createEvent(req: Request, res: Response) {
    try {
      const { title, description, date, allDay, type, color } = req.body;

      // @ts-ignore
      const userId = req.userId;

      if (!title || !date) {
        return res.status(400).json({ error: "Título e data são obrigatórios" });
      }

      const event = await prisma.calendarEvent.create({
        data: {
          title,
          description: description || null,
          date: new Date(date),
          allDay: allDay ?? true,
          type: type ?? "PERSONAL",
          color: color || null,
          userId
        }
      });

      res.status(201).json(event);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Erro ao criar evento no calendário" });
    }
  },

  async updateEvent(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { title, description, date, allDay, type, color } = req.body;
      // @ts-ignore
      const userId = req.userId;

      const existing = await prisma.calendarEvent.findUnique({
        where: { id }
      });

      if (!existing || existing.userId !== userId) {
        return res.status(404).json({ error: "Evento não encontrado" });
      }

      const data: any = {};
      if (title !== undefined) data.title = title;
      if (description !== undefined) data.description = description;
      if (date !== undefined) data.date = new Date(date);
      if (allDay !== undefined) data.allDay = allDay;
      if (type !== undefined) data.type = type;
      if (color !== undefined) data.color = color;

      const updated = await prisma.calendarEvent.update({
        where: { id },
        data,
      });

      return res.json(updated);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Erro ao atualizar evento" });
    }
  },

  async deleteEvent(req: Request, res: Response) {
    try {
      const { id } = req.params;
      // @ts-ignore
      const userId = req.userId;

      const existing = await prisma.calendarEvent.findUnique({
        where: { id }
      });

      if (!existing || existing.userId !== userId) {
        return res.status(404).json({ error: "Evento não encontrado" });
      }

      await prisma.calendarEvent.delete({ where: { id } });

      return res.status(204).send();
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Erro ao excluir evento" });
    }
  },
};
