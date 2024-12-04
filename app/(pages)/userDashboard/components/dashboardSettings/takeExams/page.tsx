import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation"; // For navigation in App Router
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import LoadingPage from "@/components/Loading";

const supabase = createClient();

interface Exam {
  exam_id: string; // Primary key of the exam
  exam_title: string;
  exam_desc: string;
  exam_points: number;
  exam_created_by: string;
  subject: string;
  deadline: string;
}

const ManageExams = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingExamId, setLoadingExamId] = useState<string | null>(null); // Tracks which exam is being processed
  const router = useRouter();

  useEffect(() => {
    const fetchExams = async () => {
      const { data, error } = await supabase.from("exam_tbl").select(`
        exam_id,
        exam_title,
        exam_desc,
        exam_points,
        exam_created_by,
        subject,
        deadline
      `);

      if (error) {
        console.error("Error fetching exams:", error);
      } else {
        setExams(data as Exam[]);
      }
      setLoading(false);
    };

    fetchExams();
  }, []);

  const handleTakeExam = (exam_id: string) => {
    setLoadingExamId(exam_id); // Set loading for the selected exam
    // Simulate a small delay to show loading indication (optional)
    setTimeout(() => {
      router.push(`/userDashboard/exam/${exam_id}`);
    }, 500); // Optional delay for the loading indicator
  };

  if (loading) return <LoadingPage />;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-semibold mb-6">Manage Exams</h1>
      <div className="grid grid-cols-3 gap-6">
        {exams.map((exam, index) => (
          <Card key={index} className="w-full max-w-sm mx-auto">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">{exam.exam_title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p><strong>Description:</strong> {exam.exam_desc}</p>
              <p><strong>Total Points:</strong> {exam.exam_points}</p>
              <p><strong>Created By:</strong> {exam.exam_created_by}</p>
              <p><strong>Subject:</strong> {exam.subject}</p>
              <p><strong>Deadline:</strong> {exam.deadline}</p>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full py-2"
                onClick={() => handleTakeExam(exam.exam_id)} // Pass the exam_id
                disabled={loadingExamId === exam.exam_id} // Disable button when loading
              >
                {loadingExamId === exam.exam_id ? "Loading..." : "Take Exam"} 
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ManageExams;
