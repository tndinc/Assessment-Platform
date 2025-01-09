import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

export function Layout() {
  const [activeItem, setActiveItem] = useState("Dashboard");

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex-1 flex dark:bg-[#092635]">
        <Sidebar activeItem={activeItem} setActiveItem={setActiveItem} />
      </div>
    </div>
  );
}
