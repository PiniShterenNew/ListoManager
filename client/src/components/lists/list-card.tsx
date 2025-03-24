import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ShoppingList, ListItem, User } from "@shared/schema";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

interface ListCardProps {
  list: ShoppingList;
}

export default function ListCard({ list }: ListCardProps) {
  const [, setLocation] = useLocation();

  // Fetch items for the list to show counts
  const { data: items = [], isLoading: isLoadingItems } = useQuery<ListItem[]>({
    queryKey: [`/api/lists/${list.id}/items`],
  });

  // Fetch participants for the list
  const { data: participants = [], isLoading: isLoadingParticipants } = useQuery<User[]>({
    queryKey: [`/api/lists/${list.id}/participants`],
  });

  const totalItems = items.length;
  const completedItems = items.filter(item => item.status === "purchased").length;

  // Format date if available
  const formattedDate = list.datePlanned ? list.datePlanned : "";

  const handleClick = () => {
    setLocation(`/lists/${list.id}`);
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-5 cursor-pointer" 
      onClick={handleClick}
    >
      <div className="flex justify-between items-start">
        <h3 className="text-xl font-semibold mb-2">{list.name}</h3>
        {formattedDate && (
          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
            {formattedDate}
          </span>
        )}
      </div>
      {list.description && (
        <p className="text-gray-600 mb-4 text-sm line-clamp-2">{list.description}</p>
      )}
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          {isLoadingItems ? (
            <Skeleton className="h-4 w-20" />
          ) : (
            <>
              <span className="text-gray-500 text-sm">{totalItems} פריטים</span>
              <span className="mx-2 text-gray-300">|</span>
              <span className="text-gray-500 text-sm">{completedItems} הושלמו</span>
            </>
          )}
        </div>
        <div className="flex -space-x-1 space-x-reverse overflow-hidden">
          {isLoadingParticipants ? (
            <Skeleton className="h-6 w-12 rounded-full" />
          ) : (
            participants.map((participant, index) => (
              <div 
                key={participant.id}
                className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-secondary/40 flex items-center justify-center text-xs"
                title={participant.name}
              >
                {participant.name.charAt(0)}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
