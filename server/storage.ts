import { 
  User, InsertUser, 
  ShoppingList, InsertShoppingList, 
  ListItem, InsertListItem, 
  ListParticipant, InsertListParticipant 
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Lists
  getListById(id: number): Promise<ShoppingList | undefined>;
  getUserLists(userId: number): Promise<ShoppingList[]>;
  createList(list: InsertShoppingList): Promise<ShoppingList>;
  updateList(id: number, data: Partial<ShoppingList>): Promise<ShoppingList>;
  deleteList(id: number): Promise<void>;
  canUserAccessList(userId: number, listId: number): Promise<boolean>;
  
  // List Items
  getListItems(listId: number): Promise<ListItem[]>;
  createListItem(item: InsertListItem): Promise<ListItem>;
  updateListItem(id: number, data: Partial<ListItem>): Promise<ListItem>;
  deleteListItem(id: number): Promise<void>;
  
  // List Participants
  getListParticipants(listId: number): Promise<User[]>;
  isListSharedWithUser(listId: number, userId: number): Promise<boolean>;
  addListParticipant(participant: InsertListParticipant): Promise<ListParticipant>;
  removeListParticipant(id: number): Promise<void>;
  
  // Session
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private lists: Map<number, ShoppingList>;
  private items: Map<number, ListItem>;
  private participants: Map<number, ListParticipant>;
  sessionStore: session.SessionStore;
  
  private userIdCounter: number;
  private listIdCounter: number;
  private itemIdCounter: number;
  private participantIdCounter: number;

  constructor() {
    this.users = new Map();
    this.lists = new Map();
    this.items = new Map();
    this.participants = new Map();
    
    this.userIdCounter = 1;
    this.listIdCounter = 1;
    this.itemIdCounter = 1;
    this.participantIdCounter = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24 hours
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(userData: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...userData, id };
    this.users.set(id, user);
    return user;
  }

  // Shopping List methods
  async getListById(id: number): Promise<ShoppingList | undefined> {
    return this.lists.get(id);
  }

  async getUserLists(userId: number): Promise<ShoppingList[]> {
    // Get lists owned by user
    const ownedLists = Array.from(this.lists.values()).filter(
      list => list.ownerId === userId
    );
    
    // Get lists shared with user
    const participatedListIds = Array.from(this.participants.values())
      .filter(p => p.userId === userId)
      .map(p => p.listId);
    
    const participatedLists = Array.from(this.lists.values()).filter(
      list => participatedListIds.includes(list.id)
    );
    
    // Combine both types of lists
    return [...ownedLists, ...participatedLists];
  }

  async createList(listData: InsertShoppingList): Promise<ShoppingList> {
    const id = this.listIdCounter++;
    const list: ShoppingList = { ...listData, id };
    this.lists.set(id, list);
    return list;
  }

  async updateList(id: number, data: Partial<ShoppingList>): Promise<ShoppingList> {
    const list = this.lists.get(id);
    if (!list) {
      throw new Error("List not found");
    }
    
    const updatedList = { ...list, ...data };
    this.lists.set(id, updatedList);
    return updatedList;
  }

  async deleteList(id: number): Promise<void> {
    // Delete list
    this.lists.delete(id);
    
    // Delete all items from this list
    const itemIds = Array.from(this.items.values())
      .filter(item => item.listId === id)
      .map(item => item.id);
    
    for (const itemId of itemIds) {
      this.items.delete(itemId);
    }
    
    // Delete all participants of this list
    const participantIds = Array.from(this.participants.values())
      .filter(p => p.listId === id)
      .map(p => p.id);
    
    for (const participantId of participantIds) {
      this.participants.delete(participantId);
    }
  }

  async canUserAccessList(userId: number, listId: number): Promise<boolean> {
    const list = await this.getListById(listId);
    if (!list) return false;
    
    // User is the owner
    if (list.ownerId === userId) return true;
    
    // Check if user is a participant
    const isParticipant = Array.from(this.participants.values()).some(
      p => p.listId === listId && p.userId === userId
    );
    
    return isParticipant;
  }

  // List Items methods
  async getListItems(listId: number): Promise<ListItem[]> {
    return Array.from(this.items.values()).filter(item => item.listId === listId);
  }

  async createListItem(itemData: InsertListItem): Promise<ListItem> {
    const id = this.itemIdCounter++;
    const item: ListItem = { ...itemData, id };
    this.items.set(id, item);
    return item;
  }

  async updateListItem(id: number, data: Partial<ListItem>): Promise<ListItem> {
    const item = this.items.get(id);
    if (!item) {
      throw new Error("Item not found");
    }
    
    const updatedItem = { ...item, ...data };
    this.items.set(id, updatedItem);
    return updatedItem;
  }

  async deleteListItem(id: number): Promise<void> {
    this.items.delete(id);
  }

  // List Participants methods
  async getListParticipants(listId: number): Promise<User[]> {
    const participantUserIds = Array.from(this.participants.values())
      .filter(p => p.listId === listId)
      .map(p => p.userId);
    
    const participantUsers = [];
    for (const userId of participantUserIds) {
      const user = await this.getUser(userId);
      if (user) {
        participantUsers.push(user);
      }
    }
    
    return participantUsers;
  }

  async isListSharedWithUser(listId: number, userId: number): Promise<boolean> {
    return Array.from(this.participants.values()).some(
      p => p.listId === listId && p.userId === userId
    );
  }

  async addListParticipant(participantData: InsertListParticipant): Promise<ListParticipant> {
    const id = this.participantIdCounter++;
    const participant: ListParticipant = { ...participantData, id };
    this.participants.set(id, participant);
    return participant;
  }

  async removeListParticipant(id: number): Promise<void> {
    this.participants.delete(id);
  }
}

export const storage = new MemStorage();
