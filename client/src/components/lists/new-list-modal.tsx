import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ColorPicker } from "../ColorPicker";

interface NewListModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const formSchema = z.object({
  name: z.string().min(3, { message: "שם הרשימה חייב להכיל לפחות 3 תווים" }),
  description: z.string().optional(),
  datePlanned: z.string().optional(),
  timePlanned: z.string().optional(), // ✅ חדש
  color: z.string().optional().default("bg-green-500"),
});

type FormValues = z.infer<typeof formSchema>;

export default function NewListModal({ isOpen, onClose }: NewListModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      datePlanned: new Date().toISOString().split('T')[0],
      timePlanned: new Date().toTimeString().slice(0, 5), // 🕒 פורמט HH:MM
      color: "#22c55e",
    },
  });

  useEffect(() => {
    // בדיקה האם התראות נתמכות בדפדפן
    if (!("Notification" in window)) {
      console.log("דפדפן זה אינו תומך בהתראות");
      return;
    }

    // בקשת הרשאה להתראות אם עוד לא ניתנה
    if (Notification.permission !== "granted" && Notification.permission !== "denied") {
      try {
        Notification.requestPermission();
      } catch (e) {
        console.error("שגיאה בבקשת הרשאה להתראות:", e);
      }
    }
  }, []);

  const scheduleNotification = () => {
    const notifyTime = new Date(`${form.getValues("datePlanned")}T${form.getValues("timePlanned")}`);
    const now = new Date();
    const timeout = notifyTime.getTime() - now.getTime();

    // רק אם יש הרשאה וזמן ההתראה בעתיד
    if (Notification.permission === "granted" && timeout > 0) {
      setTimeout(() => {
        try {
          new Notification("📢 הגיע הזמן להתחיל את הקנייה!", {
            body: `רשימת "${form.getValues("name")}" מחכה לך`,
            icon: "/generated-icon.png", // הוספת אייקון להתראה
            tag: `shopping-list-${data.id}` // מניעת התראות כפולות
          });
        } catch (e) {
          console.error("שגיאה ביצירת התראה:", e);
        }
      }, timeout);
    }
  };

  const createListMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      if (!user) throw new Error("User not authenticated");
      new Notification("📢 הגיע הזמן להתחיל את הקנייה!", {
        body: `רשימת "${form.getValues("name")}" מחכה לך`,
      });
      const response = await apiRequest("POST", "/api/lists", {
        ...data,
        ownerId: user.id,
      });

      return await response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/lists"] });
      toast({
        title: "רשימה נוצרה",
        description: "הרשימה נוצרה בהצלחה",
      });

      scheduleNotification();

      form.reset();
      onClose();
      // Navigate to the new list
      setLocation(`/lists/${data.id}`);
    },
    onError: (error: Error) => {
      toast({
        title: "שגיאה ביצירת רשימה",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormValues) => {
    createListMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>רשימה חדשה</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>שם הרשימה</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="לדוג׳: קניות לשבת"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>תיאור</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="תיאור קצר של הרשימה (אופציונלי)"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>צבע</FormLabel>
                  <FormControl>
                    <ColorPicker
                      selectedColor={field.value}
                      onColorChange={(color) => field.onChange(color)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="datePlanned"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>תאריך</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      min={new Date().toISOString().split("T")[0]}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="timePlanned"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>שעה</FormLabel>
                  <FormControl>
                    <Input
                      type="time"
                      {...field}
                      min={form.getValues("datePlanned") === new Date().toISOString().split("T")[0]
                        ? new Date().toTimeString().slice(0, 5)
                        : undefined}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="mt-6">
              <Button
                variant="outline"
                type="button"
                onClick={onClose}
              >
                ביטול
              </Button>
              <Button
                type="submit"
                disabled={createListMutation.isPending}
              >
                {createListMutation.isPending ? "יוצר רשימה..." : "צור רשימה"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
