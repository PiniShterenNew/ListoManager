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
      className="card hover-lift glow-card border cursor-pointer" 
      onClick={handleClick}
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-primary" />
          {list.name}
        </h3>
        {formattedDate && (
          <span className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full whitespace-nowrap font-medium">
            {formattedDate}
          </span>
        )}
      </div>
      
      {list.description && (
        <p className="text-muted-foreground mb-4 text-sm line-clamp-2">{list.description}</p>
      )}
      
      {/* ProgressBar */}
      {!isLoadingItems && totalItems > 0 && (
        <div className="w-full bg-muted rounded-full h-3 mb-4 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-primary to-primary/80 h-3 rounded-full transition-all duration-500 ease-out" 
            style={{ width: `${(completedItems / totalItems) * 100}%` }}
          >
            {completedItems === totalItems && (
              <div className="h-full w-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMCAwaDUwdjVIMHoiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4yKSIgZmlsbC1ydWxlPSJldmVub2RkIi8+PC9zdmc+')] bg-repeat-x animate-[flow_1s_linear_infinite]" />
            )}
          </div>
        </div>
      )}
      
      <div className="flex flex-wrap justify-between items-center gap-y-3">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {isLoadingItems ? (
            <Skeleton className="h-5 w-24" />
          ) : (
            <>
              <div className="quantity-badge">
                {totalItems} <span className="ms-1 text-muted-foreground/80">פריטים</span>
              </div>
              
              <div className={`quantity-badge ${
                completedItems === totalItems && totalItems > 0 
                  ? "bg-green-100 text-green-700" 
                  : ""
              }`}>
                {completedItems} <span className="ms-1 text-muted-foreground/80">הושלמו</span>
              </div>
            </>
          )}
        </div>
        
        <div className="flex -space-x-2 space-x-reverse overflow-hidden ml-2">
          {isLoadingParticipants ? (
            <Skeleton className="h-7 w-14 rounded-full" />
          ) : participants.length > 0 ? (
            participants.map((participant, index) => (
              <div 
                key={participant.id}
                className={`inline-block h-7 w-7 rounded-full border-2 border-white 
                           ${index === 0 ? 'bg-primary/20 text-primary' : 'bg-primary/10 text-primary/80'} 
                           flex items-center justify-center text-xs font-medium shadow-sm`}
                title={participant.name}
              >
                {participant.avatarUrl ? (
                  <img 
                    src={participant.avatarUrl}
                    alt={participant.name}
                    className="h-full w-full object-cover rounded-full"
                  />
                ) : (
                  participant.name.charAt(0)
                )}
              </div>
            ))
          ) : (
            <div className="text-xs text-muted-foreground py-1.5 px-2 bg-muted/50 rounded-full">רק אתה</div>
          )}
        </div>
      </div>
    </div>
  );
}
