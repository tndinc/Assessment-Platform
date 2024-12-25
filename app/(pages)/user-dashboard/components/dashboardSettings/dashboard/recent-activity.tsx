"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

interface User {
  id: string;
  email: string | undefined;
}

interface ExamTableData {
  exam_title: string;
  subject: string;
}

interface ExamResult {
  id: string;
  created_at: string;
  exam_tbl: ExamTableData;
}

interface Activity {
  id: string;
  type: string;
  course: string;
  timestamp: string;
}

export function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();
        if (authUser) {
          setUser({
            id: authUser.id,
            email: authUser.email,
          });
        } else {
          throw new Error("User not authenticated");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const fetchActivities = async () => {
      if (!user) return;

      try {
        const { data, error } = (await supabase
          .from("exam_results")
          .select(
            `
            id,
            created_at,
            exam_tbl:exam_id (
              exam_title,
              subject
            )
          `
          )
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })) as {
          data: ExamResult[] | null;
          error: any;
        };

        if (error) throw error;
        if (!data) return;

        const transformedActivities = data.map((activity) => ({
          id: activity.id,
          type: "Exam Completed",
          course: activity.exam_tbl
            ? `${activity.exam_tbl.exam_title} - ${activity.exam_tbl.subject}`
            : "Unknown Exam",
          timestamp: new Date(activity.created_at).toLocaleString(),
        }));

        setActivities(transformedActivities);
      } catch (err) {
        console.error("Error fetching activities:", err);
      }
    };

    fetchActivities();
  }, [user]);

  return (
    <div className="space-y-8 h-96 overflow-y-auto rounded-lg p-2">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage src="/placeholder-avatar.jpg" alt="Avatar" />
            <AvatarFallback>{activity.type[0]}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1 flex-grow">
            <p className="text-sm font-medium leading-none">{activity.type}</p>
            <p className="text-xs text-muted-foreground">{activity.course}</p>
          </div>
          <div className="ml-auto font-medium text-xs text-muted-foreground whitespace-nowrap">
            {activity.timestamp}
          </div>
        </div>
      ))}
    </div>
  );
}
