import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Overview } from "./overview";
import { RecentActivity } from "./recent-activity";
import { UpcomingExams } from "./upcoming-exam";
import { BookOpen, GraduationCap, CheckSquare, Clock } from "lucide-react";

export function DashboardContent() {
  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Your Dashboard</h1>
        <p className="text-muted-foreground">
          Here's an overview of your academic progress and upcoming tasks. Stay
          focused and keep up the great work!
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: "Total Courses",
            value: "6",
            change: "+2 from last semester",
            icon: BookOpen,
            description: "You're enrolled in 6 courses this semester.",
          },
          {
            title: "Average Grade",
            value: "85.6%",
            change: "+2.1% from last semester",
            icon: GraduationCap,
            description: "Great job! Your grades are improving.",
          },
          {
            title: "Completed Assignments",
            value: "28/30",
            change: "2 assignments remaining",
            icon: CheckSquare,
            description: "Almost there! Don't forget the last two.",
          },
          {
            title: "Study Hours",
            value: "32.5h",
            change: "+5.2h from last week",
            icon: Clock,
            description: "Your dedication is paying off!",
          },
        ].map((item, index) => (
          <Card
            key={index}
            className="bg-[#E5E1DA] dark:bg-[#27374D] transition-all hover:shadow-md "
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm text-[#74512D] dark:text-[#67C6E3] font-medium">
                {item.title}
              </CardTitle>
              <item.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{item.value}</div>
              <p className="text-xs text-muted-foreground">{item.change}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {item.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-full lg:col-span-4 bg-[#E5E1DA] dark:bg-[#27374D] transition-all hover:shadow-md ">
          <CardHeader>
            <CardTitle className="text-[#74512D] dark:text-[#67C6E3]">Grade Overview</CardTitle>
            <CardDescription>
              Track your performance across all courses. The chart shows your
              grades over time.
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <Overview />
          </CardContent>
        </Card>
        <Card className="col-span-full md:col-span-1 lg:col-span-3 bg-[#E5E1DA] dark:bg-[#27374D] transition-all hover:shadow-md">
          <CardHeader>
            <CardTitle className="text-[#74512D] dark:text-[#67C6E3]">Upcoming Exams</CardTitle>
            <CardDescription>
              Stay prepared for your next challenges. Click on an exam to see
              more details or start a practice test.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UpcomingExams />
          </CardContent>
        </Card>
        <Card className="col-span-full bg-[#E5E1DA] dark:bg-[#27374D] transition-all hover:shadow-md">
          <CardHeader>
            <CardTitle className="text-[#74512D] dark:text-[#67C6E3]">Recent Activity</CardTitle>
            <CardDescription>
              Keep track of your latest academic activities. This includes
              recently submitted assignments, attended classes, and study
              sessions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RecentActivity />
          </CardContent>
        </Card>
      </div>

      <div className="text-center text-sm text-muted-foreground">
        <p>
          Need help? Contact your academic advisor or visit the student support
          center.
        </p>
        <p>
          Remember: Your education is an investment in yourself. Make every
          moment count!
        </p>
      </div>
    </div>
  );
}
