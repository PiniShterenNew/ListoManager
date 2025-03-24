import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { 
  insertShoppingListSchema, 
  insertListItemSchema, 
  insertListParticipantSchema 
} from "@shared/schema";
import { ZodError } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Middleware to ensure user is authenticated
  const ensureAuthenticated = (req: any, res: any, next: any) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).send("יש להתחבר כדי לגשת למשאב זה");
  };

  // Shopping Lists Routes
  app.get("/api/lists", ensureAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const lists = await storage.getUserLists(userId);
      res.json(lists);
    } catch (error) {
      res.status(500).json({ message: "שגיאה בשליפת רשימות" });
    }
  });

  app.post("/api/lists", ensureAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const listData = insertShoppingListSchema.parse({
        ...req.body,
        ownerId: userId
      });
      
      const newList = await storage.createList(listData);
      res.status(201).json(newList);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "נתונים לא תקינים", errors: error.errors });
      }
      res.status(500).json({ message: "שגיאה ביצירת רשימה חדשה" });
    }
  });

  app.get("/api/lists/:id", ensureAuthenticated, async (req, res) => {
    try {
      const listId = parseInt(req.params.id);
      const userId = req.user!.id;
      
      // Check if user has access to this list
      const canAccess = await storage.canUserAccessList(userId, listId);
      if (!canAccess) {
        return res.status(403).json({ message: "אין לך הרשאות לצפות ברשימה זו" });
      }
      
      const list = await storage.getListById(listId);
      if (!list) {
        return res.status(404).json({ message: "רשימה לא נמצאה" });
      }
      
      res.json(list);
    } catch (error) {
      res.status(500).json({ message: "שגיאה בשליפת פרטי רשימה" });
    }
  });

  app.put("/api/lists/:id", ensureAuthenticated, async (req, res) => {
    try {
      const listId = parseInt(req.params.id);
      const userId = req.user!.id;
      
      // Check if user is the owner of this list
      const list = await storage.getListById(listId);
      if (!list) {
        return res.status(404).json({ message: "רשימה לא נמצאה" });
      }
      
      if (list.ownerId !== userId) {
        return res.status(403).json({ message: "רק בעל הרשימה יכול לערוך אותה" });
      }
      
      const updatedList = await storage.updateList(listId, req.body);
      res.json(updatedList);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "נתונים לא תקינים", errors: error.errors });
      }
      res.status(500).json({ message: "שגיאה בעדכון רשימה" });
    }
  });

  app.delete("/api/lists/:id", ensureAuthenticated, async (req, res) => {
    try {
      const listId = parseInt(req.params.id);
      const userId = req.user!.id;
      
      // Check if user is the owner of this list
      const list = await storage.getListById(listId);
      if (!list) {
        return res.status(404).json({ message: "רשימה לא נמצאה" });
      }
      
      if (list.ownerId !== userId) {
        return res.status(403).json({ message: "רק בעל הרשימה יכול למחוק אותה" });
      }
      
      await storage.deleteList(listId);
      res.status(200).json({ message: "רשימה נמחקה בהצלחה" });
    } catch (error) {
      res.status(500).json({ message: "שגיאה במחיקת רשימה" });
    }
  });

  // List Items Routes
  app.get("/api/lists/:listId/items", ensureAuthenticated, async (req, res) => {
    try {
      const listId = parseInt(req.params.listId);
      const userId = req.user!.id;
      
      // Check if user has access to this list
      const canAccess = await storage.canUserAccessList(userId, listId);
      if (!canAccess) {
        return res.status(403).json({ message: "אין לך הרשאות לצפות בפריטים" });
      }
      
      const items = await storage.getListItems(listId);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "שגיאה בשליפת פריטים" });
    }
  });

  app.post("/api/lists/:listId/items", ensureAuthenticated, async (req, res) => {
    try {
      const listId = parseInt(req.params.listId);
      const userId = req.user!.id;
      
      // Check if user has access to this list
      const canAccess = await storage.canUserAccessList(userId, listId);
      if (!canAccess) {
        return res.status(403).json({ message: "אין לך הרשאות להוסיף פריטים" });
      }
      
      const itemData = insertListItemSchema.parse({
        ...req.body,
        listId
      });
      
      const newItem = await storage.createListItem(itemData);
      res.status(201).json(newItem);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "נתונים לא תקינים", errors: error.errors });
      }
      res.status(500).json({ message: "שגיאה בהוספת פריט" });
    }
  });

  app.put("/api/lists/:listId/items/:itemId", ensureAuthenticated, async (req, res) => {
    try {
      const listId = parseInt(req.params.listId);
      const itemId = parseInt(req.params.itemId);
      const userId = req.user!.id;
      
      // Check if user has access to this list
      const canAccess = await storage.canUserAccessList(userId, listId);
      if (!canAccess) {
        return res.status(403).json({ message: "אין לך הרשאות לעדכן פריטים" });
      }
      
      const updatedItem = await storage.updateListItem(itemId, req.body);
      res.json(updatedItem);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "נתונים לא תקינים", errors: error.errors });
      }
      res.status(500).json({ message: "שגיאה בעדכון פריט" });
    }
  });

  app.delete("/api/lists/:listId/items/:itemId", ensureAuthenticated, async (req, res) => {
    try {
      const listId = parseInt(req.params.listId);
      const itemId = parseInt(req.params.itemId);
      const userId = req.user!.id;
      
      // Check if user has access to this list
      const canAccess = await storage.canUserAccessList(userId, listId);
      if (!canAccess) {
        return res.status(403).json({ message: "אין לך הרשאות למחוק פריטים" });
      }
      
      await storage.deleteListItem(itemId);
      res.status(200).json({ message: "פריט נמחק בהצלחה" });
    } catch (error) {
      res.status(500).json({ message: "שגיאה במחיקת פריט" });
    }
  });

  // List Participants Routes
  app.get("/api/lists/:listId/participants", ensureAuthenticated, async (req, res) => {
    try {
      const listId = parseInt(req.params.listId);
      const userId = req.user!.id;
      
      // Check if user has access to this list
      const canAccess = await storage.canUserAccessList(userId, listId);
      if (!canAccess) {
        return res.status(403).json({ message: "אין לך הרשאות לצפות במשתתפים" });
      }
      
      const participants = await storage.getListParticipants(listId);
      res.json(participants);
    } catch (error) {
      res.status(500).json({ message: "שגיאה בשליפת משתתפים" });
    }
  });

  app.post("/api/lists/:listId/share", ensureAuthenticated, async (req, res) => {
    try {
      const listId = parseInt(req.params.listId);
      const userId = req.user!.id;
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "נדרשת כתובת מייל" });
      }
      
      // Check if user is the owner of this list
      const list = await storage.getListById(listId);
      if (!list) {
        return res.status(404).json({ message: "רשימה לא נמצאה" });
      }
      
      if (list.ownerId !== userId) {
        return res.status(403).json({ message: "רק בעל הרשימה יכול לשתף אותה" });
      }
      
      // Find user by email
      const userToShare = await storage.getUserByEmail(email);
      if (!userToShare) {
        return res.status(404).json({ message: "משתמש עם מייל זה לא נמצא" });
      }
      
      // Don't share with owner or if already shared
      if (userToShare.id === userId) {
        return res.status(400).json({ message: "לא ניתן לשתף רשימה עם עצמך" });
      }
      
      const isAlreadyShared = await storage.isListSharedWithUser(listId, userToShare.id);
      if (isAlreadyShared) {
        return res.status(400).json({ message: "רשימה כבר משותפת עם משתמש זה" });
      }
      
      const participant = await storage.addListParticipant({
        listId,
        userId: userToShare.id
      });
      
      res.status(201).json(participant);
    } catch (error) {
      res.status(500).json({ message: "שגיאה בשיתוף רשימה" });
    }
  });

  app.delete("/api/lists/:listId/participants/:participantId", ensureAuthenticated, async (req, res) => {
    try {
      const listId = parseInt(req.params.listId);
      const participantId = parseInt(req.params.participantId);
      const userId = req.user!.id;
      
      // Check if user is the owner of this list
      const list = await storage.getListById(listId);
      if (!list) {
        return res.status(404).json({ message: "רשימה לא נמצאה" });
      }
      
      if (list.ownerId !== userId) {
        return res.status(403).json({ message: "רק בעל הרשימה יכול להסיר משתתפים" });
      }
      
      await storage.removeListParticipant(participantId);
      res.status(200).json({ message: "משתתף הוסר בהצלחה" });
    } catch (error) {
      res.status(500).json({ message: "שגיאה בהסרת משתתף" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
