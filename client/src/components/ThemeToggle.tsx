
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Toggle } from "@/components/ui/toggle";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains("dark");
    setIsDark(isDarkMode);
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <Toggle
      pressed={isDark}
      onPressedChange={toggleTheme}
      aria-label="Toggle theme"
      className="p-2"
    >
      {isDark ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
    </Toggle>
  );
}
