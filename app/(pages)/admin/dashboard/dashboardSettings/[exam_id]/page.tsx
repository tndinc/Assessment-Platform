"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import ExamDetails from "./components/ExamDetails";
import QuestionManager from "./components/QuestionManager";
import Analytics from "./components/Analytics";
import { ArrowLeft, BarChart } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ManageExam() {
  const router = useRouter();
  const params = useParams();
  const examId = Number(params.exam_id);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [previousPath, setPreviousPath] = useState("/admin"); // Default fallback

  useEffect(() => {
    // Get the previous path from sessionStorage when component mounts
    const prevPath = sessionStorage.getItem("previousPath");
    if (prevPath) {
      setPreviousPath(prevPath);
    }
  }, []);

  const handleBackToDashboard = () => {
    if (window.history.length > 2) {
      // If there's history, go back
      router.back();
    } else {
      // If no history, use the stored path or fallback to default
      router.push(previousPath);
    }
  };

  const toggleAnalytics = () => {
    setShowAnalytics(!showAnalytics);
  };

  if (isNaN(examId)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-xl text-gray-600">Invalid exam ID</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-[#27374D] flex flex-col">
      <div className="flex-1 max-w-7xl w-full mx-auto py-6 px-4 sm:px-6 lg:px-8 flex flex-col">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <Button variant="bluelogin" onClick={handleBackToDashboard}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button
              variant="outline"
              onClick={toggleAnalytics}
              className={showAnalytics ? "bg-gray-200 dark:bg-[#344C64] " : ""}
            >
              <BarChart className="mr-2 h-4 w-4" />
              Analytics
            </Button>
          </div>

          {showAnalytics ? (
            <Analytics examId={examId} />
          ) : (
            <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
              <ExamDetails examId={examId} />
              <QuestionManager examId={examId} />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
