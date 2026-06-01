import { pgTable, text, integer, real, serial, timestamp, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { foodsTable } from "./foods";

export const foodLogsTable = pgTable("food_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  mealType: text("meal_type").notNull(), // breakfast, lunch, dinner, snack
  foodId: integer("food_id").references(() => foodsTable.id, { onDelete: "set null" }),
  customFoodName: text("custom_food_name"),
  quantity: real("quantity").notNull(),
  calories: integer("calories").notNull(),
  protein: real("protein").notNull().default(0),
  carbs: real("carbs").notNull().default(0),
  fat: real("fat").notNull().default(0),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertFoodLogSchema = createInsertSchema(foodLogsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertFoodLog = z.infer<typeof insertFoodLogSchema>;
export type FoodLog = typeof foodLogsTable.$inferSelect;
