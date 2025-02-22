import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UserCircle, AlertTriangle, Clock, Copy } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
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

const Analytics = ({ examId }) => {
  const [analyticsData, setAnalyticsData] = useState({
    submissions: [],
    cheatingStats: [],
    feedback: {}, // Changed to object for easier lookup
    riskLevels: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const supabase = createClient();

  const totalScoreSum = analyticsData.submissions.reduce(
    (acc, sub) => acc + sub.total_score,
    0
  );
  const maxScoreSum = analyticsData.submissions.reduce(
    (acc, sub) => acc + sub.max_score,
    0
  );

  const totalAverageScore =
    maxScoreSum > 0 ? ((totalScoreSum / maxScoreSum) * 100).toFixed(1) : 0;

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);

        // Fetch submissions with feedback data
        const { data: submissions, error: submissionsError } = await supabase
          .from("exam_submissions")
          .select(
            `
            *,
            profiles:user_id (
              full_name,
              email,
              avatar_url
            )
          `
          )
          .eq("exam_id", examId);

        if (submissionsError) throw submissionsError;

        // Fetch all feedback for this exam
        const { data: feedbackData, error: feedbackError } = await supabase
          .from("student_feedback")
          .select("*")
          .eq("exam_id", examId);

        if (feedbackError) throw feedbackError;

        // Create a lookup object for feedback data
        const feedbackLookup = feedbackData.reduce((acc, feedback) => {
          acc[feedback.user_id] = feedback;
          return acc;
        }, {});

        // Fetch cheating logs
        const { data: cheatingLogs, error: cheatingError } = await supabase
          .from("cheating_logs")
          .select(
            `
            *,
            profiles:user_id (
              full_name
            )
          `
          )
          .eq("exam_id", examId);

        if (cheatingError) throw cheatingError;

        // Process the submissions with feedback data
        const processedSubmissions = submissions.map((sub) => ({
          ...sub,
          full_name: sub.profiles.full_name,
          total_score: feedbackLookup[sub.user_id]?.total_score || 0,
          max_score: feedbackLookup[sub.user_id]?.max_score || 0,
          feedback_data: feedbackLookup[sub.user_id]?.feedback_data || null,
          metrics_data: feedbackLookup[sub.user_id]?.metrics_data || null,
        }));

        const processedCheatingLogs = cheatingLogs.map((log) => ({
          ...log,
          full_name: log.profiles.full_name,
        }));

        const riskLevels = Object.entries(
          processedCheatingLogs.reduce((acc, log) => {
            acc[log.cheat_risk_level] = (acc[log.cheat_risk_level] || 0) + 1;
            return acc;
          }, {})
        ).map(([level, count]) => ({ level, count }));

        setAnalyticsData({
          submissions: processedSubmissions,
          cheatingStats: processedCheatingLogs,
          feedback: feedbackLookup,
          riskLevels,
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [examId, supabase]);

  // Function to parse and validate feedback data
  const parseFeedbackData = (feedbackData) => {
    if (!feedbackData) return [];
    try {
      const parsed =
        typeof feedbackData === "string"
          ? JSON.parse(feedbackData)
          : feedbackData;
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error("Error parsing feedback data:", error);
      return [];
    }
  };

  // Update the participant section to include the feedback dialog
  const renderParticipantList = () => (
    <div className="grid grid-cols-1 gap-2">
      {analyticsData.submissions.map((submission) => {
        const userAverageScore =
          submission.max_score > 0
            ? ((submission.total_score / submission.max_score) * 100).toFixed(1)
            : 0;

        const feedbackData = parseFeedbackData(submission.feedback_data);

        return (
          <div
            key={submission.user_id}
            className="p-2 bg-gray-50 rounded-md flex justify-between items-center"
          >
            <div>
              <p className="text-sm">{submission.full_name}</p>
              <p className="text-xs text-gray-500">
                Avg Score:{" "}
                <span className="font-semibold">{userAverageScore}%</span>
              </p>
            </div>
            <p className="text-sm font-semibold">
              {submission.total_score}/{submission.max_score}
            </p>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!feedbackData.length}
                >
                  View Feedback
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Feedback for {submission.full_name}
                  </AlertDialogTitle>
                </AlertDialogHeader>
                <AlertDialogDescription className="whitespace-pre-wrap text-sm text-gray-800 max-h-64 overflow-y-auto">
                  {feedbackData.length > 0 ? (
                    feedbackData.map((feedback, index) => (
                      <div key={index} className="mb-4">
                        <p>
                          <strong>Question:</strong> {feedback.questionText}
                        </p>
                        <p>
                          <strong>LLM Feedback:</strong> {feedback.llmFeedback}
                        </p>
                        <p>
                          <strong>Syntax Analysis:</strong>{" "}
                          {feedback.syntaxAnalysis}
                        </p>
                        <p>
                          <strong>PMD Feedback:</strong> {feedback.pmdFeedback}
                        </p>
                        <p>
                          <strong>Overall Feedback:</strong>{" "}
                          {feedback.overallFeedback}
                        </p>
                        <hr className="my-2" />
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
          </div>
        );
      })}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        Loading analytics...
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>Error loading analytics: {error}</AlertDescription>
      </Alert>
    );
  }
  const averageScore =
    analyticsData.submissions.length > 0
      ? (
          analyticsData.submissions.reduce(
            (acc, sub) => acc + ((sub.total_score / sub.max_score) * 100 || 0),
            0
          ) / analyticsData.submissions.length
        ).toFixed(1)
      : 0;

  const averageTimeSpent =
    analyticsData.submissions.length > 0
      ? Math.round(
          analyticsData.submissions.reduce(
            (acc, sub) => acc + (sub.time_spent || 0),
            0
          ) / analyticsData.submissions.length
        )
      : 0;

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="cheating">Cheating Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Submissions
                </CardTitle>
                <UserCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analyticsData.submissions.length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Average Score
                </CardTitle>
                <UserCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{averageScore}%</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Avg Time Spent
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{averageTimeSpent} min</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Cheating Alerts
                </CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analyticsData.cheatingStats.length}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="p-4">
            <CardTitle className="mb-4">Score Distribution</CardTitle>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData.submissions}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="full_name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total_score" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-4">
            <CardTitle className="mb-4">Exam Participants</CardTitle>
            <div className="mt-4">
              <h3 className="text-sm font-semibold mb-2">All Participants:</h3>
              {renderParticipantList()}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card className="p-4">
            <CardTitle className="mb-4">Individual Performance</CardTitle>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analyticsData.submissions}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="submission_date" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="total_score"
                    stroke="#8884d8"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="cheating" className="space-y-4">
          <Card className="p-4">
            <CardTitle className="mb-4">Detected Issues</CardTitle>
            <div className="space-y-4">
              {analyticsData.cheatingStats.map((stat) => (
                <div
                  key={stat.id}
                  className="p-4 bg-gray-50 rounded-md border-l-4 border-amber-500"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium">{stat.full_name}</span>
                    <span className="text-sm text-gray-500">
                      {new Date(stat.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Copy Percentage:</p>
                      <p className="font-semibold">{stat.copy_percentage}%</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Time Away:</p>
                      <p className="font-semibold">
                        {stat.time_spent_away} seconds
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Risk Level:</p>
                      <p className="font-semibold">{stat.cheat_risk_level}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4">
              <CardTitle className="mb-4">Risk Level Distribution</CardTitle>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData.riskLevels}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="level" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-4">
              <CardTitle className="mb-4">Copy Percentage Over Time</CardTitle>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analyticsData.cheatingStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="timestamp"
                      tickFormatter={(value) =>
                        new Date(value).toLocaleDateString()
                      }
                    />
                    <YAxis />
                    <Tooltip
                      labelFormatter={(value) =>
                        new Date(value).toLocaleString()
                      }
                      formatter={(value) => [`${value}%`, "Copy Percentage"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="copy_percentage"
                      stroke="#82ca9d"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;
