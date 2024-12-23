"use client";

import {
  LayoutDashboard,
  BookOpen,
  History,
  Layers,
  Menu,
  User,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import TakeExam from "./dashboardSettings/takeExams/page";
import { DashboardContent } from "./dashboardSettings/dashboard/dashboard-content";
import { motion } from "framer-motion";

const supabase = createClient();

interface SidebarProps {
  activeItem: string;
  setActiveItem: (item: string) => void;
}

const navItems = [
  { name: "Dashboard", icon: LayoutDashboard },
  { name: "Take Exam", icon: BookOpen },
  { name: "History", icon: History },
  { name: "Subjects", icon: Layers },
];

export function Sidebar({ activeItem, setActiveItem }: SidebarProps) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();
        if (error) {
          console.error("Error fetching user:", error);
        }
        setUser(user);
      } catch (error) {
        console.error("Unexpected error fetching user:", error);
      }
    };

    fetchUser();
  }, []);

  const userName = user?.user_metadata?.full_name || "Student";
  const userEmail = user?.email || "student@example.com";
  const profilePicture = user?.user_metadata?.avatar_url || "";

  const sidebarContent = (
    <motion.div
      className="flex h-screen flex-col gap-6 p-6"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col items-center gap-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={profilePicture} alt={userName} />
          <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="text-center">
          <h2 className="text-xl font-semibold text-black dark:text-white">
            {userName}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {userEmail}
          </p>
        </div>
      </div>
      <nav className="flex flex-col gap-2">
        {navItems.map((item) => (
          <Button
            key={item.name}
            variant={activeItem === item.name ? "secondary" : "ghost"}
            className={`
              justify-start w-full text-left
              ${
                activeItem === item.name
                  ? "bg-[#B3C8CF] dark:bg-[#526D82]"
                  : "text-black dark:text-white"
              }
              hover:bg-[#89A8B2] dark:hover:text-white hover:text-black
              dark:hover:bg-[#526D82]/40
              transition-colors
            `}
            onClick={() => {
              setActiveItem(item.name);
              setIsMobileMenuOpen(false);
            }}
          >
            <item.icon className="mr-3 h-5 w-5" />
            {item.name}
          </Button>
        ))}
      </nav>
    </motion.div>
  );

  const renderContent = () => {
    switch (activeItem) {
      case "Dashboard":
        return <DashboardContent />;
      case "Take Exam":
        return <TakeExam />;
      default:
        return (
          <div className="flex items-center justify-center h-full">
            <p className="text-xl text-gray-500">
              Select an option from the sidebar
            </p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-full max-w-full overflow-x-hidden">
      {/* Desktop Sidebar */}
      <motion.div
        className="hidden border-r bg-[#ECEBDE/30] lg:block dark:bg-[#243642]/80 w-64 shadow-lg"
        initial={{ x: -100 }}
        animate={{ x: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {sidebarContent}
      </motion.div>

      {/* Mobile Menu Icon */}
      <Button
        variant="ghost"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setIsMobileMenuOpen(true)}
      >
        <Menu className="h-6 w-6" />
      </Button>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="w-[280px] p-0">
          {sidebarContent}
        </SheetContent>
      </Sheet>

      {/* Content Section */}
      <motion.div
        className="flex-1 p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {renderContent()}
      </motion.div>
    </div>
  );
}
