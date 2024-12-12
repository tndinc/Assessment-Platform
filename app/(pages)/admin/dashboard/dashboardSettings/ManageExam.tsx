import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import Loading from "../../../../../components/Loading";
import AddExam from "../components/AddExam";
import { useRouter } from "next/navigation";

const supabase = createClient();

interface Course {
  course_name: string; // course_name is a string
}

interface Exam {
  exam_id: number; // exam ID
  exam_title: string; // title of the exam
  exam_desc: string; // description of the exam
  subject: string; // subject of the exam
  deadline: string; // deadline of the exam
  exam_time_limit: number; // time limit in minutes
  exam_points: number; // points for the exam
  exam_created_by: string; // created by
  exam_time_created: string; // creation timestamp
  course_tbl: Course; // course_tbl as an object, not an array
  status: string; // status property
}

const ManageExam = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingExamId, setLoadingExamId] = useState<number | null>(null); // To track which exam is being loaded

  useEffect(() => {
    const fetchExams = async () => {
      const { data, error } = await supabase
        .from("exam_tbl")
        .select(
          `
            exam_id, 
            exam_title, 
            exam_desc, 
            subject, 
            deadline, 
            exam_time_limit, 
            exam_points,
            exam_created_by,
            status,
            exam_time_created,
            course_tbl (
              course_name
            )
          `
        )
        .order("exam_time_created", { ascending: false }); // Order by newest first;

      if (error) {
        console.error("Error fetching exams:", error);
      } else {
        const examsWithCourseName: Exam[] = data.map((exam: any) => ({
          ...exam,
          course_tbl: exam.course_tbl || { course_name: "N/A" }, // Default to a fallback object
        }));

        setExams(examsWithCourseName);
      }
      setLoading(false);
    };

    fetchExams();
  }, []);

  const handleUpdate = (exam_id: number) => {
    console.log(`Update exam with ID: ${exam_id}`);
  };

  const handleDelete = async (exam_id: number) => {
    console.log("Exam ID to delete:", exam_id);
    if (!exam_id) {
      console.error("Invalid exam_id:", exam_id);
      return;
    }

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this exam?"
    );
    if (!confirmDelete) return;

    try {
      const { error } = await supabase
        .from("exam_tbl")
        .delete()
        .eq("exam_id", exam_id);

      if (error) {
        console.error("Error deleting exam:", error);
        alert("An error occurred while deleting the exam. Please try again.");
        return;
      }

      // Update the UI by removing the deleted exam
      setExams((prevExams) =>
        prevExams.filter((exam) => exam.exam_id !== exam_id)
      );

      alert("Exam deleted successfully!");
    } catch (err) {
      console.error("Unexpected error during deletion:", err);
      alert("Unexpected error occurred. Please try again later.");
    }
  };

  const handleExamAdded = () => {
    const fetchExams = async () => {
      const { data, error } = await supabase
        .from("exam_tbl")
        .select(
          `
          exam_id, 
          exam_title, 
          exam_desc, 
          subject, 
          deadline, 
          exam_time_limit, 
          exam_points,
          exam_created_by,
          status,
          exam_time_created,
          course_tbl (
            course_name
          )
        `
        )
        .order("exam_time_created", { ascending: false }); // Order by newest first
      if (error) {
        console.error("Error fetching exams:", error);
      } else {
        const examsWithCourseName: Exam[] = data.map((exam: any) => ({
          ...exam,
          course_tbl: exam.course_tbl || { course_name: "N/A" }, // Default to a fallback object
        }));

        setExams(examsWithCourseName);
      }
    };
    fetchExams();
  };
  const handleManageClick = async (exam_id: number) => {
    setLoadingExamId(exam_id); // Set loading state to true for this exam
    // Simulate a delay or API call
    try {
      // You can replace this with your actual logic (e.g., API call or navigation)
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate a 1-second delay
      // After the action, navigate to the exam manage page
      router.push(`/admin/dashboard/dashboardSettings/${exam_id}`);
    } catch (error) {
      console.error("Error during manage click:", error);
    } finally {
      setLoadingExamId(null); // Reset loading state after the action is done
    }
  };

  if (loading) return <Loading />;

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold">Manage Exam</h1>
        <AddExam onExamAdded={handleExamAdded} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Exams List</CardTitle>
          <CardDescription>
            Manage your exams and track details.
          </CardDescription>
        </CardHeader>
        <CardContent className="max-h-[500px] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Exam Title</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Time Limit (mins)</TableHead>
                <TableHead>Points</TableHead>
                <TableHead>Created By</TableHead>
                <TableHead>Created Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Manage</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exams.map((exam) => (
                <TableRow
                  key={exam.exam_id}
                  className="hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  <TableCell className="font-medium">
                    {exam.exam_title}
                  </TableCell>
                  <TableCell>{exam.course_tbl.course_name}</TableCell>
                  <TableCell>{exam.exam_desc}</TableCell>
                  <TableCell>{exam.subject}</TableCell>
                  <TableCell>
                    {new Date(exam.deadline).toLocaleString()}
                  </TableCell>
                  <TableCell>{exam.exam_time_limit}</TableCell>
                  <TableCell>{exam.exam_points}</TableCell>
                  <TableCell>{exam.exam_created_by}</TableCell>
                  <TableCell>
                    {new Date(exam.exam_time_created).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        exam.status === "open"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      }`}
                      role="status"
                    >
                      {exam.status === "open" ? "Open" : "Closed"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="bluelogin"
                      onClick={() => handleManageClick(exam.exam_id)}
                      disabled={loadingExamId === exam.exam_id} // Disable button while loading
                    >
                      {loadingExamId === exam.exam_id ? "Loading..." : "Manage"}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          aria-haspopup="true"
                          size="icon"
                          variant="ghost"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => handleUpdate(exam.exam_id)}
                        >
                          Update
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(exam.exam_id)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="pt-6">
          <div className="text-xs text-muted-foreground">
            Total Exams: <strong>{exams.length}</strong>
          </div>
        </CardFooter>
      </Card>
    </>
  );
};

export default ManageExam;
