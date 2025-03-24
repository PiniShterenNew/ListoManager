import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

const colors = [
  "#ef4444", // red-500
  "#3b82f6", // blue-500
  "#22c55e", // green-500
  "#eab308", // yellow-500
  "#a855f7", // purple-500
  "#ec4899", // pink-500
];

export function ColorPicker({ selectedColor, onColorChange }: {
  selectedColor: string;
  onColorChange: (color: string) => void;
}) {
  return (
    <div className="flex gap-2 my-4">
      {colors.map((color) => (
        <button
          type="button"
          key={color}
          style={{ backgroundColor: color }}
          className={cn(
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