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
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Your Dashboard</h1>
        <p className="text-muted-foreground">
          Here's an overview of your academic progress and upcoming tasks. Stay
          focused and keep up the great work!
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item, index) => (
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
            <CardTitle className="text-[#74512D] dark:text-[#67C6E3]">
              Grade Overview
            </CardTitle>
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
            <CardTitle className="text-[#74512D] dark:text-[#67C6E3]">
              Upcoming Exams
            </CardTitle>
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
            <CardTitle className="text-[#74512D] dark:text-[#67C6E3]">
              Recent Activity
            </CardTitle>
            <CardDescription>
              Keep track of your latest academic activities.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RecentActivity />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
