import { Router, type IRouter } from "express";
import { eq, or, ilike, and, isNull } from "drizzle-orm";
import { db, foodsTable } from "@workspace/db";
import { ListFoodsQueryParams, CreateFoodBody, UpdateFoodBody, GetFoodParams, UpdateFoodParams, DeleteFoodParams } from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

function formatFood(food: typeof foodsTable.$inferSelect) {
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

router.get("/foods", requireAuth, async (req, res): Promise<void> => {
  const params = ListFoodsQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const { search, category, limit = 50, offset = 0 } = params.data;

  const conditions = [or(isNull(foodsTable.userId), eq(foodsTable.userId, req.user!.userId))];
  if (search) {
    conditions.push(ilike(foodsTable.name, `%${search}%`));
  }
  if (category) {
    conditions.push(eq(foodsTable.category, category));
  }

  const foods = await db
    .select()
    .from(foodsTable)
    .where(and(...conditions))
    .limit(limit ?? 50)
    .offset(offset ?? 0)
    .orderBy(foodsTable.name);

  res.json(foods.map(formatFood));
});

router.post("/foods", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateFoodBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [food] = await db.insert(foodsTable).values({
    ...parsed.data,
    isCustom: true,
    userId: req.user!.userId,
  }).returning();

  res.status(201).json(formatFood(food));
});

router.get("/foods/:id", requireAuth, async (req, res): Promise<void> => {
  const params = GetFoodParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [food] = await db.select().from(foodsTable).where(eq(foodsTable.id, params.data.id));
  if (!food) {
    res.status(404).json({ error: "Food not found" });
    return;
  }

  res.json(formatFood(food));
});

router.patch("/foods/:id", requireAuth, async (req, res): Promise<void> => {
  const params = UpdateFoodParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateFoodBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [food] = await db
    .update(foodsTable)
    .set(parsed.data)
    .where(and(eq(foodsTable.id, params.data.id), eq(foodsTable.userId, req.user!.userId)))
    .returning();

  if (!food) {
    res.status(404).json({ error: "Food not found" });
    return;
  }

  res.json(formatFood(food));
});

router.delete("/foods/:id", requireAuth, async (req, res): Promise<void> => {
  const params = DeleteFoodParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  await db
    .delete(foodsTable)
    .where(and(eq(foodsTable.id, params.data.id), eq(foodsTable.userId, req.user!.userId)));

  res.sendStatus(204);
});

export default router;
