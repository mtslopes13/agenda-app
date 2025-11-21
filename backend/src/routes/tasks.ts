import { Router } from 'express';
import { taskController } from '../controllers/taskController';

const router = Router();

router.get('/', taskController.getUserTasks);
router.post('/', taskController.createTask);
router.patch('/:id/complete', taskController.completeTask);
router.delete('/:id', taskController.deleteTask);

export default router;