"use client";
import type React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Loader2 } from "lucide-react"; // Assuming you're using this for the loading spinner
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import LoadingPage from "@/components/Loading"; // Assuming you have a LoadingPage component
import ModernBackground from "@/components/ui/SchoolBackground";

const supabase = createClient();

interface Course {
  course_id: string;
  course_name: string;
  no_of_students: number;
}

export default function ChooseSection() {
  const [user, setUser] = useState<any | null | undefined>(undefined); // User state
  const [profile, setProfile] = useState<any | null | undefined>(undefined); // User profile state
  const [courses, setCourses] = useState<Course[]>([]); // Available courses
  const [selectedCourse, setSelectedCourse] = useState<string>(""); // Selected course id
  const [selectedCourseName, setSelectedCourseName] = useState<string>(""); // Selected course name
  const [loading, setLoading] = useState(false); // Loading state
  const [fetchingCourses, setFetchingCourses] = useState(true); // Flag for course fetching
  const [isProfileFetched, setIsProfileFetched] = useState(false); // Flag to track if profile is fetched
  const router = useRouter();

  useEffect(() => {
    const fetchUserAndCourses = async () => {
      // Step 1: Fetch the authenticated user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        console.error("Authentication error or no user:", authError);
        router.push("/"); // Redirect to home if not authenticated
        return;
      }

      // Set user state
      setUser(user);

      // Step 2: Fetch the user's profile from "profiles" table
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("user_section") // Adjust this if you want other fields
        .eq("id", user.id) // Make sure profile is linked to user id
        .single(); // Use .single() for a single profile

      if (profileError) {
        console.error("Error fetching user profile:", profileError);
      } else {
        setProfile(profileData);
        console.log("User profile:", profileData);
      }

      // Check if the user already has a `user_section`
      if (profileData && profileData.user_section) {
        router.push("/user-dashboard"); // Redirect to dashboard if user already has a section
        return;
      }

      // Step 3: Fetch available courses
      setFetchingCourses(true);
      const { data, error } = await supabase
        .from("course_tbl")
        .select("course_id, course_name, no_of_students");

      if (error) {
        console.error("Error fetching courses:", error);
      } else {
        setCourses(data || []);
      }
      setFetchingCourses(false);
      setIsProfileFetched(true); // Profile has been fetched
    };

    fetchUserAndCourses();
  }, [router]);

  // Render the loading page while user authentication state is being determined
  if (user === undefined || !isProfileFetched) {
    return <LoadingPage />;
  }

  // Prevent rendering the dashboard for unauthenticated users
  if (!user || !profile) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;

    setLoading(true);

    try {
      // Step 1: Fetch the current no_of_students for the selected course
      const { data: courseData, error: fetchError } = await supabase
        .from("course_tbl")
        .select("no_of_students")
        .eq("course_id", selectedCourse)
        .single(); // Get a single course's data

      if (fetchError) {
        console.error("Error fetching course data:", fetchError);
        return;
      }

      // Increment the number of students
      const updatedNoOfStudents = (courseData?.no_of_students || 0) + 1;

      // Step 2: Update the course with the incremented number of students
      const { error: courseUpdateError } = await supabase
        .from("course_tbl")
        .update({ no_of_students: updatedNoOfStudents })
        .eq("course_id", selectedCourse);

      if (courseUpdateError) {
        console.error("Error updating course:", courseUpdateError);
        return;
      }

      // Step 3: Update the user's profile with the selected course name (user_section)
      const { error: profileUpdateError } = await supabase
        .from("profiles")
        .update({ user_section: selectedCourseName }) // Use selectedCourseName here
        .eq("id", user.id); // Ensure it's updating the correct profile based on the user id

      if (profileUpdateError) {
        console.error("Error updating user profile:", profileUpdateError);
        return;
      }

      // Redirect after successful update
      router.push("/user-dashboard");
    } catch (error) {
      console.error("Unexpected error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-gray-900 dark:to-cyan-900 overflow-hidden">
      <ModernBackground />

      <Card className="w-full max-w-md bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center text-blue-600 dark:text-blue-300">
            Choose Your Section
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="section"
                className="text-sm font-medium text-gray-700 \
                dark:text-gray-300"
              >
                Select your class section
              </label>
              <Select
                value={selectedCourse}
                onValueChange={(value) => {
                  const selected = courses.find(
                    (course) => course.course_id === value
                  );
                  if (selected) {
                    setSelectedCourse(value);
                    setSelectedCourseName(selected.course_name); // Store the course_name
                  }
                }}
                disabled={fetchingCourses}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a section" />
                </SelectTrigger>
                <SelectContent>
                  {fetchingCourses ? (
                    <SelectItem value="loading" disabled>
                      Loading courses...
                    </SelectItem>
                  ) : courses.length > 0 ? (
                    courses.map((course) => (
                      <SelectItem
                        key={course.course_id}
                        value={course.course_id}
                      >
                        {course.course_name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-courses" disabled>
                      No courses available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 dark:from-blue-700 dark:to-cyan-800 dark:hover:from-blue-800 dark:hover:to-cyan-900 text-white border-none shadow-md hover:shadow-lg transition-all duration-300 text-lg font-semibold py-3 px-4 rounded-xl flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!selectedCourse || loading || fetchingCourses}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                "Continue to Dashboard"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-center text-sm text-gray-600 dark:text-gray-400">
          You can change your section later in your profile settings.
        </CardFooter>
      </Card>
    </div>
  );
}
