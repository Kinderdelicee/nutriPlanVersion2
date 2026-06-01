import { pgTable, text, integer, real, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  age: integer("age"),
  gender: text("gender"),
  weight: real("weight"),
  height: real("height"),
  activityLevel: text("activity_level"),
  dailyCalorieGoal: integer("daily_calorie_goal").default(2000),
  dailyProteinGoal: real("daily_protein_goal"),
  dailyCarbsGoal: real("daily_carbs_goal"),
  dailyFatGoal: real("daily_fat_goal"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
