import { CalendarIcon } from "@radix-ui/react-icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

export function UpcomingExams() {
  type Exam = {
    id: number;
    subject: string;
    title: string;
    date: string;
    time: string;
  };

  const [exams, setExams] = useState<Exam[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) return;
      setUserId(data.user.id);
    };

    fetchUser();
  }, []);

  useEffect(() => {
    if (!userId) return;

    const fetchExams = async () => {
      try {
        // Get the list of exam IDs the user has already taken
        const { data: takenExams, error: takenExamsError } = await supabase
          .from("exam_submissions")
          .select("exam_id")
          .eq("user_id", userId);

        if (takenExamsError) throw takenExamsError;

        const takenExamIds = takenExams?.map((exam) => exam.exam_id) || [];

        // Fetch upcoming exams that the user has NOT taken
        const { data, error } = await supabase
          .from("exam_tbl")
          .select("exam_id, subject, exam_title, deadline")
          .eq("status", "open")
          .not("exam_id", "in", `(${takenExamIds.join(",") || "0"})`)
          .order("deadline", { ascending: true });

        if (error) throw error;

        // Transform data for the component
        const transformedExams = data.map((exam) => {
          const deadline = new Date(exam.deadline);
          return {
            id: exam.exam_id,
            subject: exam.subject,
            title: exam.exam_title,
            date: deadline.toLocaleDateString(),
            time: deadline.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          };
        });

        setExams(transformedExams);
      } catch (err) {
        console.error("Error fetching exams:", err);
      }
    };

    fetchExams();
  }, [userId]);

  return (
    <div className="space-y-8">
      {exams.map((exam) => (
        <div key={exam.id} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage src="/placeholder-avatar.jpg" alt="Avatar" />
            <AvatarFallback>{exam.subject[0]}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1 flex-grow">
            <p className="text-sm font-medium leading-none">
              {exam.subject} ({exam.title})
            </p>
            <p className="text-xs text-muted-foreground">
              {exam.date} at {exam.time}
            </p>
          </div>
          <div className="ml-auto">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      ))}
    </div>
  );
}
