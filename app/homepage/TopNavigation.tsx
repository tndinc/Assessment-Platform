"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, Home, Users, Phone } from "lucide-react";
import { useTheme } from "next-themes";
import { ModeToggle } from "@/components/ui/ModeToggle";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

import LoginModal from "./components/LoginModal";
import Image from "next/image";

export default function TopNavigation() {
  const [isOpen, setIsOpen] = React.useState(false);
  const { setTheme } = useTheme();

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "About Us", href: "/about", icon: Users },
    { name: "Contact Us", href: "/contact", icon: Phone },
  ];

  return (
    <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <div className="container flex h-16 items-center justify-between space-x-4 sm:space-x-0">
        <div className="flex items-center space-x-4">
          <Link href="/">
            <Image
              src="/TND.png"
              alt="TND Logo"
              width={50}
              height={50}
              className="cursor-pointer"
            />
          </Link>
        </div>
        <nav className="hidden md:flex space-x-4">
          {navItems.map((item) => (
            <Button key={item.name} variant="ghost" asChild>
              <Link href={item.href} className="flex items-center">
                {item.name}
              </Link>
            </Button>
          ))}
        </nav>
        <div className="flex items-center space-x-4">
          <ModeToggle />
          <LoginModal />
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col space-y-4">
                {navItems.map((item) => (
                  <Button
                    key={item.name}
                    variant="ghost"
                    asChild
                    onClick={() => setIsOpen(false)}
                  >
                    <Link href={item.href} className="flex items-center">
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.name}
                    </Link>
                  </Button>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
