import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import { RegisterBody, LoginBody } from "@workspace/api-zod";
import { requireAuth, signToken } from "../middlewares/auth";
import { logger } from "../lib/logger";

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

router.post("/auth/register", async (req, res): Promise<void> => {
  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { email, password, name, age, gender, weight, height, activityLevel } = parsed.data;

  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (existing.length > 0) {
    res.status(409).json({ error: "Email already in use" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  // Calculate daily calorie goal using Harris-Benedict formula if enough data
  let dailyCalorieGoal = 2000;
  if (weight && height && age && gender) {
    let bmr: number;
    if (gender === "male") {
      bmr = 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age;
    } else {
      bmr = 447.593 + 9.247 * weight + 3.098 * height - 4.33 * age;
    }
    const activityMultipliers: Record<string, number> = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      "very active": 1.9,
    };
    dailyCalorieGoal = Math.round(bmr * (activityMultipliers[activityLevel ?? "sedentary"] ?? 1.2));
  }

  const [user] = await db.insert(usersTable).values({
    email,
    passwordHash,
    name,
    age: age ?? null,
    gender: gender ?? null,
    weight: weight ?? null,
    height: height ?? null,
    activityLevel: activityLevel ?? null,
    dailyCalorieGoal,
    dailyProteinGoal: Math.round(dailyCalorieGoal * 0.25 / 4),
    dailyCarbsGoal: Math.round(dailyCalorieGoal * 0.45 / 4),
    dailyFatGoal: Math.round(dailyCalorieGoal * 0.30 / 9),
  }).returning();

  req.log.info({ userId: user.id }, "User registered");
  const token = signToken({ userId: user.id, email: user.email });
  res.status(201).json({ token, user: formatUser(user) });
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { email, password } = parsed.data;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (!user) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  req.log.info({ userId: user.id }, "User logged in");
  const token = signToken({ userId: user.id, email: user.email });
  res.json({ token, user: formatUser(user) });
});

router.post("/auth/logout", (_req, res): void => {
  res.json({ message: "Logged out" });
});

router.get("/auth/me", requireAuth, async (req, res): Promise<void> => {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.user!.userId));
  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }
  res.json(formatUser(user));
});

export default router;
