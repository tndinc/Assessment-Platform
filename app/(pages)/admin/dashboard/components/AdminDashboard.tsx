"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Menu,
  Package2,
  Users,
  BarChart,
  CheckSquare,
  BookOpen,
  Calendar,
  Clock,
  Home,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ModeToggle } from "@/components/ui/ModeToggle"
import Notification from "@/components/Notification"
import UserIcon from "@/app/(pages)/admin/dashboard/components/UserIcon"
import ManageCourse from "../dashboardSettings/ManageCourse"
import ManageExam from "../dashboardSettings/ManageExam"
import ManageProfiles from "../dashboardSettings/AcceptStudents"
import CheatingLogs from "../dashboardSettings/CheatingLogs"
import { StudentPerformance } from "../dashboardSettings/StudentPerformance"
import { StudentRanking } from "../dashboardSettings/StudentRanking"
import { CalendarView } from "../dashboardSettings/CalendarView"
import { TeacherDashboardContent } from "../dashboardSettings/TeacherDashboardContent"
import {
  fetchCourses,
  fetchExams,
  fetchProfiles,
  fetchStudentPerformanceData,
  fetchUpcomingExams,
} from "@/lib/supabase"

export const description = "A products dashboard with a sidebar navigation and a main content area."

export function AdminDashboard() {
  // State to track which component to display
  const [activeComponent, setActiveComponent] = useState("Dashboard")
  // Add sortOrder state from teacher dashboard
  const [sortOrder, setSortOrder] = useState("score-desc")

  // Add state for Supabase data
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [courses, setCourses] = useState([])
  const [exams, setExams] = useState([])
  const [profiles, setProfiles] = useState([])
  const [upcomingExams, setUpcomingExams] = useState([])
  const [lastUpdated, setLastUpdated] = useState(new Date())

  // Fetch data from Supabase
  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        console.log("Fetching data in AdminDashboard...")
        // Fetch student performance data
        const studentData = await fetchStudentPerformanceData()
        console.log("Fetched student data:", studentData)
        setStudents(studentData)

        // Fetch courses
        const courseData = await fetchCourses()
        console.log("Fetched course data:", courseData)
        setCourses(courseData)

        // Fetch exams
        const examData = await fetchExams()
        console.log("Fetched exam data:", examData)
        setExams(examData)

        // Fetch profiles
        const profileData = await fetchProfiles()
        console.log("Fetched profile data:", profileData)
        setProfiles(profileData)

        // Fetch upcoming exams
        const upcomingExamData = await fetchUpcomingExams()
        console.log("Fetched upcoming exam data:", upcomingExamData)
        setUpcomingExams(upcomingExamData)

        // Update last updated time
        setLastUpdated(new Date())
      } catch (error) {
        console.error("Error loading data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Function to handle component selection
  const renderComponent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading data...</p>
          </div>
        </div>
      )
    }

    switch (activeComponent) {
      case "Accept Students":
        return <ManageProfiles profiles={profiles} />
      case "Manage Course":
        return <ManageCourse courses={courses} />
      case "Manage Exam":
        return <ManageExam exams={exams} courses={courses} />
      case "Students":
        return <StudentPerformance sortOrder={sortOrder} setSortOrder={setSortOrder} students={students} />
      case "Students Cheating Logs":
        return <CheatingLogs />
      case "Student Ranking by Exam":
        return <StudentRanking exams={exams} />
      case "Calendar":
        return <CalendarView upcomingExams={upcomingExams} />
      case "Dashboard":
      default:
        return <TeacherDashboardContent sortOrder={sortOrder} setSortOrder={setSortOrder} students={students} />
    }
  }

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
                  activeComponent === "Dashboard" ? "bg-muted text-primary" : "text-muted-foreground hover:text-primary"
                }`}
              >
                <Home className="h-4 w-4" />
                Dashboard
              </Link>
              <Link
                href="#"
                onClick={() => setActiveComponent("Students")}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                  activeComponent === "Students" ? "bg-muted text-primary" : "text-muted-foreground hover:text-primary"
                }`}
              >
                <Users className="h-4 w-4" />
                Students
              </Link>
              <Link
                href="#"
                onClick={() => setActiveComponent("Calendar")}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                  activeComponent === "Calendar" ? "bg-muted text-primary" : "text-muted-foreground hover:text-primary"
                }`}
              >
                <Calendar className="h-4 w-4" />
                Events
              </Link>
              <Link
                href="#"
                onClick={() => setActiveComponent("Accept Students")}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                  activeComponent === "Accept Students"
                    ? "bg-muted text-primary"
                    : "text-muted-foreground hover:text-primary"
                }`}
              >
                <Users className="h-4 w-4" />
                Accept Students
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
                onClick={() => setActiveComponent("Students Cheating Logs")}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                  activeComponent === "Students Cheating Logs"
                    ? "bg-muted text-primary"
                    : "text-muted-foreground hover:text-primary"
                }`}
              >
                <Users className="h-4 w-4" />
                Students Cheating Logs
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
            </nav>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0 md:hidden">
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
                  <Home className="h-5 w-5" />
                  Dashboard
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
                  onClick={() => setActiveComponent("Calendar")}
                  className="flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                >
                  <Calendar className="h-5 w-5" />
                  Calendar
                </Link>
                <Link
                  href="#"
                  onClick={() => setActiveComponent("Accept Students")}
                  className="flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                >
                  <Users className="h-5 w-5" />
                  Accept Students
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
                  onClick={() => setActiveComponent("Students Cheating Logs")}
                  className="flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                >
                  <Users className="h-5 w-5" />
                  Students Cheating Logs
                </Link>
                <Link
                  href="#"
                  onClick={() => setActiveComponent("Student Ranking by Exam")}
                  className="flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                >
                  <BarChart className="h-5 w-5" />
                  Student Ranking by Exam
                </Link>
              </nav>
              <div className="mt-auto">
                <Card className="text-center">
                  <CardHeader>
                    <CardTitle>Follow Us</CardTitle>
                    <CardDescription>Stay connected with us on social media.</CardDescription>
                  </CardHeader>
                </Card>
              </div>
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">
            <form>

            </form>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="hidden md:flex" onClick={() => window.location.reload()}>
              <Clock className="mr-2 h-4 w-4" />
              Last updated: {lastUpdated.toLocaleString()}
            </Button>
          </div>
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
  )
}

