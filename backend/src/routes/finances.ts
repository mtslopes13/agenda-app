import { Router } from 'express';
import { financeController } from '../controllers/financeController';

const router = Router();

router.get('/', financeController.getUserFinances);
router.get('/monthly', financeController.getMonthlyStatement);
router.post('/', financeController.addTransaction);
router.delete('/:id', financeController.deleteTransaction);

export default router;