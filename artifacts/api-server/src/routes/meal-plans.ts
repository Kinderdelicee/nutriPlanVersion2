import { Router, type IRouter } from "express";
import { eq, and, gte, lte } from "drizzle-orm";
import { db, mealPlansTable, mealsTable, mealItemsTable, foodsTable } from "@workspace/db";
import {
  ListMealPlansQueryParams,
  CreateMealPlanEntryBody,
  DeleteMealPlanEntryParams,
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
      food: food ? { id: food.id, name: food.name, calories: food.calories, protein: food.protein, carbs: food.carbs, fat: food.fat, fiber: food.fiber, sugar: food.sugar, sodium: food.sodium, servingSize: food.servingSize, servingUnit: food.servingUnit, category: food.category, isCustom: food.isCustom, userId: food.userId } : undefined,
      quantity: item.quantity,
      calories: item.calories,
      protein: item.protein,
      carbs: item.carbs,
      fat: item.fat,
    })),
  };
}

router.get("/meal-plans", requireAuth, async (req, res): Promise<void> => {
  const params = ListMealPlansQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const weekStart = params.data.weekStart;
  // Compute week end (7 days later)
  const start = new Date(weekStart);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const weekEnd = end.toISOString().split("T")[0];

  const plans = await db
    .select()
    .from(mealPlansTable)
    .where(
      and(
        eq(mealPlansTable.userId, req.user!.userId),
        gte(mealPlansTable.date, weekStart),
        lte(mealPlansTable.date, weekEnd)
      )
    )
    .orderBy(mealPlansTable.date);

  const results = await Promise.all(
    plans.map(async (plan) => {
      const meal = await getMealWithItems(plan.mealId);
      return {
        id: plan.id,
        userId: plan.userId,
        date: plan.date,
        mealType: plan.mealType,
        mealId: plan.mealId,
        meal,
      };
    })
  );

  res.json(results);
});

router.post("/meal-plans", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateMealPlanEntryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [plan] = await db.insert(mealPlansTable).values({
    userId: req.user!.userId,
    date: parsed.data.date,
    mealType: parsed.data.mealType,
    mealId: parsed.data.mealId,
  }).returning();

  const meal = await getMealWithItems(plan.mealId);

  res.status(201).json({
    id: plan.id,
    userId: plan.userId,
    date: plan.date,
    mealType: plan.mealType,
    mealId: plan.mealId,
    meal,
  });
});

router.delete("/meal-plans/:id", requireAuth, async (req, res): Promise<void> => {
  const params = DeleteMealPlanEntryParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  await db
    .delete(mealPlansTable)
    .where(and(eq(mealPlansTable.id, params.data.id), eq(mealPlansTable.userId, req.user!.userId)));

  res.sendStatus(204);
});

export default router;
