"use client";
import Link from "next/link";
import {
  LineChart,
  Menu,
  Package2,
  Users,
  BarChart,
  CheckSquare,
  MessageCircle,
  BookOpen,
  Instagram,
  Facebook,
  MessageSquare,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ModeToggle } from "@/components/ui/ModeToggle";
import { useState } from "react";
import Notification from "@/components/Notification";
import UserIcon from "@/app/(pages)/admin/dashboard/components/UserIcon";
import ManageCourse from "./dashboardSettings/ManageCourse";

export const description =
  "A products dashboard with a sidebar navigation and a main content area.";

export function AdminDashboard() {
  // State to track which component to display
  const [activeComponent, setActiveComponent] = useState("Dashboard");

  // Function to handle component selection
  const renderComponent = () => {
    switch (activeComponent) {
      case "Manage Course":
        return <ManageCourse />;
      case "Manage Exam":
        return <h1>Manage Exam</h1>;
      case "Students":
        return <h1>Students</h1>;
      case "Student Ranking by Exam":
        return <h1>Student Ranking by Exam</h1>;
      case "Examinee Result":
        return <h1>Examinee Result</h1>;
      case "Feedback":
        return <h1>Feedback</h1>;
      case "Dashboard":
      default:
        return <h1>Dashboard Overview</h1>;
    }
  };

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Package2 className="h-6 w-6" />
              <span>TND Incorporation</span>
            </Link>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              <Link
                href="#"
                onClick={() => setActiveComponent("Dashboard")}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                  activeComponent === "Dashboard"
                    ? "bg-muted text-primary"
                    : "text-muted-foreground hover:text-primary"
                }`}
              >
                <LineChart className="h-4 w-4" />
                Dashboard
              </Link>
              <Link
                href="#"
                onClick={() => setActiveComponent("Manage Course")}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                  activeComponent === "Manage Course"
                    ? "bg-muted text-primary"
                    : "text-muted-foreground hover:text-primary"
                }`}
              >
                <BookOpen className="h-4 w-4" />
                Manage Course
              </Link>
              <Link
                href="#"
                onClick={() => setActiveComponent("Manage Exam")}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                  activeComponent === "Manage Exam"
                    ? "bg-muted text-primary"
                    : "text-muted-foreground hover:text-primary"
                }`}
              >
                <CheckSquare className="h-4 w-4" />
                Manage Exam
              </Link>
              <Link
                href="#"
                onClick={() => setActiveComponent("Students")}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                  activeComponent === "Students"
                    ? "bg-muted text-primary"
                    : "text-muted-foreground hover:text-primary"
                }`}
              >
                <Users className="h-4 w-4" />
                Students
              </Link>
              <Link
                href="#"
                onClick={() => setActiveComponent("Student Ranking by Exam")}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                  activeComponent === "Student Ranking by Exam"
                    ? "bg-muted text-primary"
                    : "text-muted-foreground hover:text-primary"
                }`}
              >
                <BarChart className="h-4 w-4" />
                Student Ranking by Exam
              </Link>
              <Link
                href="#"
                onClick={() => setActiveComponent("Examinee Result")}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                  activeComponent === "Examinee Result"
                    ? "bg-muted text-primary"
                    : "text-muted-foreground hover:text-primary"
                }`}
              >
                <CheckSquare className="h-4 w-4" />
                Examinee Result
              </Link>
              <Link
                href="#"
                onClick={() => setActiveComponent("Feedback")}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                  activeComponent === "Feedback"
                    ? "bg-muted text-primary"
                    : "text-muted-foreground hover:text-primary"
                }`}
              >
                <MessageCircle className="h-4 w-4" />
                Feedback
              </Link>
            </nav>
          </div>
          <div className="mt-auto p-4">
            <Card className="text-center">
              <CardHeader>
                <CardTitle>Follow Us</CardTitle>
                <CardDescription>
                  Stay connected with us on social media.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex gap-4">
                <Button variant="ghost" asChild>
                  <Link href="https://www.instagram.com" target="_blank">
                    <Instagram className="h-6 w-6 text-muted-foreground hover:text-primary" />
                  </Link>
                </Button>
                <Button variant="ghost" asChild>
                  <Link href="https://www.facebook.com" target="_blank">
                    <Facebook className="h-6 w-6 text-muted-foreground hover:text-primary" />
                  </Link>
                </Button>
                <Button variant="ghost" asChild>
                  <Link href="https://discord.com" target="_blank">
                    <MessageSquare className="h-6 w-6 text-muted-foreground hover:text-primary" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
              <nav className="grid gap-2 text-lg font-medium">
                <Link
                  href="#"
                  onClick={() => setActiveComponent("Dashboard")}
                  className="flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                >
                  <LineChart className="h-5 w-5" />
                  Dashboard
                </Link>
                <Link
                  href="#"
                  onClick={() => setActiveComponent("Manage Course")}
                  className="flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                >
                  <BookOpen className="h-5 w-5" />
                  Manage Course
                </Link>
                <Link
                  href="#"
                  onClick={() => setActiveComponent("Manage Exam")}
                  className="flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                >
                  <CheckSquare className="h-5 w-5" />
                  Manage Exam
                </Link>
                <Link
                  href="#"
                  onClick={() => setActiveComponent("Students")}
                  className="flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                >
                  <Users className="h-5 w-5" />
                  Students
                </Link>
                <Link
                  href="#"
                  onClick={() => setActiveComponent("Student Ranking by Exam")}
                  className="flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                >
                  <BarChart className="h-5 w-5" />
                  Student Ranking by Exam
                </Link>
                <Link
                  href="#"
                  onClick={() => setActiveComponent("Examinee Result")}
                  className="flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                >
                  <CheckSquare className="h-5 w-5" />
                  Examinee Result
                </Link>
                <Link
                  href="#"
                  onClick={() => setActiveComponent("Feedback")}
                  className="flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                >
                  <MessageCircle className="h-5 w-5" />
                  Feedback
                </Link>
              </nav>
              <div className="mt-auto">
                <Card className="text-center">
                  <CardHeader>
                    <CardTitle>Follow Us</CardTitle>
                    <CardDescription>
                      Stay connected with us on social media.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex gap-4">
                    <Button variant="ghost" asChild>
                      <Link href="https://www.instagram.com" target="_blank">
                        <Instagram className="h-6 w-6 text-muted-foreground hover:text-primary" />
                      </Link>
                    </Button>
                    <Button variant="ghost" asChild>
                      <Link href="https://www.facebook.com" target="_blank">
                        <Facebook className="h-6 w-6 text-muted-foreground hover:text-primary" />
                      </Link>
                    </Button>
                    <Button variant="ghost" asChild>
                      <Link href="https://discord.com" target="_blank">
                        <MessageSquare className="h-6 w-6 text-muted-foreground hover:text-primary" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1"></div>

          <Notification />
          <ModeToggle />
          <UserIcon />
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          {/* Render the selected component */}
          {renderComponent()}
        </main>
      </div>
    </div>
  );
}
