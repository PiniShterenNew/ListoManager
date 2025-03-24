import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { ShoppingList, ListItem, User } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import NavBar from "@/components/layout/navbar";
import ItemForm from "@/components/items/item-form";
import ItemRow from "@/components/items/item-row";
import ShareListModal from "@/components/lists/share-list-modal";
import { Button } from "@/components/ui/button";
import { 
  ChevronRight, 
  FilterIcon, 
  ArrowDownUp, 
  Edit, 
  Share2, 
  Trash2,
  Loader2
} from "lucide-react";
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

type FilterType = "all" | "pending" | "purchased";

export default function ListDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [filter, setFilter] = useState<FilterType>("all");
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const listId = parseInt(id);

  // Fetch list details
  const { data: list, isLoading: isLoadingList } = useQuery<ShoppingList>({
    queryKey: [`/api/lists/${listId}`],
    refetchOnWindowFocus: true,
  });

  // Fetch list items
  const { data: items = [], isLoading: isLoadingItems } = useQuery<ListItem[]>({
    queryKey: [`/api/lists/${listId}/items`],
    refetchOnWindowFocus: true,
  });

  // Fetch list participants
  const { data: participants = [], isLoading: isLoadingParticipants } = useQuery<User[]>({
    queryKey: [`/api/lists/${listId}/participants`],
    refetchOnWindowFocus: true,
  });

  // Delete list mutation
  const deleteListMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/lists/${listId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lists"] });
      toast({
        title: "רשימה נמחקה",
        description: "הרשימה נמחקה בהצלחה",
      });
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({
        title: "שגיאה במחיקת רשימה",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDeleteList = () => {
    deleteListMutation.mutate();
  };

  // Filter items based on the selected filter
  const filteredItems = items.filter(item => {
    if (filter === "all") return true;
    if (filter === "pending") return item.status === "pending";
    if (filter === "purchased") return item.status === "purchased";
    return true;
  });

  // Calculate item counts
  const totalItems = items.length;
  const purchasedItems = items.filter(item => item.status === "purchased").length;
  const pendingItems = totalItems - purchasedItems;

  const isOwner = list?.ownerId === user?.id;

  if (isLoadingList || isLoadingItems) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <NavBar />
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!list) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <NavBar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-bold">הרשימה לא נמצאה</h2>
            <Button 
              variant="link" 
              onClick={() => setLocation("/")}
              className="mt-4"
            >
              חזרה לרשימות
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <NavBar />
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <Button 
              variant="ghost" 
              onClick={() => setLocation("/")} 
              className="mr-2 p-2"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
            <h1 className="text-3xl font-bold">{list.name}</h1>
          </div>
          {list.description && (
            <p className="text-gray-600 mb-2">{list.description}</p>
          )}
          <div className="flex flex-wrap items-center gap-4">
            {list.datePlanned && (
              <span className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full">
                {list.datePlanned}
              </span>
            )}
            <div className="flex items-center">
              <span className="text-gray-500 text-sm">משתתפים:</span>
              <div className="flex -space-x-1 space-x-reverse overflow-hidden mr-2">
                {isLoadingParticipants ? (
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                ) : (
                  <>
                    <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center ring-2 ring-white">
                      {user?.name.charAt(0)}
                    </div>
                    {participants.map((participant) => (
                      <div 
                        key={participant.id} 
                        className="h-6 w-6 rounded-full bg-secondary/40 flex items-center justify-center ring-2 ring-white"
                        title={participant.name}
                      >
                        {participant.name.charAt(0)}
                      </div>
                    ))}
                    {isOwner && (
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-6 w-6 rounded-full p-0 ml-1" 
                        onClick={() => setIsShareModalOpen(true)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Add Item Form */}
        <ItemForm listId={listId} />

        {/* Filter Controls */}
        <div className="flex items-center justify-between mb-4 border-b border-border pb-4">
          <div className="flex flex-wrap gap-2">
            <Button 
              variant={filter === "all" ? "default" : "outline"}
              size="sm"
              className="rounded-full"
              onClick={() => setFilter("all")}
            >
              הכל ({totalItems})
            </Button>
            <Button 
              variant={filter === "pending" ? "default" : "outline"}
              size="sm"
              className="rounded-full"
              onClick={() => setFilter("pending")}
            >
              לרכישה ({pendingItems})
            </Button>
            <Button 
              variant={filter === "purchased" ? "default" : "outline"}
              size="sm"
              className="rounded-full"
              onClick={() => setFilter("purchased")}
            >
              נרכשו ({purchasedItems})
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" title="מיון">
              <ArrowDownUp className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" title="סינון">
              <FilterIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Items List */}
        <div className="space-y-3 mb-8">
          {filteredItems.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">אין פריטים להצגה. הוסף פריטים לרשימה.</p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <ItemRow key={item.id} item={item} listId={listId} />
            ))
          )}
        </div>

        {/* List Settings */}
        <div className="border-t border-border pt-6">
          <h3 className="text-lg font-semibold mb-4">הגדרות רשימה</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="justify-start">
              <Edit className="mr-2 h-4 w-4" />
              <span>ערוך רשימה</span>
            </Button>
            <Button 
              variant="outline" 
              className="justify-start"
              onClick={() => setIsShareModalOpen(true)}
              disabled={!isOwner}
            >
              <Share2 className="mr-2 h-4 w-4" />
              <span>שתף רשימה</span>
            </Button>
            <Button 
              variant="outline" 
              className="justify-start text-red-500 hover:text-red-700 hover:bg-red-50"
              onClick={() => setIsDeleteDialogOpen(true)}
              disabled={!isOwner}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              <span>מחק רשימה</span>
            </Button>
          </div>
        </div>
      </main>

      {/* Share List Modal */}
      <ShareListModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        listId={listId}
        participants={participants}
      />

      {/* Delete List Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>מחיקת רשימה</AlertDialogTitle>
            <AlertDialogDescription>
              האם אתה בטוח שברצונך למחוק את הרשימה? פעולה זו לא ניתנת לביטול.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ביטול</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteList}
              className="bg-red-500 hover:bg-red-600"
            >
              מחק
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
