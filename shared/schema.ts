import { pgTable, text, serial, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

import { MdLocalGroceryStore, MdEgg, MdCleaningServices, MdLocalDrink } from "react-icons/md";
import { FaAppleAlt, FaCheese, FaBreadSlice, FaSnowflake, FaFish, FaBoxOpen } from "react-icons/fa";

export const PRODUCT_CATEGORIES = {
  DAIRY: { name: "מוצרי חלב", icon: FaCheese },
  FRUITS: { name: "פירות", icon: FaAppleAlt },
  VEGETABLES: { name: "ירקות", icon: MdLocalGroceryStore },
  MEAT: { name: "בשר", icon: FaFish },
  BAKERY: { name: "מאפים ולחם", icon: FaBreadSlice },
  FROZEN: { name: "קפוא", icon: FaSnowflake },
  CLEANING: { name: "ניקיון", icon: MdCleaningServices },
  CANNED: { name: "שימורים", icon: FaBoxOpen },
  DRINKS: { name: "משקאות", icon: MdLocalDrink },
  SNACKS: { name: "חטיפים", icon: MdLocalGroceryStore },
  CONDIMENTS: { name: "רטבים ותבלינים", icon: MdLocalGroceryStore },
  OTHER: { name: "אחר", icon: MdLocalGroceryStore },
} as const;

export type ProductCategory = keyof typeof PRODUCT_CATEGORIES;

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
  color: text("color").default("green"),
});

export const insertShoppingListSchema = createInsertSchema(shoppingLists).pick({
  name: true,
  description: true,
  datePlanned: true,
  ownerId: true,
});

export const LIST_COLORS = {
  green:   { label: "ירוק",   className: "bg-green-100 text-green-800", ring: "ring-green-400" },
  yellow:  { label: "צהוב",   className: "bg-yellow-100 text-yellow-800", ring: "ring-yellow-400" },
  pink:    { label: "ורוד",   className: "bg-pink-100 text-pink-800", ring: "ring-pink-400" },
  blue:    { label: "כחול",   className: "bg-blue-100 text-blue-800", ring: "ring-blue-400" },
  purple:  { label: "סגול",   className: "bg-purple-100 text-purple-800", ring: "ring-purple-400" },
  orange:  { label: "כתום",   className: "bg-orange-100 text-orange-800", ring: "ring-orange-400" },
} as const;

export type ListColor = keyof typeof LIST_COLORS;

export type ShoppingList = typeof shoppingLists.$inferSelect;
export type InsertShoppingList = z.infer<typeof insertShoppingListSchema>;

// List Items Schema
export const listItems = pgTable("list_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  quantity: integer("quantity").notNull().default(1),
  unit: text("unit"),
  category: text("category").$type<ProductCategory>(),
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