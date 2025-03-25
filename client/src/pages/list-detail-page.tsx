import { useMemo, useState } from "react";
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
  Loader2,
  Plus
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
import { cn } from "@/lib/utils";
import EditListModal from "@/components/lists/edit-list-modal";

type FilterType = "all" | "pending" | "purchased";

export default function ListDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [filter, setFilter] = useState<FilterType>("all");
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const listId = parseInt(id || "0");
  const [sortBy, setSortBy] = useState<"id" | "name" | "category">("id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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

  const filteredItems = useMemo(() => {
    return items
      .filter(item => {
        if (filter === "all") return true;
        return item.status === filter;
      })
      .sort((a, b) => {
        const aVal = a[sortBy] ?? "";
        const bVal = b[sortBy] ?? "";
        return sortOrder === "asc"
          ? String(aVal).localeCompare(String(bVal))
          : String(bVal).localeCompare(String(aVal));
      });
  }, [items, filter, sortBy, sortOrder]);

  console.log("Items:", items);
  console.log("Filtered:", filteredItems);
  console.log("Filter:", filter);
  console.log("Sort:", sortBy, sortOrder);

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
      <main className="container max-w-4xl mx-auto py-6 px-4"> {/*This line was changed*/}
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
              <span
                style={{ backgroundColor: list.color }}
                className={cn("text-sm px-3 py-1 rounded-full bg-opacity-20 text-white")}
              >
                {list.datePlanned} {list.timePlanned}
              </span>
            )}
            <div className="flex flex-col space-y-4">
              {/* תצוגת בעל הרשימה */}
              <div className="flex items-center">
                <span className="text-gray-500 text-sm ml-2">בעלים:</span>
                <div className="mr-2">
                  {isLoadingList ? (
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  ) : (
                    <div
                      className={cn(
                        "h-8 w-8 rounded-full flex items-center justify-center ring-2 ring-white shadow-md",
                        list.ownerAvatarUrl ? "bg-transparent" : "bg-primary text-primary-foreground"
                      )}
                      title={list.ownerName || "בעלים"}
                    >
                      {list.ownerAvatarUrl ? (
                        <img
                          src={list.ownerAvatarUrl}
                          alt={list.ownerName}
                          className="h-full w-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-medium">
                          {list.ownerName?.charAt(0) || "O"}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                {/* שם בעל הרשימה */}
                {!isLoadingList && (
                  <span className="text-sm">
                    {list.ownerName || ""}
                    {list.ownerId === user?.id && " (אתה)"}
                  </span>
                )}
              </div>

              {/* תצוגת משתתפים */}
              <div className="flex items-center">
                <span className="text-gray-500 text-sm ml-2">משתתפים:</span>
                <div className="flex flex-wrap items-center gap-2">
                  {isLoadingParticipants ? (
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  ) : (
                    <>
                      {/* סינון משתתפים - להציג רק משתתפים שאינם המשתמש הנוכחי ואינם בעל הרשימה */}
                      {participants
                        .filter(participant => participant.id !== user?.id && participant.id !== list.ownerId)
                        .map((participant) => (
                          <div key={participant.id} className="flex items-center">
                            <div
                              className={cn(
                                "h-8 w-8 rounded-full flex items-center justify-center ring-2 ring-white shadow-md mr-1",
                                participant.avatarUrl ? "bg-transparent" : "bg-primary text-primary-foreground"
                              )}
                              title={participant.name}
                            >
                              {participant.avatarUrl ? (
                                <img
                                  src={participant.avatarUrl}
                                  alt={participant.name}
                                  className="h-full w-full rounded-full object-cover"
                                />
                              ) : (
                                <span className="text-sm font-medium">{participant.name.charAt(0)}</span>
                              )}
                            </div>
                            <span className="text-sm">{participant.name}</span>
                          </div>
                        ))}

                      {/* כפתור הוספת משתתפים - יוצג רק לבעל הרשימה */}
                      {isOwner && (
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-full shadow-sm"
                          onClick={() => setIsShareModalOpen(true)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      )}

                      {/* אם אין משתתפים אחרים, הצג הודעה */}
                      {participants.filter(participant =>
                        participant.id !== user?.id &&
                        participant.id !== list.ownerId
                      ).length === 0 && (
                          <span className="text-sm text-muted-foreground">אין משתתפים נוספים</span>
                        )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Add Item Form */}
        <ItemForm listId={listId} color={list.color} />

        {/* Filter Controls */}
        <div className="flex items-center justify-between mb-4 border-b border-border pb-4 !rtl:space-x-reverse">
          <div className="flex flex-wrap gap-2">
            {[
              { label: `הכל (${totalItems})`, value: "all" },
              { label: `לרכישה (${pendingItems})`, value: "pending" },
              { label: `נרכשו (${purchasedItems})`, value: "purchased" },
            ].map(({ label, value }) => (
              <Button
                key={value}
                variant={filter === value ? "default" : "outline"}
                size="sm"
                style={{
                  backgroundColor: filter === value ? list?.color : undefined,
                  color: filter === value ? "#fff" : undefined, // טקסט לבן כשהכפתור נבחר
                }}
                className={cn(
                  "rounded-full",
                  filter === value && "bg-opacity-90 text-opacity-100" // opacity מדויק עם Tailwind
                )}
                onClick={() => setFilter(value as FilterType)}
              >
                {label}
              </Button>
            ))}
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSortBy("name")}
            >
              מיון לפי שם
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSortBy("category")}
            >
              מיון לפי קטגוריה
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
              <ItemRow key={item.id} item={item} listId={listId} color={list.color} />
            ))
          )}
        </div>

        {/* List Settings */}
        <div className="border-t border-border pt-6">
          <h3 className="text-lg font-semibold mb-4">הגדרות רשימה</h3>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => setIsEditModalOpen(true)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => setIsShareModalOpen(true)}
              disabled={!isOwner}
            >
              <Share2 className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="justify-start text-red-500 hover:text-red-700 hover:bg-red-50"
              onClick={() => setIsDeleteDialogOpen(true)}
              disabled={!isOwner}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </main>
      <EditListModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        list={list}
      />
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