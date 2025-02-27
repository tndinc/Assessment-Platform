"use client";

import { useState } from "react";
import { Bell, BookOpen, Calendar, GraduationCap, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  type: "assignment" | "event" | "grade";
  read: boolean;
}

export function HeaderNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      title: "New Assignment Posted",
      description: "Mathematics: Linear Algebra Chapter 5 is now available",
      time: "5 minutes ago",
      type: "assignment",
      read: false,
    },
    {
      id: "2",
      title: "Upcoming Quiz",
      description: "Prepare for your Physics quiz scheduled for tomorrow",
      time: "1 hour ago",
      type: "event",
      read: false,
    },
    {
      id: "3",
      title: "Grade Released",
      description: "Your Chemistry lab report grade has been posted",
      time: "2 hours ago",
      type: "grade",
      read: false,
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const removeNotification = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "assignment":
        return <BookOpen className="h-4 w-4 text-blue-500" />;
      case "event":
        return <Calendar className="h-4 w-4 text-purple-500" />;
      case "grade":
        return <GraduationCap className="h-4 w-4 text-green-500" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="w-8 h-8 md:w-10 md:h-10 relative bg-[#FFFFFF] hover:bg-[#F5F5F5] dark:bg-[#6891A7] dark:hover:bg-[#7BA3BC] transition-colors duration-300"
        >
          <Bell className="h-5 w-5" />
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center"
              >
                {unreadCount}
              </motion.div>
            )}
          </AnimatePresence>
          <span className="sr-only">Toggle notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-[380px] bg-white dark:bg-[#243642] p-2 shadow-xl rounded-xl border-none"
      >
        <div className="flex items-center justify-between p-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            Notifications
          </h2>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Mark all as read
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        <div className="max-h-[400px] overflow-y-auto">
          <AnimatePresence>
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <DropdownMenuItem className="p-4 focus:bg-gray-50 dark:focus:bg-[#2F4456] rounded-lg mb-1">
                    <div className="flex items-start gap-3 w-full">
                      <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-[#507687]/40 flex items-center justify-center flex-shrink-0">
                        {getIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <p
                          className={`text-sm font-medium ${
                            notification.read
                              ? "text-gray-600 dark:text-gray-300"
                              : "text-gray-900 dark:text-white"
                          }`}
                        >
                          {notification.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {notification.description}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          {notification.time}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
                        onClick={(e) => {
                          e.preventDefault();
                          removeNotification(notification.id);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </DropdownMenuItem>
                </motion.div>
              ))
            ) : (
              <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                <p>No notifications</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
