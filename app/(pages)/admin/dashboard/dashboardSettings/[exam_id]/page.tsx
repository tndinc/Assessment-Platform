// app/exam/[exam_id]/page.tsx
"use client";

import { useParams, useRouter } from "next/navigation";
import ExamDetails from "./components/ExamDetails";
import QuestionManager from "./components/QuestionManager";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ManageExam() {
  const router = useRouter();
  const params = useParams();
  const examId = Number(params.exam_id);

  const handleBackToDashboard = () => {
    router.push("/admin"); // Adjust this path to match your dashboard route
  };

  if (isNaN(examId)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-xl text-gray-600">Invalid exam ID</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 max-w-7xl w-full mx-auto py-6 px-4 sm:px-6 lg:px-8 flex flex-col">
        <div className="space-y-6">
          <Button
            variant="ghost"
            className="mb-4"
            onClick={handleBackToDashboard}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
            <ExamDetails examId={examId} />
            <QuestionManager examId={examId} />
          </div>
        </div>
      </div>
    </main>
  );
}
