import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User } from "@shared/schema";
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
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface ShareListModalProps {
  isOpen: boolean;
  onClose: () => void;
  listId: number;
  participants: User[];
}

const formSchema = z.object({
  email: z.string().email({ message: "יש להזין כתובת מייל תקינה" }),
});

type FormValues = z.infer<typeof formSchema>;

export default function ShareListModal({ 
  isOpen, 
  onClose, 
  listId, 
  participants 
}: ShareListModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const shareListMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const response = await apiRequest("POST", `/api/lists/${listId}/share`, {
        email: data.email,
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/lists/${listId}/participants`] });
      toast({
        title: "רשימה שותפה",
        description: "הרשימה שותפה בהצלחה",
      });
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "שגיאה בשיתוף רשימה",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const removeParticipantMutation = useMutation({
    mutationFn: async (participantId: number) => {
      await apiRequest("DELETE", `/api/lists/${listId}/participants/${participantId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/lists/${listId}/participants`] });
      toast({
        title: "משתתף הוסר",
        description: "המשתתף הוסר בהצלחה מהרשימה",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "שגיאה בהסרת משתתף",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormValues) => {
    shareListMutation.mutate(data);
  };

  const handleRemoveParticipant = (participantId: number) => {
    removeParticipantMutation.mutate(participantId);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>שיתוף רשימת קניות</DialogTitle>
        </DialogHeader>
        <div className="mt-2">
          <p className="text-sm text-muted-foreground">
            הזן את כתובת האימייל של האדם שאיתו תרצה לשתף את הרשימה.
          </p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>כתובת אימייל</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="example@example.com"
                      type="email"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit"
              className="w-full"
              disabled={shareListMutation.isPending}
            >
              {shareListMutation.isPending ? "משתף..." : "שתף"}
            </Button>
          </form>
        </Form>

        <div className="mt-6">
          <div className="text-sm font-medium text-foreground">משתתפים נוכחיים</div>
          <ul className="mt-3 space-y-2">
            {/* Owner */}
            <li className="flex items-center justify-between">
              <div className="flex items-center">
                {user?.avatarUrl ? (
                  <img 
                    className="h-8 w-8 rounded-full object-cover" 
                    src={user.avatarUrl} 
                    alt={user.name} 
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                    {user?.name.charAt(0)}
                  </div>
                )}
                <div className="mr-3">
                  <div className="text-sm font-medium text-foreground">
                    {user?.name} (בעלים)
                  </div>
                  <div className="text-xs text-muted-foreground">{user?.email}</div>
                </div>
              </div>
            </li>
            
            {/* Participants */}
            {participants.map((participant) => (
              <li key={participant.id} className="flex items-center justify-between">
                <div className="flex items-center">
                  {participant.avatarUrl ? (
                    <img 
                      className="h-8 w-8 rounded-full object-cover" 
                      src={participant.avatarUrl} 
                      alt={participant.name} 
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-secondary/40 flex items-center justify-center">
                      {participant.name.charAt(0)}
                    </div>
                  )}
                  <div className="mr-3">
                    <div className="text-sm font-medium text-foreground">
                      {participant.name}
                    </div>
                    <div className="text-xs text-muted-foreground">{participant.email}</div>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleRemoveParticipant(participant.id)}
                  disabled={removeParticipantMutation.isPending}
                >
                  <X className="h-4 w-4 text-muted-foreground hover:text-red-500" />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
}
