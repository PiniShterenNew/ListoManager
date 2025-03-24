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
    <nav className="bg-white backdrop-blur-md bg-opacity-90 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <div
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => setLocation("/")}
              >
                <div className="bg-primary text-white w-8 h-8 rounded-md flex items-center justify-center">
                  <span className="text-xl font-bold">L</span>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  Listo
                </span>
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8 sm:space-x-reverse">
              <Button 
                variant="link" 
                onClick={() => setLocation("/")} 
                className="text-foreground font-medium"
              >
                הרשימות שלי
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex">
              <Button 
                onClick={() => setLocation("/")}
                className="mobile-friendly-button"
                size="sm"
              >
                <Plus className="ml-1.5 h-4 w-4" />
                רשימה חדשה
              </Button>
            </div>
            <div className="hidden sm:flex sm:items-center">
              <div className="relative ml-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="relative rounded-full p-0 h-9 w-9 border-2 hover:border-primary/50 overflow-hidden"
                    >
                      {user?.avatarUrl ? (
                        <img
                          className="h-full w-full object-cover"
                          src={user.avatarUrl}
                          alt={user.name}
                        />
                      ) : (
                        <div className="h-full w-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                          {user?.name.charAt(0)}
                        </div>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <div className="px-3 py-2 text-xs font-medium text-muted-foreground">
                      {user?.name}
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => setLocation("/profile")}
                      className="cursor-pointer"
                    >
                      הפרופיל שלי
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={handleLogout} 
                      className="cursor-pointer text-red-500 focus:text-red-500"
                    >
                      התנתק
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <div className="flex items-center sm:hidden">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleMobileMenu}
                className="rounded-full h-9 w-9"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="sm:hidden absolute top-16 left-0 right-0 bg-white shadow-lg z-50">
          <div className="space-y-1 p-3">
            <Button 
              variant="ghost" 
              className="block w-full text-right px-4 py-2 rounded-md min-h-[44px]"
              onClick={() => {
                setLocation("/");
                setIsMobileMenuOpen(false);
              }}
            >
              הרשימות שלי
            </Button>
          </div>
          <div className="border-t border-gray-100 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {user?.avatarUrl ? (
                  <img
                    className="h-10 w-10 rounded-full object-cover border-2 border-primary/20"
                    src={user.avatarUrl}
                    alt={user.name}
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-lg text-primary font-medium border-2 border-primary/20">
                    {user?.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="mr-3">
                <div className="text-base font-medium text-foreground">{user?.name}</div>
                <div className="text-sm text-muted-foreground truncate max-w-[200px]">{user?.email}</div>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <Button 
                variant="outline" 
                className="block w-full text-right px-4 py-2 rounded-md min-h-[44px]"
                onClick={() => {
                  setLocation("/profile");
                  setIsMobileMenuOpen(false);
                }}
              >
                הפרופיל שלי
              </Button>
              <Button 
                variant="outline" 
                className="block w-full text-right px-4 py-2 rounded-md text-red-500 hover:text-red-600 min-h-[44px]"
                onClick={handleLogout}
              >
                התנתק
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Bottom mobile navigation bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-4px_10px_rgba(0,0,0,0.05)] rounded-t-lg z-50 p-2 sm:hidden">
        <div className="flex justify-center">
          <Button 
            onClick={() => setLocation("/")}
            className="mobile-friendly-button w-full"
            size="sm"
          >
            <Plus className="ml-1.5 h-4 w-4" />
            רשימה חדשה
          </Button>
        </div>
      </div>
    </nav>
  );
}
