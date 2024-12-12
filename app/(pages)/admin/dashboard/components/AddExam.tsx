import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

interface AddExamProps {
  onExamAdded: () => void;
}

const AddExam: React.FC<AddExamProps> = ({ onExamAdded }) => {
  const loggedInUser = sessionStorage.getItem("admin_user");
  const [open, setOpen] = useState<boolean>(false);
  const [courses, setCourses] = useState<
    { course_id: number; course_name: string }[]
  >([]);
  const [courseId, setCourseId] = useState<number | null>(null);
  const [examTitle, setExamTitle] = useState<string>("");
  const [examDesc, setExamDesc] = useState<string>("");
  const [examTimeLimit, setExamTimeLimit] = useState<number>(0);
  const [examPoints, setExamPoints] = useState<number>(0);
  const [subject, setSubject] = useState<string>("");
  const [deadline, setDeadline] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      const { data, error } = await supabase
        .from("course_tbl")
        .select("course_id, course_name");
      if (error) {
        console.error("Error fetching courses:", error);
      } else {
        setCourses(data);
      }
    };

    fetchCourses();
  }, []);

  const resetForm = () => {
    setCourseId(null);
    setExamTitle("");
    setExamDesc("");
    setExamTimeLimit(0);
    setExamPoints(0);
    setSubject("");
    setDeadline("");
    setError(null);
  };

  const handleAddExam = async () => {
    setError(null);

    if (
      !courseId ||
      examTitle.trim() === "" ||
      subject.trim() === "" ||
      deadline.trim() === "" ||
      examTimeLimit <= 0 ||
      examPoints <= 0
    ) {
      setError("Please fill out all fields correctly.");
      return;
    }

    try {
      const { error: insertError } = await supabase.from("exam_tbl").insert([
        {
          course_id: courseId,
          exam_title: examTitle,
          exam_desc: examDesc,
          exam_time_limit: examTimeLimit,
          exam_points: examPoints,
          subject: subject,
          deadline: deadline,
          exam_created_by: loggedInUser,
          exam_time_created: new Date().toISOString(),
        },
      ]);

      if (insertError) {
        throw insertError;
      }

      onExamAdded();
      resetForm();
      setOpen(false);
    } catch (err) {
      console.error("Error adding exam:", err);
      setError("An error occurred while adding the exam. Please try again.");
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="bluelogin" className="gap-1">
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Add Exam
            </span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Exam</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Course Selection */}
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="courseId" className="col-span-1">
                Course:
              </label>
              <select
                id="courseId"
                value={courseId || ""}
                onChange={(e) => setCourseId(Number(e.target.value))}
                className="col-span-3"
                required
              >
                <option value="">Select Course</option>
                {courses.map((course) => (
                  <option key={course.course_id} value={course.course_id}>
                    {course.course_name}
                  </option>
                ))}
              </select>
            </div>
            {/* Exam Title */}
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="examTitle" className="col-span-1">
                Exam Title:
              </label>
              <Input
                id="examTitle"
                value={examTitle}
                onChange={(e) => setExamTitle(e.target.value)}
                placeholder="Enter exam title"
                className="col-span-3"
                required
              />
            </div>
            {/* Exam Description */}
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="examDesc" className="col-span-1">
                Description:
              </label>
              <Textarea
                id="examDesc"
                value={examDesc}
                onChange={(e) => setExamDesc(e.target.value)}
                placeholder="Enter exam description"
                className="col-span-3"
                required
              />
            </div>
            {/* Subject */}
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="subject" className="col-span-1">
                Subject:
              </label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter subject"
                className="col-span-3"
                required
              />
            </div>
            {/* Deadline */}
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="deadline" className="col-span-1">
                Deadline:
              </label>
              <Input
                id="deadline"
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            {/* Exam Time Limit */}
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="examTimeLimit" className="col-span-1">
                Time Limit (minutes):
              </label>
              <Input
                id="examTimeLimit"
                type="number"
                value={examTimeLimit}
                onChange={(e) => setExamTimeLimit(Number(e.target.value))}
                placeholder="Time limit (in minutes)"
                className="col-span-3"
                required
              />
            </div>
            {/* Exam Points */}
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="examPoints" className="col-span-1">
                Points:
              </label>
              <Input
                id="examPoints"
                type="number"
                value={examPoints}
                onChange={(e) => setExamPoints(Number(e.target.value))}
                placeholder="Points"
                className="col-span-3"
                required
              />
            </div>
            {error && <p className="text-red-600">{error}</p>}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                resetForm();
                setOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button variant="bluelogin" onClick={handleAddExam}>
              Add Exam
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddExam;
