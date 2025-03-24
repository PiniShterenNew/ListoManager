import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ShoppingList, ListItem, User } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { log } from "server/vite";
import { hexToRGBA } from "../utils/hexToRGBA";

interface ListCardProps {
  list: ShoppingList;
}

export default function ListCard({ list }: ListCardProps) {
  const [, setLocation] = useLocation();

  const { data: items = [], isLoading: isLoadingItems } = useQuery<ListItem[]>({
    queryKey: [`/api/lists/${list.id}/items`],
  });

  const { data: participants = [], isLoading: isLoadingParticipants } = useQuery<User[]>({
    queryKey: [`/api/lists/${list.id}/participants`],
  });

  const totalItems = items.length;
  const completedItems = items.filter(item => item.status === "purchased").length;
  const formattedDate = list.datePlanned || "";

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
          {/* נקודת הצבע של הרשימה */}
          <span style={{ backgroundColor: list.color }} className={"inline-block w-2 h-2 rounded-full"} />
          {list.name}
        </h3>

        {formattedDate && (
          <span className={"text-xs px-2.5 py-1 rounded-full whitespace-nowrap font-medium"} style={{ backgroundColor: hexToRGBA(list.color, 0.1) }}>
            {formattedDate}
          </span>
        )}
      </div>

      {list.description && (
        <p className="text-muted-foreground mb-4 text-sm line-clamp-2">{list.description}</p>
      )}

      {!isLoadingItems && totalItems > 0 && (
        <div className="w-full bg-muted rounded-full h-3 mb-4 overflow-hidden">
          <div
            className={"h-3 rounded-full transition-all duration-500 ease-out"}
            style={{ width: `${(completedItems / totalItems) * 100}%`, backgroundColor: list.color }}
          >
            {completedItems === totalItems && (
              <div className="h-full w-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMCAwaDUwdjVIMHoiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4yKSIgZmlsbC1ydWxlPSJldmVub2RkIi8+PC9zdmc+')] bg-repeat-x animate-[flow_1s_linear_infinite]" />
            )}
          </div>
        </div>
      )}

      <div className="flex flex-wrap justify-between items-center gap-3">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {isLoadingItems ? (
            <Skeleton className="h-5 w-24" />
          ) : (
            <>
              <div className={"quantity-badge text-black"} style={{ backgroundColor: hexToRGBA(list.color, 0.1) }}>
                {totalItems} <span className="ms-1 text-muted-foreground/80">פריטים</span>
              </div>

              <div className={"quantity-badge text-black"} style={{ backgroundColor: hexToRGBA(list.color, 0.1) }}>
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
                className={cn(
                  "inline-block h-7 w-7 rounded-full border-2 border-white flex items-center justify-center text-xs font-medium shadow-sm",
                  index === 0 ? "bg-primary/20 text-primary" : "bg-primary/10 text-primary/80"
                )}
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
