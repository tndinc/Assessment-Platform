'use client'

import { Bell } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

export function HeaderNotifcations() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="w-8 h-8 md:w-10 md:h-10 relative bg-[#F1F0E8] hover:bg-[#E5E1DA] dark:bg-[#507687]/40 dark:hover:bg-[#507687]/10">
          <Bell className="h-5 w-5 " />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-600 " />
          <span className="sr-only">Toggle notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between p-4">
          <h2 className="text-lg font-semibold">Notifications</h2>
          <Button variant="ghost" size="sm">Mark all as read</Button>
        </div>
        <DropdownMenuItem>
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium">NOT YET DONE</p>
            <p className="text-xs text-muted-foreground">sddasdas</p>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium">NOT YET DONE</p>
            <p className="text-xs text-muted-foreground">jdbkfdas</p>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

