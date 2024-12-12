import { LayoutDashboard, BookOpen, History, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import TakeExam from "./dashboardSettings/takeExams/page";
const supabase = createClient();

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  activeItem: string;
  setActiveItem: (item: string) => void;
}

const navItems = [
  { name: "Dashboard", icon: LayoutDashboard },
  { name: "Take Exam", icon: BookOpen },
  { name: "History", icon: History },
  { name: "Subject", icon: Layers },
];

export function Sidebar({
  open,
  onClose,
  activeItem,
  setActiveItem,
}: SidebarProps) {
  const [user, setUser] = useState<User | null>(null);

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
            onClick={() => setActiveItem(item.name)}
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
        return <h1>Dashboard</h1>;
      case "Take Exam":
        return <TakeExam />;
      default:
        return <div>Select an option from the sidebar</div>;
    }
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="bg-navbarLight/40 dark:bg-newDarkGreen/40 text-black dark:text-white">
        {sidebarContent}
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent side="left" className="w-[240px] sm:w-[300px] p-0">
          {sidebarContent}
        </SheetContent>
      </Sheet>

      {/* Content Section */}
      <div className="flex-1 p-4 bg-creamLight dark:bg-newDarkBlue">{renderContent()}</div>
    </>
  );
}
