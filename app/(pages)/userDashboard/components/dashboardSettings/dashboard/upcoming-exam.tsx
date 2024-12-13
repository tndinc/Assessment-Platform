import { CalendarIcon } from "@radix-ui/react-icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

export function UpcomingExams() {
  const [exams, setExams] = useState([]);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const { data, error } = await supabase
          .from("exam_tbl")
          .select("exam_id, subject, deadline")
          .order("deadline", { ascending: true });

        if (error) throw error;

        // Transform data for the component
        const transformedExams = data.map((exam) => {
          const deadline = new Date(exam.deadline);
          return {
            id: exam.exam_id,
            subject: exam.subject,
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
  }, []);

  return (
    <div className="space-y-8">
      {exams.map((exam) => (
        <div key={exam.id} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage src="/placeholder-avatar.jpg" alt="Avatar" />
            <AvatarFallback>{exam.subject[0]}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1 flex-grow">
            <p className="text-sm font-medium leading-none">{exam.subject}</p>
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
