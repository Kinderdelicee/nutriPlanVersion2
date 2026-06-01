import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import { UpdateProfileBody } from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

function formatUser(user: typeof usersTable.$inferSelect) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    age: user.age,
    gender: user.gender,
    weight: user.weight,
    height: user.height,
    activityLevel: user.activityLevel,
    dailyCalorieGoal: user.dailyCalorieGoal,
    dailyProteinGoal: user.dailyProteinGoal,
    dailyCarbsGoal: user.dailyCarbsGoal,
    dailyFatGoal: user.dailyFatGoal,
    createdAt: user.createdAt.toISOString(),
  };
}

router.patch("/users/profile", requireAuth, async (req, res): Promise<void> => {
  const parsed = UpdateProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { name, age, gender, weight, height, activityLevel, dailyCalorieGoal, dailyProteinGoal, dailyCarbsGoal, dailyFatGoal } = parsed.data;

  const updateData: Partial<typeof usersTable.$inferInsert> = {};
  if (name !== undefined) updateData.name = name;
  if (age !== undefined) updateData.age = age;
  if (gender !== undefined) updateData.gender = gender;
  if (weight !== undefined) updateData.weight = weight;
  if (height !== undefined) updateData.height = height;
  if (activityLevel !== undefined) updateData.activityLevel = activityLevel;
  if (dailyCalorieGoal !== undefined) updateData.dailyCalorieGoal = dailyCalorieGoal;
  if (dailyProteinGoal !== undefined) updateData.dailyProteinGoal = dailyProteinGoal;
  if (dailyCarbsGoal !== undefined) updateData.dailyCarbsGoal = dailyCarbsGoal;
  if (dailyFatGoal !== undefined) updateData.dailyFatGoal = dailyFatGoal;

  const [user] = await db.update(usersTable).set(updateData).where(eq(usersTable.id, req.user!.userId)).returning();

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json(formatUser(user));
});

export default router;
