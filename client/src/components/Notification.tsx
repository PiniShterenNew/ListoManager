
import { useEffect } from "react";
import { X } from "lucide-react";

export function Notification({ 
  message, 
  type = "info",
  onClose,
}: {
  message: string;
  type?: "success" | "error" | "info";
  onClose: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={cn(
      "notification",
      type === "success" && "border-green-500",
      type === "error" && "border-red-500",
      type === "info" && "border-blue-500"
    )}>
      <button onClick={onClose} className="absolute top-2 right-2">
        <X className="w-4 h-4" />
      </button>
      {message}
    </div>
  );
}
