import { LayoutDashboard, BookOpen, History, Layers, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import TakeExam from "./dashboardSettings/takeExams/page";
import { DashboardContent } from "./dashboardSettings/dashboard/dashboard-content";
const supabase = createClient();

interface SidebarProps {
  activeItem: string;
  setActiveItem: (item: string) => void;
}

const navItems = [
  { name: "Dashboard", icon: LayoutDashboard },
  { name: "Take Exam", icon: BookOpen },
  { name: "History", icon: History },
  { name: "Subject", icon: Layers },
];

export function Sidebar({ activeItem, setActiveItem }: SidebarProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();
        if (error) {
          console.error("Error fetching user:");
        }
        setUser(user);
      } catch (error) {
        console.error("Unexpected error fetching user:");
      }
    };

    fetchUser();
  }, []);

  // Extract user profile info
  const userName = user?.user_metadata?.full_name || "loading user data";
  const userEmail = user?.email;
  const profilePicture = user?.user_metadata?.avatar_url || "";

  const sidebarContent = (
    <div className="flex h-full flex-col gap-4 p-4">
      <div className="flex flex-col items-center gap-2">
        {profilePicture && (
          <img
            src={profilePicture}
            alt="User Avatar"
            className="w-15 h-15 rounded-full"
          />
        )}
        <div className="text-center text-black dark:text-white">
          <h2 className="text-lg font-semibold text-black dark:text-white">{userName}</h2>
          <p className="text-sm text-muted-foreground text-black dark:text-white">{userEmail}</p>
        </div>
      </div>
      <nav className="flex flex-col gap-2">
        {navItems.map((item) => (
          <Button
            key={item.name}
            variant={activeItem === item.name ? "secondary" : "ghost"}
            className="justify-start w-full"
            onClick={() => {
              setActiveItem(item.name);
              setIsMobileMenuOpen(false);
            }}
          >
            <item.icon className="mr-2 h-4 w-4" />
            {item.name}
          </Button>
        ))}
      </nav>
    </div>
  );

  const renderContent = () => {
    switch (activeItem) {
      case "Dashboard":
        return <DashboardContent />;
      case "Take Exam":
        return <TakeExam />;
      default:
        return <div>Select an option from the sidebar</div>;
    }
  };

  return (
    <div className="flex h-full max-w-full overflow-x-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden border-r bg-gray-100/40 lg:block dark:bg-gray-800/40 w-64">
        {sidebarContent}
      </div>

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
        <SheetContent side="left" className="w-[240px] sm:w-[300px] p-0">
          {sidebarContent}
        </SheetContent>
      </Sheet>

      {/* Content Section */}
      <div className="flex-1 p-4">{renderContent()}</div>
    </div>
  );
}
