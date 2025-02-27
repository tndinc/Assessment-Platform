"use client";
import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const supabase = createClient();

interface Exam {
  exam_id: string;
  course_id: string;
  exam_title: string;
  exam_desc: string;
  exam_time_limit: number;
  exam_points: number;
  exam_created_by: string;
  status: string;
  subject: string;
  deadline: string;
}

const ManageExams = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingExamId, setLoadingExamId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchExamsNotTakenByUser = async () => {
      try {
        // First, get the current user
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          console.error("No authenticated user found");
          setLoading(false);
          return;
        }

        // Get all exams
        const { data: allExams, error: examsError } = await supabase.from(
          "exam_tbl"
        ).select(`
            exam_id,
            course_id,
            exam_title,
            exam_desc,
            exam_time_limit,
            exam_points,
            exam_created_by,
            status,
            subject,
            deadline
          `);

        if (examsError) {
          console.error("Error fetching exams:", examsError);
          setLoading(false);
          return;
        }

        // Get submissions for the current user
        const { data: userSubmissions, error: submissionsError } =
          await supabase
            .from("exam_submissions")
            .select("exam_id")
            .eq("user_id", user.id);

        if (submissionsError) {
          console.error("Error fetching user submissions:", submissionsError);
          setLoading(false);
          return;
        }

        // Create a set of exam_ids that the user has already submitted
        const submittedExamIds = new Set(
          userSubmissions.map((submission) => submission.exam_id)
        );

        // Filter out exams that the user has already submitted
        const availableExams = allExams.filter(
          (exam) => !submittedExamIds.has(exam.exam_id)
        );

        setExams(availableExams);
      } catch (error) {
        console.error("Error in fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExamsNotTakenByUser();
  }, []);

  const handleTakeExam = (exam_id: string) => {
    setLoadingExamId(exam_id);
    setTimeout(() => {
      router.push(`/user-dashboard/exam/${exam_id}`);
    }, 500);
  };

  // Convert the ISO deadline to Philippine Time (PHT)
  const convertToPHT = (isoDate: string) => {
    const date = new Date(isoDate);
    const options: Intl.DateTimeFormatOptions = {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    };

    return new Intl.DateTimeFormat("en-PH", {
      ...options,
      timeZone: "Asia/Manila",
    }).format(date);
  };

  if (loading) return "Loading your exams...";

  return (
    <div className="grid gap-4 sm:gap-6 lg:gap-8 mt-10">
      {exams.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {exams.map((exam) => (
            <Card
              key={exam.exam_id}
              className="w-full bg-[#E5E1DA] dark:bg-[#27374D] shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              <CardHeader className="bg-[#D7D3BF] dark:bg-[#344C64] p-4">
                <CardTitle className="text-xl font-bold truncate text-[#74512D] dark:text-[#67C6E3]">
                  {exam.exam_title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                  {exam.exam_desc}
                </p>
                <div className="flex justify-between text-sm">
                  <span className="font-semibold text-[#1B9C85] dark:text-[#27E1C1]">
                    Points: {exam.exam_points}
                  </span>
                  <span className="font-semibold text-[#088395] dark:text-[#37B7C3]">
                    {exam.subject}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  By: {exam.exam_created_by}
                </p>
                <p className="text-sm font-medium text-[#A66E38] dark:text-[#D8F8B7]">
                  Due: {convertToPHT(exam.deadline)}
                </p>
              </CardContent>
              <CardFooter className="bg-[#D7D3BF] dark:bg-[#344C64] p-4">
                <Button
                  className="w-full py-2 bg-[#8E806A]/60 hover:bg-[#8E806A] dark:bg-[#577B8D]/50 dark:hover:bg-[#577B8D] text-gray-900 dark:text-white font-semibold transition-colors duration-300"
                  onClick={() => handleTakeExam(exam.exam_id)}
                  disabled={loadingExamId === exam.exam_id}
                >
                  {loadingExamId === exam.exam_id ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Loading...
                    </span>
                  ) : (
                    "Start Exam"
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center p-8">
          <p className="text-lg text-gray-600 dark:text-gray-300">
            You have completed all available exams.
          </p>
        </div>
      )}
    </div>
  );
};

export default ManageExams;
