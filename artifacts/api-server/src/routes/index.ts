import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import usersRouter from "./users";
import foodsRouter from "./foods";
import foodLogsRouter from "./food-logs";
import mealsRouter from "./meals";
import mealPlansRouter from "./meal-plans";
import dashboardRouter from "./dashboard";
import progressRouter from "./progress";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(usersRouter);
router.use(foodsRouter);
router.use(foodLogsRouter);
router.use(mealsRouter);
router.use(mealPlansRouter);
router.use(dashboardRouter);
router.use(progressRouter);

export default router;
