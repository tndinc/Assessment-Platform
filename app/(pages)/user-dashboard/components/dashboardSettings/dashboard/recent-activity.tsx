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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

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
  answers: string;
  exam_tbl: ExamTable;
  student_feedback?: {
    feedback_data: any;
    metrics_data: any;
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
  metricsData: any;
  answers: any;
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
            answers,
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
          metricsData: feedbackLookup[submission.exam_id]?.metrics_data || null,
          answers: submission.answers,
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
              <ViewFeedbackButton activity={activity} userId={user?.id || ""} />
            </div>
          </div>
        ))
      )}
    </div>
  );
}

const ViewFeedbackButton = ({
  activity,
  userId,
}: {
  activity: Activity;
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

  const processMetricsData = (metricsData: any) => {
    if (!metricsData) return [];
    try {
      const parsed =
        typeof metricsData === "string" ? JSON.parse(metricsData) : metricsData;
      return Object.entries(parsed).map(([concept, scores]: [string, any]) => ({
        concept,
        score: scores.score,
        maxScore: scores.maxScore,
        percentage: ((scores.score / scores.maxScore) * 100).toFixed(1),
      }));
    } catch (error) {
      console.error("Error parsing metrics data:", error);
      return [];
    }
  };

  const parseAnswers = (answers: string) => {
    try {
      return typeof answers === "string" ? JSON.parse(answers) : answers;
    } catch (error) {
      console.error("Error parsing answers:", error);
      return [];
    }
  };

  const getAnswerForQuestion = (questionId: string) => {
    const answers = parseAnswers(activity.answers);
    const matchingAnswer = answers.find(
      (answer: any) => answer.questionId === questionId
    );
    return matchingAnswer ? matchingAnswer.code : "No answer submitted";
  };

  const feedback = parseFeedbackData(activity.feedbackData);
  const metricsData = processMetricsData(activity.metricsData);

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          disabled={!feedback.length && !metricsData.length}
        >
          View Details
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-4xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Details for {activity.examTitle}</AlertDialogTitle>
        </AlertDialogHeader>

        <Tabs defaultValue="feedback" className="w-full">
          <TabsList>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
          </TabsList>

          <TabsContent value="feedback">
            <div className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200 max-h-96 overflow-y-auto space-y-6">
              {feedback.length > 0 ? (
                feedback.map((feedbackItem: any, index: number) => (
                  <div
                    key={index}
                    className="p-4 border rounded-lg bg-white dark:bg-[#344C64]"
                  >
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium text-base">
                          Question {index + 1}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-200">
                          {feedbackItem.questionText}
                        </p>
                      </div>

                      <div className="bg-gray-50 dark:bg-[#344C64] p-4 rounded-md">
                        <h4 className="font-medium mb-2">Your Answer:</h4>
                        <pre className="bg-black text-white dark:text-gray-200 p-4 rounded-md overflow-x-auto">
                          <code>
                            {getAnswerForQuestion(feedbackItem.questionId)}
                          </code>
                        </pre>
                      </div>

                      <div className="space-y-2">
                        <div className="bg-blue-50 p-3 rounded-md">
                          <p className="font-medium text-blue-700">
                            LLM Feedback
                          </p>
                          <p className="text-blue-600">
                            {feedbackItem.llmFeedback}
                          </p>
                        </div>

                        <div className="bg-green-50 p-3 rounded-md">
                          <p className="font-medium text-green-700">
                            Syntax Analysis
                          </p>
                          <p className="text-green-600">
                            {feedbackItem.syntaxAnalysis}
                          </p>
                        </div>

                        <div className="bg-purple-50 p-3 rounded-md">
                          <p className="font-medium text-purple-700">
                            PMD Feedback
                          </p>
                          <p className="text-purple-600">
                            {feedbackItem.pmdFeedback}
                          </p>
                        </div>

                        <div className="bg-orange-50 p-3 rounded-md">
                          <p className="font-medium text-orange-700">
                            Overall Feedback
                          </p>
                          <p className="text-orange-600">
                            {feedbackItem.overallFeedback}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p>No feedback available for this submission.</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="metrics">
            {metricsData.length > 0 ? (
              <div className="space-y-4">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={metricsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="concept" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar name="Score" dataKey="score" fill="#8884d8" />
                      <Bar name="Max Score" dataKey="maxScore" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-[#344C64]">
                        <th className="text-left p-2">Concept</th>
                        <th className="text-right p-2">Score</th>
                        <th className="text-right p-2">Max Score</th>
                        <th className="text-right p-2">Percentage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {metricsData.map((metric: any, index: number) => (
                        <tr key={index} className="border-t">
                          <td className="p-2">{metric.concept}</td>
                          <td className="text-right p-2">{metric.score}</td>
                          <td className="text-right p-2">{metric.maxScore}</td>
                          <td className="text-right p-2">
                            {metric.percentage}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <p>No metrics data available for this submission.</p>
            )}
          </TabsContent>
        </Tabs>

        <AlertDialogFooter>
          <AlertDialogCancel>Close</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
