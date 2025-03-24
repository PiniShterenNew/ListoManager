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
import { cn } from "@/lib/utils";

interface ItemFormProps {
  listId: number;
  color: string; // הוספת ה-prrop של צבע HEX
}

const formSchema = z.object({
  name: z.string().min(2, { message: "שם הפריט חייב להכיל לפחות 2 תווים" }),
  quantity: z.coerce.number().int().positive({ message: "הכמות חייבת להיות מספר חיובי" }).default(1),
  unit: z.string().optional(),
  category: z.string().optional(),
});

export default function ItemForm({ listId, color }: ItemFormProps) {
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
        color, // הוספת הצבע לפריט
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
        <div className="card mb-4 relative bg-white/90 backdrop-blur-sm">
          <div
            className="absolute top-0 left-0 h-1 w-full rounded-t-lg"
            style={{ backgroundColor: color }} // שימוש בצבע ה-HEX
          />

          <div className="flex items-center mb-4 gap-3">
            <div
              style={{ backgroundColor: color }}
              className="w-10 h-10 rounded-md flex items-center justify-center mr-3 bg-opacity-10"
            >
              <Plus className="h-5 w-5 text-white" /> {/* צבע ה-Plus */}
            </div>
            <h3 className="text-lg font-medium ">הוסף פריט חדש</h3>
          </div>

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
                        style={{ borderColor: color }} // גבול בצבע ה-HEX
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
                        style={{ borderColor: color }} // גבול בצבע ה-HEX
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
                        <SelectTrigger
                          className="min-h-[44px]"
                          style={{ borderColor: color }} // גבול בצבע ה-HEX
                        >
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
                        <SelectTrigger
                          className="min-h-[44px]"
                          style={{ borderColor: color }} // גבול בצבע ה-HEX
                        >
                          <SelectValue placeholder="קטגוריה" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-[300px]">
                        {Object.entries(PRODUCT_CATEGORIES).map(([key, value]) => (
                          <SelectItem key={key} value={key} className="h-9">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{value.icon && <value.icon />}</span> 
                              <span>{value.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>
            
            <div className="pt-2">
              <Button 
                type="submit"
                color={color} // צבע ה-HEX
                disabled={addItemMutation.isPending}
                className="w-full md:w-auto"
                style={{ backgroundColor: color, borderColor: color }} // רקע וכפתור בצבע ה-HEX
              >
                <Plus className="ml-1.5 h-4 w-4" />
                {addItemMutation.isPending ? "מוסיף פריט..." : "הוסף פריט"}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}