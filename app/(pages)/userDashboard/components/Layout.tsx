"use client";

import React, { useState } from "react";

import { Sidebar } from "./Sidebar";

import { Header } from "./Header";

import { User } from "@supabase/supabase-js";

interface UserInfoProps {
  user: User | null;
}
export function Layout({ children }: { children: React.ReactNode }) {
  const [activeItem, setActiveItem] = useState("Dashboard");
  const [user, setUser] = useState<User | null>(null); // stores the authenticated user fetched from supabase ; null - wala pa logged in from the start

  return (
    <div className="flex min-h-screen flex-col">
      <Header user={user} />
      <div className="flex-1 flex">
        <Sidebar activeItem={activeItem} setActiveItem={setActiveItem} />
        {/* <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Button
            variant="outline"
            size="icon"
            className="mb-4 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-4 w-4" />
          </Button>
          {children}
          
        </main> */}
      </div>
    </div>
  );
}
