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
<<<<<<< HEAD
    <header className="sticky top-0 z-50 w-full border-b bg-[#AEC2B6]/90 dark:bg-newDarkBlue/90 backdrop-blur-sm">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex ml-5  ">
        <img
            src="/TND.png" // path to your logo image in the public folder
            alt="Your Brand"
            className="h-10 md:h-10" // adjust size of the logo
          />
          <span className="mt-3 text-xl font-bold text-[#89A8B2] dark:text-[#89A8B2]">TND</span>
          </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none" />
          <nav className="flex items-center space-x-2">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
              <span className="sr-only">Notifications</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  {profilePicture ? (
                    <img
                      src={profilePicture}
                      alt="User Avatar"
                      className="h-8 w-8 rounded-full"
                    />
                  ) : (
                    <UserIcon className="h-8 w-8 text-gray-600" /> // Default icon if no avatar
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuItem>
                  <UserIcon className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <UserIcon className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
=======
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow dark:bg-gray-800 dark:border-gray-700">
      <div className="flex h-16 items-center justify-between px-4 w-full">
        <div className="flex items-center space-x-2 ml-12 lg:ml-0">
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
>>>>>>> ian2
        </div>
      </div>
    </header>
  );
}
