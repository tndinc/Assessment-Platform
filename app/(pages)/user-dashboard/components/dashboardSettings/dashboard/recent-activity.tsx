"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { CheckCircle, Clock } from "lucide-react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

const supabase = createClient();

interface ExamTable {
  exam_id: string;
  exam_title: string;
  exam_desc: string;
  exam_time_limit: number;
  exam_points: number;
  subject: string;
  status: string;
}

interface ExamSubmission {
  submission_id: string;
  user_id: string;
  exam_id: string;
  submission_date: string;
  time_spent: number;
  status: string;
  exam_tbl: ExamTable;
  student_feedback?: {
    feedback_data: any;
    total_score: number;
    max_score: number;
  };
}

interface Activity {
  id: string;
  examTitle: string;
  subject: string;
  points: number;
  timeLimit: number;
  timeSpent: string;
  status: string;
  submissionDate: string;
  feedbackData: any;
  totalScore: number;
  maxScore: number;
}

const getStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case "completed":
      return "bg-[#72BF78] dark:bg-[#556E53]";
    case "in_progress":
      return "bg-yellow-500 dark:bg-yellow-600";
    case "submitted":
      return "bg-blue-500 dark:bg-blue-600";
    default:
      return "bg-gray-500 dark:bg-gray-600";
  }
};

export function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [user, setUser] = useState<{ id: string } | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session) {
        console.error("User not authenticated", error);
        return;
      }
      setUser({ id: data.session.user.id });
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const fetchActivities = async () => {
      if (!user) return;

      try {
        const { data: submissions, error: submissionsError } = await supabase
          .from("exam_submissions")
          .select(
            `
            submission_id,
            user_id,
            exam_id,
            submission_date,
            time_spent,
            status,
            exam_tbl!exam_submissions_exam_id_fkey (
              exam_id,
              exam_title,
              exam_desc,
              exam_time_limit,
              exam_points,
              subject,
              status
            )
          `
          )
          .eq("user_id", user.id)
          .order("submission_date", { ascending: false });

        if (submissionsError) throw submissionsError;

        // Fetch feedback data separately
        const { data: feedbackData, error: feedbackError } = await supabase
          .from("student_feedback")
          .select("*")
          .eq("user_id", user.id);

        if (feedbackError) throw feedbackError;

        // Create a lookup object for feedback data
        const feedbackLookup = feedbackData.reduce((acc, feedback) => {
          acc[feedback.exam_id] = feedback;
          return acc;
        }, {});

        const transformedActivities = submissions.map((submission) => ({
          id: submission.submission_id,
          examTitle: submission.exam_tbl.exam_title,
          subject: submission.exam_tbl.subject,
          points: submission.exam_tbl.exam_points,
          timeLimit: submission.exam_tbl.exam_time_limit,
          timeSpent: formatTimeSpent(submission.time_spent),
          status: submission.status,
          submissionDate: new Date(submission.submission_date).toLocaleString(),
          feedbackData:
            feedbackLookup[submission.exam_id]?.feedback_data || null,
          totalScore: feedbackLookup[submission.exam_id]?.total_score || 0,
          maxScore: feedbackLookup[submission.exam_id]?.max_score || 0,
        }));

        setActivities(transformedActivities);
      } catch (err) {
        console.error("Error fetching activities:", err);
      }
    };

    fetchActivities();
  }, [user]);

  const formatTimeSpent = (timeInSeconds: number): string => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes}m ${seconds}s`;
  };

  return (
    <div className="space-y-8 h-96 overflow-y-auto rounded-lg p-2">
      {activities.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400">
          No recent activities found.
        </p>
      ) : (
        activities.map((activity) => (
          <div key={activity.id} className="flex items-center">
            <div
              className={`h-9 w-9 text-white rounded-full flex items-center justify-center ${getStatusColor(
                activity.status
              )}`}
            >
              <CheckCircle className="h-5 w-5" />
            </div>
            <div className="ml-4 space-y-1 flex-grow">
              <p className="text-sm text-[#118B50] dark:text-[#A0D683] font-medium leading-none">
                {activity.examTitle}
              </p>
              <p className="text-xs text-muted-foreground">
                {activity.subject} • {activity.points} points
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center text-xs text-muted-foreground">
                  <Clock className="h-3 w-3 mr-1" />
                  Time spent: {activity.timeSpent}
                </div>
                <div className="text-xs text-muted-foreground">
                  Time limit: {activity.timeLimit} minutes
                </div>
                <div className="text-xs text-muted-foreground">
                  Score: {activity.totalScore}/{activity.maxScore}
                </div>
              </div>
            </div>
            <div className="ml-auto flex flex-col items-end gap-2">
              <span className="font-medium text-xs text-muted-foreground whitespace-nowrap">
                {activity.submissionDate}
              </span>
              <ViewFeedbackButton
                feedbackData={activity.feedbackData}
                examTitle={activity.examTitle}
                examId={activity.id}
                userId={user?.id || ""}
              />
            </div>
          </div>
        ))
      )}
    </div>
  );
}

const ViewFeedbackButton = ({
  feedbackData,
  examTitle,
  examId,
  userId,
}: {
  feedbackData: any;
  examTitle: string;
  examId: string;
  userId: string;
}) => {
  const parseFeedbackData = (data: any) => {
    if (!data) return [];
    try {
      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error("Error parsing feedback data:", error);
      return [];
    }
  };

  const feedback = parseFeedbackData(feedbackData);

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="sm" variant="outline" disabled={!feedback.length}>
          View Feedback
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Feedback for {examTitle}</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogDescription className="whitespace-pre-wrap text-sm text-gray-800 max-h-64 overflow-y-auto">
          {feedback.length > 0 ? (
            feedback.map((item, index) => (
              <div key={index} className="mb-4 p-2 border-b">
                <p>
                  <strong>Question:</strong> {item.questionText}
                </p>
                <p>
                  <strong>LLM Feedback:</strong> {item.llmFeedback}
                </p>
                <p>
                  <strong>Syntax Analysis:</strong> {item.syntaxAnalysis}
                </p>
                <p>
                  <strong>PMD Feedback:</strong> {item.pmdFeedback}
                </p>
                <p>
                  <strong>Overall Feedback:</strong> {item.overallFeedback}
                </p>
              </div>
            ))
          ) : (
            <p>No feedback available for this submission.</p>
          )}
        </AlertDialogDescription>
        <AlertDialogFooter>
          <AlertDialogCancel>Close</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
