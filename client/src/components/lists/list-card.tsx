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
      className="card hover:border-primary/20 border border-transparent transition-all cursor-pointer" 
      onClick={handleClick}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg sm:text-xl font-semibold">{list.name}</h3>
        {formattedDate && (
          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full whitespace-nowrap font-medium">
            {formattedDate}
          </span>
        )}
      </div>
      
      {list.description && (
        <p className="text-gray-600 mb-4 text-sm line-clamp-2">{list.description}</p>
      )}
      
      {/* ProgressBar */}
      {!isLoadingItems && totalItems > 0 && (
        <div className="w-full bg-gray-100 rounded-full h-2.5 mb-4 overflow-hidden">
          <div 
            className="bg-primary h-2.5 rounded-full" 
            style={{ width: `${(completedItems / totalItems) * 100}%` }}
          ></div>
        </div>
      )}
      
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          {isLoadingItems ? (
            <Skeleton className="h-4 w-20" />
          ) : (
            <>
              <span className="text-gray-500 text-xs sm:text-sm font-medium">{totalItems} פריטים</span>
              <span className="mx-2 text-gray-300">|</span>
              <span className={`text-xs sm:text-sm font-medium ${
                completedItems === totalItems && totalItems > 0 
                  ? "text-green-600" 
                  : "text-gray-500"
              }`}>
                {completedItems} הושלמו
              </span>
            </>
          )}
        </div>
        
        <div className="flex -space-x-1 space-x-reverse overflow-hidden">
          {isLoadingParticipants ? (
            <Skeleton className="h-6 w-12 rounded-full" />
          ) : participants.length > 0 ? (
            participants.map((participant) => (
              <div 
                key={participant.id}
                className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-primary/15 flex items-center justify-center text-xs font-medium"
                title={participant.name}
              >
                {participant.name.charAt(0)}
              </div>
            ))
          ) : (
            <div className="text-xs text-gray-500 pt-1">רק אתה</div>
          )}
        </div>
      </div>
    </div>
  );
}
