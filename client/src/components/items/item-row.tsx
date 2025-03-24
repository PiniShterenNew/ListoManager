import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ListItem } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

interface ItemRowProps {
  item: ListItem;
  listId: number;
}

// Category to emoji mapping
const categoryEmojis: Record<string, string> = {
  dairy: "🥛",
  fruits: "🍎",
  vegetables: "🥦",
  meat: "🥩",
  bread: "🍞",
  cleaning: "🧹",
  other: "📦",
};

const formSchema = z.object({
  name: z.string().min(2, { message: "שם הפריט חייב להכיל לפחות 2 תווים" }),
  quantity: z.coerce.number().int().positive({ message: "הכמות חייבת להיות מספר חיובי" }),
  unit: z.string().optional(),
  category: z.string().optional(),
});

export default function ItemRow({ item, listId }: ItemRowProps) {
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: item.name,
      quantity: item.quantity,
      unit: item.unit || "",
      category: item.category || "",
    },
  });

  // Toggle item status
  const toggleStatusMutation = useMutation({
    mutationFn: async () => {
      const newStatus = item.status === "pending" ? "purchased" : "pending";
      await apiRequest("PUT", `/api/lists/${listId}/items/${item.id}`, {
        status: newStatus,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/lists/${listId}/items`] });
      toast({
        title: "פריט עודכן",
        description: item.status === "pending" 
          ? `${item.name} סומן כנרכש` 
          : `${item.name} סומן כממתין לרכישה`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "שגיאה בעדכון פריט",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update item
  const updateItemMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      await apiRequest("PUT", `/api/lists/${listId}/items/${item.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/lists/${listId}/items`] });
      toast({
        title: "פריט עודכן",
        description: "הפריט עודכן בהצלחה",
      });
      setIsEditDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "שגיאה בעדכון פריט",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete item
  const deleteItemMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/lists/${listId}/items/${item.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/lists/${listId}/items`] });
      toast({
        title: "פריט נמחק",
        description: "הפריט נמחק בהצלחה",
      });
      setIsDeleteDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "שגיאה במחיקת פריט",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleToggleStatus = () => {
    toggleStatusMutation.mutate();
  };

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    updateItemMutation.mutate(data);
  };

  const handleDelete = () => {
    deleteItemMutation.mutate();
  };

  const isPurchased = item.status === "purchased";
  const emoji = item.category ? categoryEmojis[item.category] || "📦" : "📦";

  return (
    <>
      <div className={`flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm hover:shadow transition-shadow ${isPurchased ? "opacity-70" : ""}`}>
        <button 
          type="button" 
          onClick={handleToggleStatus}
          className={`flex-shrink-0 h-5 w-5 rounded-full ${
            isPurchased 
              ? "bg-primary border-2 border-primary text-white flex items-center justify-center" 
              : "border-2 border-gray-300 hover:border-primary"
          }`}
        >
          {isPurchased && (
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          )}
        </button>
        <div className="flex-shrink-0 text-xl">{emoji}</div>
        <div className="flex-grow">
          <div className={`font-medium ${isPurchased ? "line-through" : ""}`}>{item.name}</div>
          <div className="text-xs text-gray-500">
            {item.category ? 
              item.category === "dairy" ? "מוצרי חלב" :
              item.category === "fruits" ? "פירות" :
              item.category === "vegetables" ? "ירקות" :
              item.category === "meat" ? "בשר" :
              item.category === "bread" ? "לחם" :
              item.category === "cleaning" ? "ניקיון" : "אחר"
            : "אחר"}
          </div>
        </div>
        <div className={`text-sm font-medium ${isPurchased ? "line-through" : ""}`}>
          {item.quantity} {item.unit === "units" ? "יחידות" :
              item.unit === "kg" ? "ק״ג" :
              item.unit === "g" ? "גרם" :
              item.unit === "l" ? "ליטר" :
              item.unit === "ml" ? "מ״ל" :
              item.unit === "pack" ? "חבילה" : ""}
        </div>
        <div className="flex gap-2 items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsEditDialogOpen(true)}
            className="text-gray-400 hover:text-foreground hover:bg-transparent"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsDeleteDialogOpen(true)}
            className="text-gray-400 hover:text-red-500 hover:bg-transparent"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>עריכת פריט</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>שם הפריט</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex gap-4">
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>כמות</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="unit"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>יחידה</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="בחר יחידה" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="units">יחידות</SelectItem>
                          <SelectItem value="kg">ק״ג</SelectItem>
                          <SelectItem value="g">גרם</SelectItem>
                          <SelectItem value="l">ליטר</SelectItem>
                          <SelectItem value="ml">מ״ל</SelectItem>
                          <SelectItem value="pack">חבילה</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>קטגוריה</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="בחר קטגוריה" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="dairy">מוצרי חלב 🥛</SelectItem>
                        <SelectItem value="fruits">פירות 🍎</SelectItem>
                        <SelectItem value="vegetables">ירקות 🥦</SelectItem>
                        <SelectItem value="meat">בשר 🥩</SelectItem>
                        <SelectItem value="bread">לחם 🍞</SelectItem>
                        <SelectItem value="cleaning">ניקיון 🧹</SelectItem>
                        <SelectItem value="other">אחר 📦</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter className="mt-6">
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditDialogOpen(false)}
                  type="button"
                >
                  ביטול
                </Button>
                <Button 
                  type="submit"
                  disabled={updateItemMutation.isPending}
                >
                  {updateItemMutation.isPending ? "מעדכן..." : "עדכן פריט"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>מחיקת פריט</AlertDialogTitle>
            <AlertDialogDescription>
              האם אתה בטוח שברצונך למחוק את הפריט "{item.name}"? פעולה זו לא ניתנת לביטול.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ביטול</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              מחק
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
