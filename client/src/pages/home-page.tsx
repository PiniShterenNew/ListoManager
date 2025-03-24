import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ShoppingList } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import NavBar from "@/components/layout/navbar";
import ListCard from "@/components/lists/list-card";
import NewListModal from "@/components/lists/new-list-modal";
import { Button } from "@/components/ui/button";
import { Plus, ListIcon } from "lucide-react";
import { Loader2 } from "lucide-react";

export default function HomePage() {
  const { user } = useAuth();
  const [isNewListModalOpen, setIsNewListModalOpen] = useState(false);

  const { data: lists, isLoading, error } = useQuery<ShoppingList[]>({
    queryKey: ["/api/lists"],
    refetchOnWindowFocus: true,
  });

  const openNewListModal = () => setIsNewListModalOpen(true);
  const closeNewListModal = () => setIsNewListModalOpen(false);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <NavBar />
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">הרשימות שלי</h1>
          <div className="hidden md:block">
            <Button onClick={openNewListModal}>
              <Plus className="h-5 w-5 ml-1.5" />
              רשימה חדשה
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500">שגיאה בטעינת הרשימות. אנא נסה שוב.</p>
          </div>
        ) : lists && lists.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {lists.map((list) => (
              <ListCard key={list.id} list={list} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-primary/10 flex items-center justify-center rounded-full mb-4">
              <ListIcon className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-xl font-medium text-foreground">אין לך רשימות עדיין</h3>
            <p className="mt-1 text-sm text-muted-foreground">צור את הרשימה הראשונה שלך כדי להתחיל</p>
            <div className="mt-6">
              <Button onClick={openNewListModal}>
                <Plus className="h-5 w-5 ml-1.5" />
                רשימה חדשה
              </Button>
            </div>
          </div>
        )}
      </main>

      <NewListModal 
        isOpen={isNewListModalOpen}
        onClose={closeNewListModal}
      />
    </div>
  );
}
