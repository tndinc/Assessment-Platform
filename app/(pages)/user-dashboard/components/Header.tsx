"use client";

import { useState, useEffect } from "react";
import { UserIcon, Settings, LogOut, ChevronDown } from "lucide-react";
import { useTheme } from "next-themes";
import { createClient } from "@/utils/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { HeaderNotifications } from "@/components/headernotif";
import { motion } from "framer-motion";

const supabase = createClient();

export function Header() {
  const { theme } = useTheme();
  const [user, setUser] = useState<any | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

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

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      window.location.href = "/";
    } catch (error) {
      console.error("Error during sign out:", error);
    }
  };

  const userName = user?.user_metadata?.full_name || "User";
  const profilePicture = user?.user_metadata?.avatar_url || "";

  return (
    <motion.header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? "bg-white/80 dark:bg-[#243642]/90 backdrop-blur-sm shadow-md"
          : "bg-white/50 dark:bg-[#243642]/80"
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="w-full px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Left Section */}
          <motion.div
            className="flex items-center space-x-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="hidden md:flex items-center space-x-2">
              <motion.img
                src="/TND.png"
                alt="TND Incorporations Logo"
                className="h-10 w-auto"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              />
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col"
              >
                <span className="text-2xl font-bold text-primary tracking-tight">
                  TND
                </span>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300 tracking-wide">
                  Incorporations
                </span>
              </motion.div>
            </div>
          </motion.div>

          {/* Right Section */}
          <motion.div
            className="flex items-center space-x-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <ThemeToggle />
            {/* <HeaderNotifications /> */}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 rounded-full p-0 pl-2 pr-4 flex items-center space-x-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                >
                  {profilePicture ? (
                    <img
                      src={profilePicture}
                      alt={`${userName}'s Avatar`}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <UserIcon className="h-8 w-8 text-gray-600 dark:text-gray-300" />
                  )}
                  <span className="hidden md:inline text-sm font-medium text-gray-700 dark:text-gray-200">
                    {userName}
                  </span>
                  <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center space-x-2 p-2">
                  <div className="flex-shrink-0">
                    {profilePicture ? (
                      <img
                        src={profilePicture}
                        alt={`${userName}'s Avatar`}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <UserIcon className="h-10 w-10 text-gray-600 dark:text-gray-300" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {userName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {user?.email || "Email not available"}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Account settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
}
