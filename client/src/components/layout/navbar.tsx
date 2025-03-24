import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Plus, Menu } from "lucide-react";

export default function NavBar() {
  const [, setLocation] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span 
                className="text-2xl font-bold text-primary cursor-pointer"
                onClick={() => setLocation("/")}
              >
                Listo
              </span>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8 sm:space-x-reverse">
              <Button 
                variant="link" 
                onClick={() => setLocation("/")} 
                className="text-foreground"
              >
                הרשימות שלי
              </Button>
            </div>
          </div>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Button 
                onClick={() => setLocation("/")}
                className="relative inline-flex items-center"
              >
                <Plus className="ml-1.5 h-5 w-5" />
                רשימה חדשה
              </Button>
            </div>
            <div className="hidden sm:ml-4 sm:flex sm:items-center">
              <div className="relative ml-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative rounded-full p-0 h-8 w-8">
                      {user?.avatarUrl ? (
                        <img
                          className="h-8 w-8 rounded-full object-cover"
                          src={user.avatarUrl}
                          alt={user.name}
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                          {user?.name.charAt(0)}
                        </div>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setLocation("/profile")}>
                      הפרופיל שלי
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      התנתק
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <div className="-mr-2 flex items-center sm:hidden">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleMobileMenu}
              >
                <Menu className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="sm:hidden">
          <div className="space-y-1 pb-3 pt-2">
            <Button 
              variant="ghost" 
              className="block w-full text-right pr-3 pl-4 py-2"
              onClick={() => {
                setLocation("/");
                setIsMobileMenuOpen(false);
              }}
            >
              הרשימות שלי
            </Button>
          </div>
          <div className="border-t border-gray-200 pb-3 pt-4">
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                {user?.avatarUrl ? (
                  <img
                    className="h-10 w-10 rounded-full object-cover"
                    src={user.avatarUrl}
                    alt={user.name}
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-lg">
                    {user?.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="mr-3">
                <div className="text-base font-medium text-foreground">{user?.name}</div>
                <div className="text-sm font-medium text-muted-foreground">{user?.email}</div>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <Button 
                variant="ghost" 
                className="block w-full text-right px-4 py-2"
                onClick={() => {
                  setLocation("/profile");
                  setIsMobileMenuOpen(false);
                }}
              >
                הפרופיל שלי
              </Button>
              <Button 
                variant="ghost" 
                className="block w-full text-right px-4 py-2"
                onClick={handleLogout}
              >
                התנתק
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
