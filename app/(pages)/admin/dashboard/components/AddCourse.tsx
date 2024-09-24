import { useState } from "react";
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
import { PlusCircle } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

interface AddCourseProps {
  onCourseAdded: () => void;
}

const AddCourse: React.FC<AddCourseProps> = ({ onCourseAdded }) => {
  const [open, setOpen] = useState<boolean>(false);
  const [courseName, setCourseName] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setCourseName("");
    setError(null);
  };

  const handleAddCourse = async () => {
    setError(null); // Reset error message

    if (courseName.trim() === "") {
      setError("Course name cannot be empty.");
      return;
    }

    try {
      // Check for existing course name
      const { data: existingCourse } = await supabase
        .from("course_tbl")
        .select("course_name")
        .eq("course_name", courseName)
        .single();

      if (existingCourse) {
        setError("This course already exists. Please choose a different name.");
        return;
      }

      // Insert new course
      const { error: insertError } = await supabase
        .from("course_tbl")
        .insert([{ course_name: courseName, no_of_students: 0 }]);

      if (insertError) {
        throw insertError; // Throw error to catch block
      }

      console.log("Added course:", courseName);
      onCourseAdded(); // Trigger the update in ManageCourse
      resetForm(); // Reset form state
      setOpen(false);
    } catch (err) {
      console.error("Error:", err);
      setError("An error occurred while processing your request.");
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="default" className="gap-1">
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Add Course
            </span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Course</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Input
                id="courseName"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                className="col-span-4"
                placeholder="Enter course name"
                required
              />
            </div>
            {error && <p className="text-red-600">{error}</p>}{" "}
            {/* Display error message */}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                resetForm(); // Reset form state
                setOpen(false); // Close the modal
              }}
            >
              Cancel
            </Button>

            <Button onClick={handleAddCourse}>Add Course</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddCourse;
