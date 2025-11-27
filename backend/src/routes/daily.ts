import { Router } from "express";
import { dailyController } from "../controllers/dailyController";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.use(authMiddleware);

router.get("/", dailyController.getDailyData);
router.post("/appointment", dailyController.createAppointment);
router.patch("/appointment/:id", dailyController.updateAppointment);
router.delete("/appointment/:id", dailyController.deleteAppointment);

export default router;
