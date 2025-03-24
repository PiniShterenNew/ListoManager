import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ListItem, PRODUCT_CATEGORIES } from "@shared/schema";
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
import { hexToRGBA } from "../utils/hexToRGBA";

interface ItemRowProps {
  item: ListItem;
  listId: number;
  color: string;
}

const formSchema = z.object({
  name: z.string().min(2, { message: "שם הפריט חייב להכיל לפחות 2 תווים" }),
  quantity: z.coerce.number().int().positive({ message: "הכמות חייבת להיות מספר חיובי" }),
  unit: z.string().optional(),
  category: z.string().optional(),
});

export default function ItemRow({ item, listId, color }: ItemRowProps) {
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
  const categoryKey = item.category as keyof typeof PRODUCT_CATEGORIES || "OTHER";
  const Icon = PRODUCT_CATEGORIES[categoryKey]?.icon || PRODUCT_CATEGORIES.OTHER.icon;
  const emoji = <Icon className="h-
  5 w-5" />;

  return (
    <>
      <div className={`item-row ${isPurchased ? "opacity-75 bg-muted/20" : ""}`}>
        <button 
          type="button" 
          onClick={handleToggleStatus}
          className={`flex-shrink-0 h-7 w-7 rounded-full min-w-[28px] transition-all duration-200 ${
            isPurchased 
              ? "bg-gradient-to-r from-primary to-primary/85 border border-primary text-white flex items-center justify-center shadow-sm" 
              : "border-2 border-gray-200 hover:border-primary hover:scale-110"
          }`}
        >
          {isPurchased && (
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="animate-[checkmark_0.4s_ease-in-out]">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          )}
        </button>
        
        <div className="flex-shrink-0 text-2xl min-w-[2.5rem] flex items-center justify-center bg-muted/40 rounded-md h-10 w-10">
          <span className="transform hover:scale-110 transition-transform duration-200">{emoji}</span>
        </div>
        
        <div className="flex-grow min-w-0 mr-2">
          <div className={`font-medium truncate text-[15px] ${isPurchased ? "line-through text-muted-foreground" : ""}`}>
            {item.name}
          </div>
          <div className="text-xs text-muted-foreground truncate flex items-center gap-1">
            <span style={{background: color}} className="inline-block h-1.5 w-1.5 rounded-full bg-primary/30"></span>
            {item.category && PRODUCT_CATEGORIES[categoryKey] 
              ? PRODUCT_CATEGORIES[categoryKey].name 
              : PRODUCT_CATEGORIES.OTHER.name}
          </div>
        </div>
        
        <div style={{background: hexToRGBA(color, 0.2), color: color}} className={`quantity-badge px-3 whitespace-nowrap mx-2 ${
          isPurchased ? "line-through" : ""
        }`}>
          {item.quantity} {item.unit === "units" ? "יחידות" :
            item.unit === "kg" ? "ק״ג" :
            item.unit === "g" ? "גרם" :
            item.unit === "l" ? "ליטר" :
            item.unit === "ml" ? "מ״ל" :
            item.unit === "pack" ? "חבילה" : ""}
        </div>
        
        <div className="flex gap-1 sm:gap-1 items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={(e) => {
              e.stopPropagation();
              setIsEditDialogOpen(true);
            }}
            className="text-muted-foreground hover:text-foreground hover:bg-muted/50 h-8 w-8 rounded-full"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={(e) => {
              e.stopPropagation();
              setIsDeleteDialogOpen(true);
            }}
            className="text-muted-foreground hover:text-red-500 hover:bg-red-50 h-8 w-8 rounded-full"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <span className="text-2xl">{emoji}</span>
              עריכת פריט
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              שנה את פרטי הפריט לפי הצורך
            </p>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 pt-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[15px]">שם הפריט</FormLabel>
                    <FormControl>
                      <Input {...field} className="h-11" />
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
                      <FormLabel className="text-[15px]">כמות</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1" 
                          {...field} 
                          className="h-11"
                        />
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
                      <FormLabel className="text-[15px]">יחידה</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-11">
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
                    <FormLabel className="text-[15px]">קטגוריה</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="בחר קטגוריה" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(PRODUCT_CATEGORIES).map(([key, value]) => (
                          <SelectItem key={key} value={key} className="h-9">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{String(value.icon)}</span> 
                              <span>{value.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter className="mt-8 gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditDialogOpen(false)}
                  type="button"
                  className="min-h-[44px]"
                >
                  ביטול
                </Button>
                <Button 
                  type="submit"
                  disabled={updateItemMutation.isPending}
                  className="min-h-[44px] mobile-friendly-button px-6"
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
        <AlertDialogContent className="max-w-[400px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">מחיקת פריט</AlertDialogTitle>
            <AlertDialogDescription className="mt-2">
              <div className="bg-red-50 border border-red-100 rounded-lg p-4 text-sm flex flex-col items-center gap-2 my-2">
                <div className="text-3xl mb-1">{emoji as React.ReactNode}</div>
                <div className="font-medium text-base text-foreground">{item.name}</div>
                <div className="text-muted-foreground text-center">
                  האם אתה בטוח שברצונך למחוק פריט זה מהרשימה? פעולה זו לא ניתנת לביטול.
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-2">
            <AlertDialogCancel className="min-h-[44px]">
              ביטול
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600 min-h-[44px] font-medium"
            >
              {deleteItemMutation.isPending ? "מוחק..." : "מחק פריט"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}