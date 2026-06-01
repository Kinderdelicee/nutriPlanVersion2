import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, foodLogsTable, foodsTable } from "@workspace/db";
import {
  ListFoodLogsQueryParams,
  CreateFoodLogBody,
  UpdateFoodLogBody,
  UpdateFoodLogParams,
  DeleteFoodLogParams,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

function formatFood(food: typeof foodsTable.$inferSelect | undefined) {
  if (!food) return undefined;
  return {
    id: food.id,
    name: food.name,
    calories: food.calories,
    protein: food.protein,
    carbs: food.carbs,
    fat: food.fat,
    fiber: food.fiber,
    sugar: food.sugar,
    sodium: food.sodium,
    servingSize: food.servingSize,
    servingUnit: food.servingUnit,
    category: food.category,
    isCustom: food.isCustom,
    userId: food.userId,
  };
}

router.get("/food-logs", requireAuth, async (req, res): Promise<void> => {
  const params = ListFoodLogsQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const logs = await db
    .select({
      log: foodLogsTable,
      food: foodsTable,
    })
    .from(foodLogsTable)
    .leftJoin(foodsTable, eq(foodLogsTable.foodId, foodsTable.id))
    .where(and(eq(foodLogsTable.userId, req.user!.userId), eq(foodLogsTable.date, params.data.date)))
    .orderBy(foodLogsTable.createdAt);

  res.json(
    logs.map(({ log, food }) => ({
      id: log.id,
      userId: log.userId,
      date: log.date,
      mealType: log.mealType,
      foodId: log.foodId,
      food: formatFood(food ?? undefined),
      customFoodName: log.customFoodName,
      quantity: log.quantity,
      calories: log.calories,
      protein: log.protein,
      carbs: log.carbs,
      fat: log.fat,
      notes: log.notes,
      createdAt: log.createdAt.toISOString(),
    }))
  );
});

router.post("/food-logs", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateFoodLogBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [log] = await db.insert(foodLogsTable).values({
    ...parsed.data,
    foodId: parsed.data.foodId ?? null,
    userId: req.user!.userId,
  }).returning();

  let food: typeof foodsTable.$inferSelect | undefined;
  if (log.foodId) {
    const [f] = await db.select().from(foodsTable).where(eq(foodsTable.id, log.foodId));
    food = f;
  }

  res.status(201).json({
    id: log.id,
    userId: log.userId,
    date: log.date,
    mealType: log.mealType,
    foodId: log.foodId,
    food: formatFood(food),
    customFoodName: log.customFoodName,
    quantity: log.quantity,
    calories: log.calories,
    protein: log.protein,
    carbs: log.carbs,
    fat: log.fat,
    notes: log.notes,
    createdAt: log.createdAt.toISOString(),
  });
});

router.patch("/food-logs/:id", requireAuth, async (req, res): Promise<void> => {
  const params = UpdateFoodLogParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateFoodLogBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [log] = await db
    .update(foodLogsTable)
    .set(parsed.data)
    .where(and(eq(foodLogsTable.id, params.data.id), eq(foodLogsTable.userId, req.user!.userId)))
    .returning();

  if (!log) {
    res.status(404).json({ error: "Food log not found" });
    return;
  }

  let food: typeof foodsTable.$inferSelect | undefined;
  if (log.foodId) {
    const [f] = await db.select().from(foodsTable).where(eq(foodsTable.id, log.foodId));
    food = f;
  }

  res.json({
    id: log.id,
    userId: log.userId,
    date: log.date,
    mealType: log.mealType,
    foodId: log.foodId,
    food: formatFood(food),
    customFoodName: log.customFoodName,
    quantity: log.quantity,
    calories: log.calories,
    protein: log.protein,
    carbs: log.carbs,
    fat: log.fat,
    notes: log.notes,
    createdAt: log.createdAt.toISOString(),
  });
});

router.delete("/food-logs/:id", requireAuth, async (req, res): Promise<void> => {
  const params = DeleteFoodLogParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  await db
    .delete(foodLogsTable)
    .where(and(eq(foodLogsTable.id, params.data.id), eq(foodLogsTable.userId, req.user!.userId)));

  res.sendStatus(204);
});

export default router;
