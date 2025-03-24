
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

const colors = [
  "bg-red-500",
  "bg-blue-500",
  "bg-green-500",
  "bg-yellow-500",
  "bg-purple-500",
  "bg-pink-500",
];

export function ColorPicker({ selectedColor, onColorChange }: { 
  selectedColor: string;
  onColorChange: (color: string) => void;
}) {
  return (
    <div className="flex gap-2 my-4">
      {colors.map((color) => (
        <button
          key={color}
          className={cn(
            color,
            "w-8 h-8 rounded-full relative",
            "hover:ring-2 ring-offset-2 ring-offset-background ring-primary transition-all"
          )}
          onClick={() => onColorChange(color)}
        >
          {selectedColor === color && (
            <Check className="absolute inset-0 m-auto text-white w-4 h-4" />
          )}
        </button>
      ))}
    </div>
  );
}
