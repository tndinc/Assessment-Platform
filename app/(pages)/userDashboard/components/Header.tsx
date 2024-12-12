import { Bell, Moon, Sun, User as UserIcon } from 'lucide-react'
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface HeaderProps {
  user: { 
    email: string; 
    avatar_url?: string | null; // Optional avatar_url
  } | null;
}

export function Header({ user }: HeaderProps) {
  const { setTheme, theme } = useTheme()

  // Get the user's avatar URL if available
  const profilePicture = user?.avatar_url || ""  // Avatar URL or empty string if not set

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-navbarLight/40 dark:bg-newDarkGreen/40 backdrop-blur-sm">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex ml-5  ">
        <img
            src="/TND.png" // path to your logo image in the public folder
            alt="Your Brand"
            className="h-10 md:h-10" // adjust size of the logo
          />
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
        </div>
      </div>
    </header>
  )
}
