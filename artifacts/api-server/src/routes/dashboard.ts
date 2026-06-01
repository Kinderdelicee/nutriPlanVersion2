import { Router, type IRouter } from "express";
import { eq, and, gte, lte, sql } from "drizzle-orm";
import { db, foodLogsTable, usersTable } from "@workspace/db";
import { GetDashboardSummaryQueryParams } from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/dashboard/summary", requireAuth, async (req, res): Promise<void> => {
  const params = GetDashboardSummaryQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const { date } = params.data;

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.user!.userId));
  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }

  const logs = await db
    .select()
    .from(foodLogsTable)
    .where(and(eq(foodLogsTable.userId, req.user!.userId), eq(foodLogsTable.date, date)));

  const totals = {
    calories: logs.reduce((sum, l) => sum + l.calories, 0),
    protein: logs.reduce((sum, l) => sum + l.protein, 0),
    carbs: logs.reduce((sum, l) => sum + l.carbs, 0),
    fat: logs.reduce((sum, l) => sum + l.fat, 0),
  };

  const goals = {
    calories: user.dailyCalorieGoal ?? 2000,
    protein: user.dailyProteinGoal ?? 50,
    carbs: user.dailyCarbsGoal ?? 250,
    fat: user.dailyFatGoal ?? 65,
  };

  const mealTypes = ["breakfast", "lunch", "dinner", "snack"] as const;
  const mealBreakdown = mealTypes.map((mealType) => {
    const mealLogs = logs.filter((l) => l.mealType === mealType);
    return {
      mealType,
      calories: mealLogs.reduce((sum, l) => sum + l.calories, 0),
      protein: mealLogs.reduce((sum, l) => sum + l.protein, 0),
      carbs: mealLogs.reduce((sum, l) => sum + l.carbs, 0),
      fat: mealLogs.reduce((sum, l) => sum + l.fat, 0),
      entries: mealLogs.length,
    };
  });

  const caloriePercentage = goals.calories > 0 ? (totals.calories / goals.calories) * 100 : 0;

  res.json({
    date,
    totals,
    goals,
    mealBreakdown,
    caloriePercentage,
    remaining: {
      calories: Math.max(0, goals.calories - totals.calories),
      protein: Math.max(0, goals.protein - totals.protein),
      carbs: Math.max(0, goals.carbs - totals.carbs),
      fat: Math.max(0, goals.fat - totals.fat),
    },
  });
});

router.get("/dashboard/streak", requireAuth, async (req, res): Promise<void> => {
  const logs = await db
    .select({ date: foodLogsTable.date })
    .from(foodLogsTable)
    .where(eq(foodLogsTable.userId, req.user!.userId))
    .orderBy(sql`${foodLogsTable.date} DESC`);

  const uniqueDates = [...new Set(logs.map((l) => l.date))].sort((a, b) => b.localeCompare(a));

  if (uniqueDates.length === 0) {
    res.json({ currentStreak: 0, longestStreak: 0, lastLogDate: null });
    return;
  }

  // Calculate current streak
  let currentStreak = 0;
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  // Start from today or yesterday
  let checkDate = uniqueDates[0] === today || uniqueDates[0] === yesterday ? new Date(uniqueDates[0]) : null;

  if (checkDate) {
    for (const dateStr of uniqueDates) {
      const expectedDate = checkDate.toISOString().split("T")[0];
      if (dateStr === expectedDate) {
        currentStreak++;
        checkDate = new Date(checkDate.getTime() - 86400000);
      } else {
        break;
      }
    }
  }

  // Calculate longest streak
  let longestStreak = 0;
  let streak = 1;
  for (let i = 1; i < uniqueDates.length; i++) {
    const prev = new Date(uniqueDates[i - 1]);
    const curr = new Date(uniqueDates[i]);
    const diff = (prev.getTime() - curr.getTime()) / 86400000;
    if (diff === 1) {
      streak++;
      longestStreak = Math.max(longestStreak, streak);
    } else {
      streak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, currentStreak, 1);

  res.json({
    currentStreak,
    longestStreak,
    lastLogDate: uniqueDates[0] ?? null,
  });
});

export default router;
