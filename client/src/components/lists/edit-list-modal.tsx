import { useState } from "react";
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

interface EditListModalProps {
    isOpen: boolean;
    onClose: () => void;
    list: ShoppingList;
}

const formSchema = z.object({
    name: z.string().min(3, { message: "שם הרשימה חייב להכיל לפחות 3 תווים" }),
    description: z.string().optional(),
    datePlanned: z.string().optional(),
    timePlanned: z.string().optional(), // ✅ חדש
    color: z.string().optional().default("bg-green-500"),
});

type FormValues = z.infer<typeof formSchema>;

export default function EditListModal({ isOpen, onClose, list }: EditListModalProps) {
    const { user } = useAuth();
    const { toast } = useToast();
    const [, setLocation] = useLocation();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: list.name,
            description: list.description ?? "",
            datePlanned: list.datePlanned ?? new Date().toISOString().split('T')[0],
            timePlanned: new Date().toTimeString().slice(0, 5), // 🕒 פורמט HH:MM
            color: list.color ?? "#22c55e",
        },
    });

    const updateListMutation = useMutation({
        mutationFn: async (data: FormValues) => {
            if (!user) throw new Error("User not authenticated");

            const response = await apiRequest("PUT", `/api/lists/${list.id}`, data);
            return await response.json();
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["/api/lists"] });
            queryClient.invalidateQueries({ queryKey: [`/api/lists/${list.id}`] });
            toast({
                title: "הרשימה עודכנה",
                description: "הרשימה נשמרה בהצלחה",
            });
            form.reset(data);
            onClose();
        },
        onError: (error: Error) => {
            toast({
                title: "שגיאה בעדכון הרשימה",
                description: error.message,
                variant: "destructive",
            });
        },
    });


    const onSubmit = (data: FormValues) => {
        updateListMutation.mutate(data);
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
                                disabled={updateListMutation.isPending}
                            >
                                {updateListMutation.isPending ? "יוצר רשימה..." : "צור רשימה"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
