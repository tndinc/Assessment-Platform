"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { ModeToggle } from "@/components/ui/ModeToggle";
import BackButton from "../../components/BackButton";
import LoadingPage from "@/components/Loading";
import ExamSection from "./ExamSection";
import { PlusCircle } from "lucide-react";
import AddTopic from "./AddTopic";
import AutoGenerateForm from "./AutoGenerate";

const supabase = createClient();

interface Course {
  course_id: number;
  course_name: string;
}

interface Exam {
  exam_id: number;
  exam_title: string;
  exam_desc: string;
  exam_time_limit: number;
  exam_points: number;
  exam_created_by: string;
  status: string;
  exam_time_created: string;
  course_id: number;
}

export default function ManageExamPage() {
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const { exam_id } = useParams<{ exam_id: string }>();
  const router = useRouter();
  const [exam, setExam] = useState<Exam | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [editableExam, setEditableExam] = useState({
    exam_title: "",
    exam_desc: "",
    exam_points: 0,
    exam_time_limit: 0,
    course_id: 0,
    status: "open",
  });
  const [contentAdded, setContentAdded] = useState(false);

  useEffect(() => {
    const fetchExamData = async () => {
      if (exam_id) {
        const { data, error } = await supabase
          .from("exam_tbl")
          .select(
            `exam_id,
            exam_title,
            exam_desc,
            exam_time_limit,
            exam_points,
            exam_created_by,
            status,
            exam_time_created,
            course_id` // Fetching course_id directly
          )
          .eq("exam_id", exam_id)
          .single();

        if (error) {
          console.error("Error fetching exam data:", error);
        } else {
          setExam(data);
          setEditableExam({
            exam_title: data.exam_title,
            exam_desc: data.exam_desc,
            exam_points: data.exam_points,
            exam_time_limit: data.exam_time_limit,
            course_id: data.course_id || 0, // Set initial course_id
            status: data.status,
          });
        }
      }
    };

    const fetchCourses = async () => {
      const { data, error } = await supabase
        .from("course_tbl")
        .select("course_id, course_name"); // Fetching course_id as well
      if (error) {
        console.error("Error fetching course data:", error);
      } else {
        setCourses(data || []);
      }
    };

    const fetchTopics = async () => {
      const { data, error } = await supabase
        .from("topic_tbl")
        .select()
        .eq("exam_id", exam_id); // Add this line to filter by exam_id
      if (error) {
        console.error("Error fetching topics:", error);
      } else {
        setTopics(data);
      }
      setLoading(false);
    };

    fetchTopics();
    fetchExamData();
    fetchCourses();
  }, [exam_id]);

  const handleContentAdded = () => {
    const fetchUpdatedTopics = async () => {
      const { data, error } = await supabase
        .from("topic_tbl")
        .select()
        .eq("exam_id", exam_id);
      if (error) {
        console.error("Error fetching updated topics:", error);
      } else {
        setTopics(data);
      }
    };
    fetchUpdatedTopics();
    setContentAdded(true);
    console.log("Content added successfully!");
  };
  const handleTopicAdded = () => {
    // Fetch topics again after adding
    const fetchUpdatedTopics = async () => {
      const { data, error } = await supabase
        .from("topic_tbl")
        .select()
        .eq("exam_id", exam_id);
      if (error) {
        console.error("Error fetching updated topics:", error);
      } else {
        setTopics(data);
      }
    };
    fetchUpdatedTopics();
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setEditableExam((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    const { error } = await supabase
      .from("exam_tbl")
      .update({
        exam_title: editableExam.exam_title,
        exam_desc: editableExam.exam_desc,
        exam_points: editableExam.exam_points,
        exam_time_limit: editableExam.exam_time_limit,
        status: editableExam.status,
        course_id: editableExam.course_id, // Updating course_id
      })
      .eq("exam_id", exam_id);

    if (error) {
      console.error("Error updating exam:", error);
    } else {
      alert("Exam updated successfully");

      router.push(`/admin/dashboard/dashboardSettings/${exam_id}`); // Corrected line
    }
  };

  if (!exam) {
    return <LoadingPage />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <div className="flex-grow flex flex-col p-4 space-y-4">
        <Card className="relative w-full bg-white dark:bg-gray-800 dark:text-white">
          <CardHeader className="pb-4 flex items-center justify-between">
            <div className="absolute top-4 left-4">
              <BackButton />
            </div>

            <CardTitle className="text-center text-2xl font-bold text-primary dark:text-white">
              Edit Assessment
            </CardTitle>
            <div className="absolute top-4 right-4">
              <ModeToggle /> {/* Positioned at the top right */}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="examTitle" className="dark:text-gray-300">
                  Exam Title
                </Label>
                <Input
                  id="examTitle"
                  name="exam_title"
                  value={editableExam.exam_title}
                  onChange={handleChange}
                  className="bg-gray-100 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <Label
                  htmlFor="selectCourseName"
                  className="dark:text-gray-300"
                >
                  Course Name
                </Label>
                <select
                  id="selectCourseName"
                  name="course_id" // This should match course_id for proper update
                  value={editableExam.course_id} // This corresponds to the foreign key course_id
                  onChange={handleChange}
                  className="w-full h-9 bg-gray-100 dark:bg-gray-700 dark:text-white"
                >
                  {courses.map((course) => (
                    <option key={course.course_id} value={course.course_id}>
                      {course.course_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="examDescription" className="dark:text-gray-300">
                  Exam Description
                </Label>
                <Input
                  id="examDescription"
                  name="exam_desc"
                  value={editableExam.exam_desc}
                  onChange={handleChange}
                  className="bg-gray-100 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <Label htmlFor="timeLimit" className="dark:text-gray-300">
                  Time Limit (Minutes)
                </Label>
                <Input
                  id="timeLimit"
                  name="exam_time_limit"
                  type="number"
                  value={editableExam.exam_time_limit}
                  onChange={handleChange}
                  className="bg-gray-100 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <Label htmlFor="points" className="dark:text-gray-300">
                  Points
                </Label>
                <Input
                  id="points"
                  name="exam_points"
                  type="number"
                  value={editableExam.exam_points}
                  onChange={handleChange}
                  className="bg-gray-100 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <Label htmlFor="status" className="dark:text-gray-300">
                  Status
                </Label>
                <select
                  id="status"
                  name="status"
                  value={editableExam.status}
                  onChange={handleChange}
                  className="w-full h-9 bg-gray-100 dark:bg-gray-700 dark:text-white"
                >
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <div className="flex items-end">
                <Button
                  className="w-full bg-primary dark:bg-blue-500"
                  onClick={handleUpdate}
                >
                  Update
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-grow space-x-4">
          {topics.length === 0 ? (
            <>
              <AddTopic examId={exam_id} onTopicAdded={handleTopicAdded} />
              <AutoGenerateForm
                examId={exam_id}
                onContentAdded={handleContentAdded}
              />
            </>
          ) : (
            <ExamSection />
          )}
        </div>
      </div>
    </div>
  );
}
