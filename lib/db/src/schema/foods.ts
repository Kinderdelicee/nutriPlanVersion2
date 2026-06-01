import { pgTable, text, integer, real, boolean, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const foodsTable = pgTable("foods", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  calories: integer("calories").notNull(),
  protein: real("protein").notNull().default(0),
  carbs: real("carbs").notNull().default(0),
  fat: real("fat").notNull().default(0),
  fiber: real("fiber"),
  sugar: real("sugar"),
  sodium: real("sodium"),
  servingSize: text("serving_size").notNull().default("100g"),
  servingUnit: text("serving_unit"),
  category: text("category"),
  isCustom: boolean("is_custom").notNull().default(false),
  userId: integer("user_id").references(() => usersTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertFoodSchema = createInsertSchema(foodsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertFood = z.infer<typeof insertFoodSchema>;
export type Food = typeof foodsTable.$inferSelect;
