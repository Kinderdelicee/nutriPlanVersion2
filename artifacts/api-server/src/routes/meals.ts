import { Router, type IRouter } from "express";
import { eq, and, inArray } from "drizzle-orm";
import { db, mealsTable, mealItemsTable, foodsTable, foodLogsTable } from "@workspace/db";
import {
  CreateMealBody,
  UpdateMealBody,
  GetMealParams,
  UpdateMealParams,
  DeleteMealParams,
  LogMealParams,
  LogMealBody,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

async function getMealWithItems(mealId: number) {
  const [meal] = await db.select().from(mealsTable).where(eq(mealsTable.id, mealId));
  if (!meal) return null;

  const items = await db
    .select({ item: mealItemsTable, food: foodsTable })
    .from(mealItemsTable)
    .leftJoin(foodsTable, eq(mealItemsTable.foodId, foodsTable.id))
    .where(eq(mealItemsTable.mealId, mealId));

  return {
    id: meal.id,
    userId: meal.userId,
    name: meal.name,
    description: meal.description,
    totalCalories: meal.totalCalories,
    totalProtein: meal.totalProtein,
    totalCarbs: meal.totalCarbs,
    totalFat: meal.totalFat,
    createdAt: meal.createdAt.toISOString(),
    items: items.map(({ item, food }) => ({
      id: item.id,
      foodId: item.foodId,
      food: food
        ? {
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
          }
        : undefined,
      quantity: item.quantity,
      calories: item.calories,
      protein: item.protein,
      carbs: item.carbs,
      fat: item.fat,
    })),
  };
}

router.get("/meals", requireAuth, async (req, res): Promise<void> => {
  const meals = await db.select().from(mealsTable).where(eq(mealsTable.userId, req.user!.userId)).orderBy(mealsTable.name);

  const results = await Promise.all(meals.map((m) => getMealWithItems(m.id)));
  res.json(results.filter(Boolean));
});

router.post("/meals", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateMealBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { name, description, items } = parsed.data;

  const totalCalories = items.reduce((sum, i) => sum + i.calories, 0);
  const totalProtein = items.reduce((sum, i) => sum + i.protein, 0);
  const totalCarbs = items.reduce((sum, i) => sum + i.carbs, 0);
  const totalFat = items.reduce((sum, i) => sum + i.fat, 0);

  const [meal] = await db.insert(mealsTable).values({
    userId: req.user!.userId,
    name,
    description: description ?? null,
    totalCalories,
    totalProtein,
    totalCarbs,
    totalFat,
  }).returning();

  if (items.length > 0) {
    await db.insert(mealItemsTable).values(
      items.map((item) => ({
        mealId: meal.id,
        foodId: item.foodId,
        quantity: item.quantity,
        calories: item.calories,
        protein: item.protein,
        carbs: item.carbs,
        fat: item.fat,
      }))
    );
  }

  const result = await getMealWithItems(meal.id);
  res.status(201).json(result);
});

router.get("/meals/:id", requireAuth, async (req, res): Promise<void> => {
  const params = GetMealParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const meal = await getMealWithItems(params.data.id);
  if (!meal || meal.userId !== req.user!.userId) {
    res.status(404).json({ error: "Meal not found" });
    return;
  }

  res.json(meal);
});

router.patch("/meals/:id", requireAuth, async (req, res): Promise<void> => {
  const params = UpdateMealParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateMealBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { name, description, items } = parsed.data;

  const updateData: Partial<typeof mealsTable.$inferInsert> = {};
  if (name !== undefined) updateData.name = name;
  if (description !== undefined) updateData.description = description;

  if (items !== undefined) {
    const totalCalories = items.reduce((sum, i) => sum + i.calories, 0);
    const totalProtein = items.reduce((sum, i) => sum + i.protein, 0);
    const totalCarbs = items.reduce((sum, i) => sum + i.carbs, 0);
    const totalFat = items.reduce((sum, i) => sum + i.fat, 0);
    updateData.totalCalories = totalCalories;
    updateData.totalProtein = totalProtein;
    updateData.totalCarbs = totalCarbs;
    updateData.totalFat = totalFat;

    await db.delete(mealItemsTable).where(eq(mealItemsTable.mealId, params.data.id));
    if (items.length > 0) {
      await db.insert(mealItemsTable).values(
        items.map((item) => ({
          mealId: params.data.id,
          foodId: item.foodId,
          quantity: item.quantity,
          calories: item.calories,
          protein: item.protein,
          carbs: item.carbs,
          fat: item.fat,
        }))
      );
    }
  }

  await db.update(mealsTable).set(updateData).where(and(eq(mealsTable.id, params.data.id), eq(mealsTable.userId, req.user!.userId)));

  const result = await getMealWithItems(params.data.id);
  if (!result) {
    res.status(404).json({ error: "Meal not found" });
    return;
  }

  res.json(result);
});

router.delete("/meals/:id", requireAuth, async (req, res): Promise<void> => {
  const params = DeleteMealParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  await db.delete(mealsTable).where(and(eq(mealsTable.id, params.data.id), eq(mealsTable.userId, req.user!.userId)));
  res.sendStatus(204);
});

router.post("/meals/:id/log", requireAuth, async (req, res): Promise<void> => {
  const params = LogMealParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = LogMealBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const meal = await getMealWithItems(params.data.id);
  if (!meal || meal.userId !== req.user!.userId) {
    res.status(404).json({ error: "Meal not found" });
    return;
  }

  const logEntries = await db.insert(foodLogsTable).values(
    meal.items.map((item) => ({
      userId: req.user!.userId,
      date: parsed.data.date,
      mealType: parsed.data.mealType,
      foodId: item.foodId,
      customFoodName: null,
      quantity: item.quantity,
      calories: item.calories,
      protein: item.protein,
      carbs: item.carbs,
      fat: item.fat,
      notes: null,
    }))
  ).returning();

  res.status(201).json(logEntries.map((log) => ({
    id: log.id,
    userId: log.userId,
    date: log.date,
    mealType: log.mealType,
    foodId: log.foodId,
    food: meal.items.find((i) => i.foodId === log.foodId)?.food,
    customFoodName: log.customFoodName,
    quantity: log.quantity,
    calories: log.calories,
    protein: log.protein,
    carbs: log.carbs,
    fat: log.fat,
    notes: log.notes,
    createdAt: log.createdAt.toISOString(),
  })));
});

export default router;
