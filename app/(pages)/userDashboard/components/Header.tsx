import { Bell, Moon, Sun, User as UserIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const supabase = createClient();

export function Header() {
  const { setTheme, theme } = useTheme();
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();
        if (error) {
          console.error("Error fetching user:", error.message);
        }
        setUser(user);
      } catch (error) {
        console.error("Unexpected error fetching user:", error);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      console.log("User signed out successfully");
      // Redirect user to login or homepage after logout
      window.location.href = "/";
    } catch (error) {
      console.error("Error during sign out:");
    }
  };

  // Extract user profile info
  const userName = user?.user_metadata?.full_name || "User";
  const profilePicture = user?.user_metadata?.avatar_url || "";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <a href="/" className="text-lg font-bold text-gray-800">
            Logo
          </a>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notifications</span>
          </Button>

          {/* User Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-10 w-10 rounded-full p-0"
              >
                {profilePicture ? (
                  <img
                    src={profilePicture}
                    alt="User Avatar"
                    className="h-10 w-10 rounded-full"
                  />
                ) : (
                  <UserIcon className="h-10 w-10 text-gray-600" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="px-4 py-3">
                <p className="text-sm font-medium text-gray-700">{userName}</p>
                <p className="text-xs text-gray-500">
                  {user?.email || "Email not available"}
                </p>
              </div>
              <DropdownMenuItem>
                <UserIcon className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                <UserIcon className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
