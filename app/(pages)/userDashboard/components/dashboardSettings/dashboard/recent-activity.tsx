import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

interface User {
  id: string;
  email: string;
  [key: string]: any;
}

export function RecentActivity() {
  const [activities, setActivities] = useState([]);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        setUser(user);

        if (!user) {
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
        const { data, error } = await supabase
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
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Fetch error:", error);
          return;
        }

        if (data && data.length > 0) {
          const transformedActivities = data.map((activity) => ({
            id: activity.id,
            type: "Exam Completed",
            course: activity.exam_tbl
              ? `${activity.exam_tbl.exam_title} - ${activity.exam_tbl.subject}`
              : "Unknown Exam",
            timestamp: new Date(activity.created_at).toLocaleString(),
          }));

          setActivities(transformedActivities);
        } else {
          console.warn("No activities found for the user.");
          setActivities([]);
        }
      } catch (err) {
        console.error("Unexpected error fetching activities:", err);
      }
    };

    fetchActivities();
  }, [user]);

  return (
    <div className="space-y-8 h-96 overflow-y-auto border border-gray-200 rounded-lg p-4">
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
