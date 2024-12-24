import { User as UserIcon } from "lucide-react";
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
import { ThemeToggle } from "@/components/theme-toggle";
import { HeaderNotifcations } from "@/components/headernotif";

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
    <header className="sticky top-0 z-50 w-full border-b bg-white/50 dark:bg-[#243642]/80 dark:border-gray-700">
      <div className="flex h-16 items-center justify-between px-4 w-full">
        <div className="flex items-center space-x-2 ml-12 lg:ml-0">
          <img
            src="/TND.png" // path to your logo image in the public folder
            alt="Your Brand"
            className="h-10 md:h-10" // adjust size of the logo
          />
          <span className="text-2xl font-bold text-primary tracking-tight">
            TND
          </span>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300 tracking-wide">
            INC.
          </span>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Notifications */}
          <HeaderNotifcations />

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
