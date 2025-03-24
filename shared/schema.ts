import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User Schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  avatarUrl: text("avatar_url"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  email: true,
  avatarUrl: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

// Shopping List Schema
export const shoppingLists = pgTable("shopping_lists", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  datePlanned: text("date_planned"),
  ownerId: integer("owner_id").notNull(),
});

export const insertShoppingListSchema = createInsertSchema(shoppingLists).pick({
  name: true,
  description: true,
  datePlanned: true,
  ownerId: true,
});

export type ShoppingList = typeof shoppingLists.$inferSelect;
export type InsertShoppingList = z.infer<typeof insertShoppingListSchema>;

// List Items Schema
export const listItems = pgTable("list_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  quantity: integer("quantity").notNull().default(1),
  unit: text("unit"),
  category: text("category"),
  status: text("status").notNull().default("pending"),
  listId: integer("list_id").notNull(),
});

export const insertListItemSchema = createInsertSchema(listItems).pick({
  name: true,
  quantity: true,
  unit: true,
  category: true,
  status: true,
  listId: true,
});

export type ListItem = typeof listItems.$inferSelect;
export type InsertListItem = z.infer<typeof insertListItemSchema>;

// List Participants Schema
export const listParticipants = pgTable("list_participants", {
  id: serial("id").primaryKey(),
  listId: integer("list_id").notNull(),
  userId: integer("user_id").notNull(),
});

export const insertListParticipantSchema = createInsertSchema(listParticipants).pick({
  listId: true,
  userId: true,
});

export type ListParticipant = typeof listParticipants.$inferSelect;
export type InsertListParticipant = z.infer<typeof insertListParticipantSchema>;
