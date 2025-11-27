import { Router } from 'express';
import { calendarController } from '../controllers/calendarController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/events', calendarController.getMonthlyEvents);
router.post('/events', calendarController.createEvent);
router.patch('/events/:id', calendarController.updateEvent);   // 👈 novo
router.delete('/events/:id', calendarController.deleteEvent);  // 👈 novo

export default router;
