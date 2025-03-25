import sqlite3 from "better-sqlite3";
import { Database } from "better-sqlite3";
import { 
  User, InsertUser, 
  ShoppingList, InsertShoppingList, 
  ListItem, InsertListItem, 
  ListParticipant, InsertListParticipant 
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);
type SessionStore = ReturnType<typeof createMemoryStore>;

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User>;
  getListById(id: number): Promise<ShoppingList | undefined>;
  getUserLists(userId: number): Promise<ShoppingList[]>;
  createList(list: InsertShoppingList): Promise<ShoppingList>;
  updateList(id: number, data: Partial<ShoppingList>): Promise<ShoppingList>;
  deleteList(id: number): Promise<void>;
  canUserAccessList(userId: number, listId: number): Promise<boolean>;
  getListItems(listId: number): Promise<ListItem[]>;
  createListItem(item: InsertListItem): Promise<ListItem>;
  updateListItem(id: number, data: Partial<ListItem>): Promise<ListItem>;
  deleteListItem(id: number): Promise<void>;
  getListParticipants(listId: number): Promise<User[]>;
  isListSharedWithUser(listId: number, userId: number): Promise<boolean>;
  addListParticipant(participant: InsertListParticipant): Promise<ListParticipant>;
  removeListParticipant(id: number): Promise<void>;
  sessionStore: SessionStore;
}

export class SQLiteStorage implements IStorage {
  private db: Database;
  sessionStore: SessionStore;

  constructor(dbPath: string = "./data.db") {
    this.db = sqlite3(dbPath);
    this.sessionStore = new MemoryStore({ checkPeriod: 86400000 });
    this.initializeDatabase();
  }

  private initializeDatabase() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        avatarUrl TEXT
      );

      CREATE TABLE IF NOT EXISTS shopping_lists (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        datePlanned TEXT,
        timePlanned TEXT,
        ownerId INTEGER NOT NULL,
        color TEXT DEFAULT 'bg-green-500'
      );

      CREATE TABLE IF NOT EXISTS list_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        unit TEXT,
        category TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        listId INTEGER NOT NULL,
        color TEXT DEFAULT 'bg-green-500'
      );

      CREATE TABLE IF NOT EXISTS list_participants (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        listId INTEGER NOT NULL,
        userId INTEGER NOT NULL,
        UNIQUE(listId, userId)
      );
    `);
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const row = this.db.prepare("SELECT * FROM users WHERE id = ?").get(id);
    return row as User | undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const row = this.db.prepare("SELECT * FROM users WHERE username = ?").get(username);
    return row as User | undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const row = this.db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    return row as User | undefined;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const stmt = this.db.prepare(
      "INSERT INTO users (username, password, name, email, avatarUrl) VALUES (?, ?, ?, ?, ?)"
    );
    const info = stmt.run(userData.username, userData.password, userData.name, userData.email, userData.avatarUrl);
    return { ...userData, id: Number(info.lastInsertRowid) };
  }

  async updateUser(id: number, data: Partial<User>): Promise<User> {
    const updates = Object.entries(data).map(([key]) => `${key} = ?`).join(", ");
    const values = Object.values(data);
    this.db.prepare(`UPDATE users SET ${updates} WHERE id = ?`).run(...values, id);
    return (await this.getUser(id))!;
  }

  // Shopping List methods
  async getListById(id: number): Promise<ShoppingList | undefined> {
    try {
      // קבל את הרשימה
      const list = this.db.prepare("SELECT * FROM shopping_lists WHERE id = ?").get(id);
      if (!list) return undefined;
      
      // קבל מידע על בעל הרשימה
      const owner = this.db.prepare("SELECT id, name, avatarUrl FROM users WHERE id = ?").get(list.ownerId);
      if (!owner) return list as ShoppingList;
      
      // הוסף את פרטי בעל הרשימה
      return {
        ...list,
        ownerName: owner.name,
        ownerAvatarUrl: owner.avatarUrl
      } as ShoppingList;
    } catch (error) {
      console.error("Error in getListById:", error);
      throw error;
    }
  }

  async getUserLists(userId: number): Promise<ShoppingList[]> {
    const ownedLists = this.db.prepare("SELECT * FROM shopping_lists WHERE ownerId = ?").all(userId);
    const participantLists = this.db.prepare(`
      SELECT sl.* FROM shopping_lists sl
      JOIN list_participants lp ON sl.id = lp.listId
      WHERE lp.userId = ?
    `).all(userId);
    return [...ownedLists, ...participantLists] as ShoppingList[];
  }

  async createList(listData: InsertShoppingList): Promise<ShoppingList> {
    const stmt = this.db.prepare(
      "INSERT INTO shopping_lists (name, description, datePlanned, ownerId, color) VALUES (?, ?, ?, ?, ?)"
    );
    const info = stmt.run(listData.name, listData.description, listData.datePlanned, listData.ownerId, listData.color);
    return { ...listData, id: Number(info.lastInsertRowid) };
  }

  async updateList(id: number, data: Partial<ShoppingList>): Promise<ShoppingList> {
    console.log("updateList - Start");
    console.log("Incoming data:", JSON.stringify(data, null, 2));
  
    try {
      // ודא שהרשימה קיימת
      const list = this.db.prepare("SELECT * FROM shopping_lists WHERE id = ?").get(id);
      if (!list) {
        console.error(`List with id ${id} not found`);
        throw new Error(`List with id ${id} not found`);
      }
  
      // בנה את שאילתת העדכון רק אם יש שדות לעדכון
      const validFields = ['name', 'description', 'datePlanned', 'color'];
      const updateEntries = Object.entries(data)
        .filter(([key, _]) => validFields.includes(key) && key !== undefined);
  
      console.log("Update entries:", JSON.stringify(updateEntries, null, 2));
      
      if (updateEntries.length === 0) {
        console.warn("No valid fields to update");
        return list as ShoppingList;
      }
      
      const updates = updateEntries.map(([key]) => `${key} = ?`).join(", ");
      const values = updateEntries.map(([_, value]) => value);
      
      console.log("SQL update:", `UPDATE shopping_lists SET ${updates} WHERE id = ?`);
      console.log("Update values:", values);
      
      // בצע את העדכון
      this.db.prepare(`UPDATE shopping_lists SET ${updates} WHERE id = ?`).run(...values, id);
      
      // קבל את הרשימה המעודכנת
      const updatedList = this.db.prepare("SELECT * FROM shopping_lists WHERE id = ?").get(id);
      console.log("Updated list:", JSON.stringify(updatedList, null, 2));
      
      return updatedList as ShoppingList;
    } catch (error) {
      console.error("Detailed error in updateList:", error);
      throw error;
    }
  }

  async deleteList(id: number): Promise<void> {
    this.db.prepare("DELETE FROM shopping_lists WHERE id = ?").run(id);
    this.db.prepare("DELETE FROM list_items WHERE listId = ?").run(id);
    this.db.prepare("DELETE FROM list_participants WHERE listId = ?").run(id);
  }

  async canUserAccessList(userId: number, listId: number): Promise<boolean> {
    const list = await this.getListById(listId);
    if (!list) return false;
    if (list.ownerId === userId) return true;
    const participant = this.db.prepare("SELECT 1 FROM list_participants WHERE listId = ? AND userId = ?").get(listId, userId);
    return !!participant;
  }

  // List Items methods
  async getListItems(listId: number): Promise<ListItem[]> {
    return this.db.prepare("SELECT * FROM list_items WHERE listId = ?").all(listId) as ListItem[];
  }

  async createListItem(itemData: InsertListItem): Promise<ListItem> {
    const stmt = this.db.prepare(
      "INSERT INTO list_items (name, quantity, unit, category, status, listId, color) VALUES (?, ?, ?, ?, ?, ?, ?)"
    );
    const info = stmt.run(
      itemData.name,
      itemData.quantity,
      itemData.unit,
      itemData.category,
      itemData.status,
      itemData.listId,
      itemData.color
    );
    return { ...itemData, id: Number(info.lastInsertRowid) };
  }

  async updateListItem(id: number, data: Partial<ListItem>): Promise<ListItem> {
    // בדיקה שהפריט קיים לפני העדכון
    const item = this.db.prepare("SELECT * FROM list_items WHERE id = ?").get(id);
    if (!item) {
      throw new Error(`Item with id ${id} not found`);
    }
    
    // שמירת ה-listId לפני העדכון כדי להשתמש בו אחר כך
    const listId = item.listId;
    
    // עדכון הפריט
    const updates = Object.entries(data).map(([key]) => `${key} = ?`).join(", ");
    const values = Object.values(data);
    
    if (updates.length > 0) {
      this.db.prepare(`UPDATE list_items SET ${updates} WHERE id = ?`).run(...values, id);
    }
    
    // בדיקה ספציפית שמחזירה את הפריט המעודכן
    const updatedItem = this.db.prepare("SELECT * FROM list_items WHERE id = ?").get(id);
    return updatedItem as ListItem;
  }

  async deleteListItem(id: number): Promise<void> {
    this.db.prepare("DELETE FROM list_items WHERE id = ?").run(id);
  }

  // List Participants methods
  async getListParticipants(listId: number): Promise<User[]> {
    try {
      // קבל את הרשימה כדי לדעת מיהו בעל הרשימה
      const list = await this.getListById(listId);
      if (!list) return [];
      
      // קבל את כל המשתתפים
      const participants = this.db.prepare(`
        SELECT u.* FROM users u
        JOIN list_participants lp ON u.id = lp.userId
        WHERE lp.listId = ?
      `).all(listId) as User[];
      
      // אופציה: החזר את כל המשתתפים, הסינון ייעשה בצד הלקוח
      return participants;
      
      /* אופציה נוספת: סנן את בעל הרשימה בצד השרת
      return participants.filter(user => user.id !== list.ownerId);
      */
    } catch (error) {
      console.error("Error in getListParticipants:", error);
      throw error;
    }
  }

  async isListSharedWithUser(listId: number, userId: number): Promise<boolean> {
    const row = this.db.prepare("SELECT 1 FROM list_participants WHERE listId = ? AND userId = ?").get(listId, userId);
    return !!row;
  }

  async addListParticipant(participantData: InsertListParticipant): Promise<ListParticipant> {
    const stmt = this.db.prepare(
      "INSERT INTO list_participants (listId, userId) VALUES (?, ?)"
    );
    const info = stmt.run(participantData.listId, participantData.userId);
    return { ...participantData, id: Number(info.lastInsertRowid) };
  }

  async removeListParticipant(id: number): Promise<void> {
    this.db.prepare("DELETE FROM list_participants WHERE id = ?").run(id);
  }
}

export const storage = new SQLiteStorage();