import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { PRODUCT_CATEGORIES } from "@shared/schema";

interface ItemFormProps {
  listId: number;
}

const formSchema = z.object({
  name: z.string().min(2, { message: "שם הפריט חייב להכיל לפחות 2 תווים" }),
  quantity: z.coerce.number().int().positive({ message: "הכמות חייבת להיות מספר חיובי" }).default(1),
  unit: z.string().optional(),
  category: z.string().optional(),
});

export default function ItemForm({ listId }: ItemFormProps) {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      quantity: 1,
      unit: "",
      category: "",
    },
  });

  const addItemMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const response = await apiRequest("POST", `/api/lists/${listId}/items`, {
        ...data,
        listId,
        status: "pending",
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/lists/${listId}/items`] });
      toast({
        title: "פריט נוסף",
        description: "הפריט נוסף בהצלחה לרשימה",
      });
      form.reset({
        name: "",
        quantity: 1,
        unit: "",
        category: "",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "שגיאה בהוספת פריט",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    addItemMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="mb-8">
        <div className="card mb-4">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="flex-grow">
                    <FormControl>
                      <Input 
                        placeholder="הוסף פריט חדש, לדוג׳: חלב"
                        className="min-h-[44px]"
                        {...field} 
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem className="w-full sm:w-24">
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="כמות" 
                        min="1"
                        className="min-h-[44px]"
                        {...field} 
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem className="w-full sm:w-1/3">
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="min-h-[44px]">
                          <SelectValue placeholder="יחידה" />
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
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem className="w-full sm:w-2/3">
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="min-h-[44px]">
                          <SelectValue placeholder="קטגוריה" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(PRODUCT_CATEGORIES).map(([key, value]) => (
                          <SelectItem key={key} value={key}>
                            {value.name} {value.icon}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>
            
            <div className="flex justify-end">
              <Button 
                type="submit"
                disabled={addItemMutation.isPending}
                className="mobile-friendly-button w-full sm:w-auto"
              >
                <Plus className="ml-1.5 h-4 w-4" />
                הוסף פריט
              </Button>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}
