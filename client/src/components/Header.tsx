import { ThemeToggle } from "@/components/ThemeToggle";
import { useState } from 'react';
import cn from 'classnames';
import { Button, Menu, Search } from "@radix-ui/react-icons";
import { Link } from "react-router-dom";

// Assuming UserNav component is defined elsewhere
const UserNav = () => <div>User Navigation</div>;


//  Assuming ColorPicker component is defined elsewhere
const ColorPicker = ({ selectedColor, onColorChange }) => (
  <div>
    {/* Replace with your actual color picker implementation */}
    <input type="color" value={selectedColor} onChange={(e) => onColorChange(e.target.value)} />
  </div>
);

const Header = () => {
  const [color, setColor] = useState("bg-primary");

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="flex items-center md:w-1/4">
          <Button variant="outline" size="icon" className="mr-4 px-0 text-base hover:bg-transparent hover:text-foreground md:hidden">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
          <Link to="/" className="flex items-center space-x-2">
            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", color)}>
              <span className="text-white font-bold">L</span>
            </div>
            <span className="hidden font-bold md:inline-block">Listo</span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-end space-x-4">
          <div className="hidden md:flex">
            <ColorPicker selectedColor={color} onColorChange={setColor} />
          </div>
          <div className="w-full max-w-[240px]">
            <Button variant="outline" className="w-full justify-start text-sm font-normal">
              <Search className="mr-2 h-4 w-4" />
              חיפוש...
            </Button>
          </div>
          <UserNav />
        </div>
      </div>
    </header>
  );
};

export default Header;