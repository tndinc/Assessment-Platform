"use client";

import { useEffect, useState } from "react";
import supabase from "@/components/supabase";
import { User } from "@supabase/supabase-js";


import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MainNav } from "./components/main-nav"
import { UserNav } from "./components/user-nav"
import { ModeToggle } from "./components/mode-toggle"
import { SidebarNav } from "./components/sidebar-nav"
import { BookOpen, Calendar, GraduationCap, Settings } from 'lucide-react'

const sidebarNavItems = [
  {
    title: "Classes",
    href: "/dashboard",
    icon: <BookOpen className="h-4 w-4" />,
  },
  {
    title: "Schedule",
    href: "/dashboard/schedule",
    icon: <Calendar className="h-4 w-4" />,
  },
  {
    title: "Students",
    href: "/dashboard/students",
    icon: <GraduationCap className="h-4 w-4" />,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: <Settings className="h-4 w-4" />,
  },
]

const AdminDashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();
        console.log("Fetched user:", user);  

        if (error) {
          console.error("Error fetching user:", error.message);
          setFetchError("Error fetching user");
        }

        setUser(user); 
      } catch (error) {
        setFetchError("Error fetching user");
        console.error("Unexpected error fetching user:", error); 
      }
    };

    fetchUser();
  }, []);

  return (
  <div className="min-h-screen bg-creamLight dark:bg-newDarkBlue">
    <div className="border-b">
      <div className="flex h-16 items-center px-4 bg-navbarLight dark:bg-newDarkGreen">
        <MainNav />
      </div>
    </div>
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0 ">
        <aside className="lg:w-1/5 ">
          <SidebarNav items={sidebarNavItems} />
        </aside>

        <div className="flex-1 lg:max-w-4xl">
          
          <Tabs defaultValue="overview" className="mt-8">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Add your dashboard content here */}
                <div className="rounded-lg border p-4">
                  <h3 className="font-semibold">Total Students</h3>
                  <p className="text-2xl font-bold">150</p>
                </div>
                <div className="rounded-lg border p-4">
                  <h3 className="font-semibold">Active Classes</h3>
                  <p className="text-2xl font-bold">8</p>
                </div>
                <div className="rounded-lg border p-4">
                  <h3 className="font-semibold">Average Attendance</h3>
                  <p className="text-2xl font-bold">92%</p>
                </div>
                <div className="rounded-lg border p-4">
                  <h3 className="font-semibold">Upcoming Events</h3>
                  <p className="text-2xl font-bold">3</p>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="analytics" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Add your analytics content here */}
                <div className="rounded-lg border p-4">
                  <h3 className="font-semibold">Performance</h3>
                  <p className="text-2xl font-bold">85%</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

      </div>
    </div>
  </div>
  );
};

export default AdminDashboard;