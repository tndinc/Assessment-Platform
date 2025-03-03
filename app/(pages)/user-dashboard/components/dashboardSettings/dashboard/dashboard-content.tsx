"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
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
import {
  BookOpen,
  GraduationCap,
  CheckSquare,
  ClipboardList,
} from "lucide-react";
import { ExamMetrics, ProgrammingSkillsOverview } from "./ProgrammingSkills";
import { SkillsMetricsBreakdown } from "./SkillsMetrics";

const supabase = createClient();

export function DashboardContent() {
  const [userId, setUserId] = useState<string | null>(null);
  const [totalCourses, setTotalCourses] = useState<number>(0);
  const [averageGrade, setAverageGrade] = useState<number>(0);
  const [examPending, setExamPending] = useState<number>(0);
  const [examsTaken, setExamsTaken] = useState<number>(0);

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) return;
      setUserId(data.user.id);
    };

    fetchUser();
  }, []);

  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      try {
        // Fetch total courses
        const { data: coursesData } = await supabase
          .from("exam_tbl")
          .select("course_id", { count: "exact", distinct: true })
          .eq("status", "open");

        setTotalCourses(coursesData?.length || 0);

        // Fetch average grade
        const { data: feedbackData } = await supabase
          .from("student_feedback")
          .select("total_score, max_score")
          .eq("user_id", userId);

        if (feedbackData?.length > 0) {
          const totalScores = feedbackData.reduce(
            (sum, f) => sum + f.total_score,
            0
          );
          const maxScores = feedbackData.reduce(
            (sum, f) => sum + f.max_score,
            0
          );
          setAverageGrade(maxScores ? (totalScores / maxScores) * 100 : 0);
        }

        // Fetch exam pending (exams not yet taken by the user)
        const { data: pendingExams } = await supabase
          .from("exam_tbl")
          .select("exam_id")
          .eq("status", "open")
          .not(
            "exam_id",
            "in",
            `(${
              (
                await supabase
                  .from("exam_submissions")
                  .select("exam_id")
                  .eq("user_id", userId)
              ).data
                ?.map((exam) => exam.exam_id)
                .join(",") || "0"
            })`
          );

        setExamPending(pendingExams?.length || 0);

        // Fetch exams taken
        const { data: examsData } = await supabase
          .from("exam_submissions")
          .select("exam_id", { count: "exact", distinct: true })
          .eq("user_id", userId);

        setExamsTaken(examsData?.length || 0);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchData();
  }, [userId]);

  const stats = [
    {
      title: "Total Exam/s",
      value: totalCourses.toString(),
      change: "Updated dynamically",
      icon: BookOpen,
      description: `You have a total of ${totalCourses} exams.`,
    },
    {
      title: "Average Grade",
      value: `${averageGrade.toFixed(2)}%`,
      change: "Updated dynamically",
      icon: GraduationCap,
      description: "Your overall academic performance.",
    },
    {
      title: "Exam Pending",
      value: `${examPending}`,
      change: "Updated dynamically",
      icon: CheckSquare,
      description: "Total number of exams pending submission.",
    },
    {
      title: "Exams Taken",
      value: `${examsTaken}`,
      change: "Updated dynamically",
      icon: ClipboardList,
      description: "Total exams you have attempted.",
    },
  ];

  return (
    <div className="space-y-6 p-2 sm:p-4 lg:p-6">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Your Dashboard
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Here's an overview of your academic progress and upcoming tasks. Stay
          focused and keep up the great work!
        </p>
      </div>

      {/* Stats cards - Full width on mobile, 2 per row on tablets, 4 per row on desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
        {stats.map((item, index) => (
          <Card
            key={index}
            className="bg-[#E5E1DA] dark:bg-[#27374D] transition-all hover:shadow-md w-full"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 px-3 sm:px-4 pt-3 sm:pt-4">
              <CardTitle className="text-xs sm:text-sm text-[#74512D] dark:text-[#67C6E3] font-medium">
                {item.title}
              </CardTitle>
              <item.icon className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4">
              <div className="text-xl sm:text-2xl font-bold">{item.value}</div>
              <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-muted-foreground">
                {item.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      {/* Grade Overview - Full width */}
      <Card className="w-full bg-[#E5E1DA] dark:bg-[#27374D] transition-all hover:shadow-md">
        <CardHeader className="px-3 sm:px-4 pt-3 sm:pt-4 pb-1 sm:pb-2">
          <CardTitle className="text-sm sm:text-base lg:text-lg text-[#74512D] dark:text-[#67C6E3]">
            Grade Overview
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Track your performance across all courses. The chart shows your
            grades over time.
          </CardDescription>
        </CardHeader>
        <CardContent className="pl-0 sm:pl-2 px-2 sm:px-3 pb-3 sm:pb-4">
          <Overview />
        </CardContent>
      </Card>
      {/* Main content cards - Fully responsive layout with proper stacking */}
      <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:gap-6">
        {/* First row on larger screens */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
          {/* Programming Skills */}
          <Card className="w-full bg-[#E5E1DA] dark:bg-[#27374D] transition-all hover:shadow-md">
            <CardHeader className="px-3 sm:px-4 pt-3 sm:pt-4 pb-1 sm:pb-2">
              <CardTitle className="text-sm sm:text-base lg:text-lg text-[#74512D] dark:text-[#67C6E3]">
                Programming Skills
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Stay prepared for your next challenges. Click on an exam to see
                more details or start a practice test.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4">
              <ProgrammingSkillsOverview />
            </CardContent>
          </Card>

          {/* Skills Metrics */}
          <Card className="w-full bg-[#E5E1DA] dark:bg-[#27374D] transition-all hover:shadow-md">
            <CardHeader className="px-3 sm:px-4 pt-3 sm:pt-4 pb-1 sm:pb-2">
              <CardTitle className="text-sm sm:text-base lg:text-lg text-[#74512D] dark:text-[#67C6E3]">
                Skills Metrics
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Stay prepared for your next challenges. Click on an exam to see
                more details or start a practice test.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4">
              <SkillsMetricsBreakdown />
            </CardContent>
          </Card>
        </div>

        {/* Last row on larger screens */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
          {/* Upcoming Exams */}
          <Card className="w-full bg-[#E5E1DA] dark:bg-[#27374D] transition-all hover:shadow-md">
            <CardHeader className="px-3 sm:px-4 pt-3 sm:pt-4 pb-1 sm:pb-2">
              <CardTitle className="text-sm sm:text-base lg:text-lg text-[#74512D] dark:text-[#67C6E3]">
                Upcoming Exams
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Stay prepared for your next challenges. Click on an exam to see
                more details or start a practice test.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4">
              <UpcomingExams />
            </CardContent>
          </Card>

          {/* Recent Activity - Full width on tablet down, half width on desktop */}
          <Card className="w-full md:col-span-1 bg-[#E5E1DA] dark:bg-[#27374D] transition-all hover:shadow-md">
            <CardHeader className="px-3 sm:px-4 pt-3 sm:pt-4 pb-1 sm:pb-2">
              <CardTitle className="text-sm sm:text-base lg:text-lg text-[#74512D] dark:text-[#67C6E3]">
                Recent Activity
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Keep track of your latest academic activities.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4">
              <RecentActivity />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
