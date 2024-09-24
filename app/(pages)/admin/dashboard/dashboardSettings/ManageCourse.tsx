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
import { PlusCircle, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Loading from "../components/Loading";
import AddCourse from "../components/AddCourse";

const supabase = createClient();

interface Course {
  course_id: number;
  course_name: string;
  no_of_students: number;
}

const ManageCourse = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCourses = async () => {
      const { data, error } = await supabase
        .from("course_tbl")
        .select("course_id, course_name, no_of_students");

      if (error) {
        console.error("Error fetching courses:", error);
      } else {
        setCourses(data);
      }
      setLoading(false);
    };

    fetchCourses();
  }, []);

  const handleUpdate = (course_id: number) => {
    console.log(`Update course with ID: ${course_id}`);
  };

  const handleDelete = async (course_id: number) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this course?"
    );
    if (!confirmDelete) return; // If the user clicks "Cancel", exit the function.

    const { error } = await supabase
      .from("course_tbl")
      .delete()
      .eq("course_id", course_id);

    if (error) {
      console.error("Error deleting course:", error);
    } else {
      setCourses((prevCourses) =>
        prevCourses.filter((course) => course.course_id !== course_id)
      );
    }
  };

  const handleCourseAdded = () => {
    const fetchCourses = async () => {
      const { data, error } = await supabase
        .from("course_tbl")
        .select("course_id, course_name, no_of_students");
      if (data) {
        setCourses(data);
      }
    };
    fetchCourses();
  };
  if (loading) return <Loading />;

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold">Manage Course</h1>
        <AddCourse onCourseAdded={handleCourseAdded} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Courses List</CardTitle>
          <CardDescription>
            Manage your courses and track student enrollment.
          </CardDescription>
        </CardHeader>
        <CardContent className="max-h-[500px] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course Name</TableHead>
                <TableHead>No. of Students</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((course) => (
                <TableRow
                  key={course.course_id}
                  className="hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  <TableCell className="font-medium">
                    {course.course_name}
                  </TableCell>
                  <TableCell>{course.no_of_students}</TableCell>
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
                          onClick={() => handleUpdate(course.course_id)}
                        >
                          Update
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(course.course_id)}
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
            Total Courses: <strong>{courses.length}</strong>
          </div>
        </CardFooter>
      </Card>
    </>
  );
};

export default ManageCourse;
