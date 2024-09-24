import { useState } from "react";
import { Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

type NotificationItem = {
  id: number;
  message: string;
  time: string;
};

export default function Notification() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    { id: 1, message: "New message from John", time: "5 min ago" },
    { id: 2, message: "You have a meeting at 3 PM", time: "1 hour ago" },
    { id: 3, message: "Your order has been shipped", time: "2 hours ago" },
    { id: 4, message: "Your order has been shipped", time: "2 hours ago" },
    { id: 5, message: "Your order has been shipped", time: "2 hours ago" },
  ]);

  const clearNotifications = () => {
    setNotifications([]);
  };

  const removeNotification = (id: number) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative bg-transparent border-0"
          aria-label={`${notifications.length} unread notifications`}
        >
          <Bell className="h-4 w-4" />
          {notifications.length > 0 && (
            <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-red-500 rounded-full">
              {notifications.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="end">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Notifications</h2>
          <Button variant="ghost" size="sm" onClick={clearNotifications}>
            Clear all
          </Button>
        </div>
        <ScrollArea className="h-[300px] pr-4">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className="flex justify-between mb-4 last:mb-0 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium">{notification.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {notification.time}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeNotification(notification.id)}
                  aria-label="Close notification"
                  className="text-gray-500 hover:text-red-500" // Red hover for close button
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">
              No new notifications
            </p>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
