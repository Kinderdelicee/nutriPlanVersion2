import { Router, type IRouter } from "express";
import { eq, and, gte, lte, sql } from "drizzle-orm";
import { db, foodLogsTable, usersTable } from "@workspace/db";
import { GetNutritionProgressQueryParams } from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/progress/nutrition", requireAuth, async (req, res): Promise<void> => {
  const params = GetNutritionProgressQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const { period, endDate } = params.data;

  const end = new Date(endDate);
  const start = new Date(endDate);
  if (period === "week") {
    start.setDate(end.getDate() - 6);
  } else {
    start.setDate(end.getDate() - 29);
  }

  const startStr = start.toISOString().split("T")[0];
  const endStr = end.toISOString().split("T")[0];

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.user!.userId));
  const goalCalories = user?.dailyCalorieGoal ?? 2000;

  const logs = await db
    .select({
      date: foodLogsTable.date,
      calories: sql<number>`sum(${foodLogsTable.calories})`.as("calories"),
      protein: sql<number>`sum(${foodLogsTable.protein})`.as("protein"),
      carbs: sql<number>`sum(${foodLogsTable.carbs})`.as("carbs"),
      fat: sql<number>`sum(${foodLogsTable.fat})`.as("fat"),
    })
    .from(foodLogsTable)
    .where(
      and(
        eq(foodLogsTable.userId, req.user!.userId),
        gte(foodLogsTable.date, startStr),
        lte(foodLogsTable.date, endStr)
      )
    )
    .groupBy(foodLogsTable.date)
    .orderBy(foodLogsTable.date);

  // Fill in missing dates with zeros
  const logsMap = new Map(logs.map((l) => [l.date, l]));
  const result = [];

  const current = new Date(start);
  while (current <= end) {
    const dateStr = current.toISOString().split("T")[0];
    const log = logsMap.get(dateStr);
    result.push({
      date: dateStr,
      calories: log ? Number(log.calories) : 0,
      protein: log ? Number(log.protein) : 0,
      carbs: log ? Number(log.carbs) : 0,
      fat: log ? Number(log.fat) : 0,
      goalCalories,
    });
    current.setDate(current.getDate() + 1);
  }

  res.json(result);
});

export default router;
