import { pgTable, text, integer, real, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { foodsTable } from "./foods";

export const mealsTable = pgTable("meals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  totalCalories: integer("total_calories").notNull().default(0),
  totalProtein: real("total_protein").notNull().default(0),
  totalCarbs: real("total_carbs").notNull().default(0),
  totalFat: real("total_fat").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const mealItemsTable = pgTable("meal_items", {
  id: serial("id").primaryKey(),
  mealId: integer("meal_id").notNull().references(() => mealsTable.id, { onDelete: "cascade" }),
  foodId: integer("food_id").notNull().references(() => foodsTable.id, { onDelete: "cascade" }),
  quantity: real("quantity").notNull(),
  calories: integer("calories").notNull(),
  protein: real("protein").notNull().default(0),
  carbs: real("carbs").notNull().default(0),
  fat: real("fat").notNull().default(0),
});

export const insertMealSchema = createInsertSchema(mealsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const insertMealItemSchema = createInsertSchema(mealItemsTable).omit({ id: true });

export type InsertMeal = z.infer<typeof insertMealSchema>;
export type InsertMealItem = z.infer<typeof insertMealItemSchema>;
export type Meal = typeof mealsTable.$inferSelect;
export type MealItem = typeof mealItemsTable.$inferSelect;
