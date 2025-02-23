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
  Legend,
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
    metricsData: [], // New state for processed metrics data
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

  const processMetricsData = (metricsData) => {
    if (!metricsData) return [];
    try {
      const parsed =
        typeof metricsData === "string" ? JSON.parse(metricsData) : metricsData;
      return Object.entries(parsed).map(([concept, scores]) => ({
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

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);

        // First, fetch exam submissions with their answers
        const { data: submissions, error: submissionsError } = await supabase
          .from("exam_submissions")
          .select(
            `
            submission_id,
            user_id,
            exam_id,
            submission_date,
            time_spent,
            answers,
            status,
            profiles!exam_submissions_user_id_fkey (
              full_name,
              email,
              avatar_url
            )
          `
          )
          .eq("exam_id", examId);

        if (submissionsError) throw submissionsError;

        // Then fetch feedback data that matches these submissions
        const { data: feedbackData, error: feedbackError } = await supabase
          .from("student_feedback")
          .select(
            `
            id,
            user_id,
            exam_id,
            total_score,
            max_score,
            feedback_data,
            metrics_data,
            submission_id
          `
          )
          .eq("exam_id", examId);

        if (feedbackError) throw feedbackError;

        // Create a lookup object for feedback data using submission_id
        const feedbackLookup = feedbackData.reduce((acc, feedback) => {
          acc[feedback.submission_id] = feedback;
          return acc;
        }, {});

        // Process the submissions with feedback data
        const processedSubmissions = submissions.map((sub) => ({
          ...sub,
          full_name: sub.profiles?.full_name,
          answers: sub.answers, // Keep the answers from exam_submissions
          total_score: feedbackLookup[sub.submission_id]?.total_score || 0,
          max_score: feedbackLookup[sub.submission_id]?.max_score || 0,
          feedback_data:
            feedbackLookup[sub.submission_id]?.feedback_data || null,
          metrics_data: feedbackLookup[sub.submission_id]?.metrics_data || null,
        }));

        // Fetch cheating logs
        const { data: cheatingLogs, error: cheatingError } = await supabase
          .from("cheating_logs")
          .select(
            `
            *,
            profiles!cheating_logs_user_id_fkey (
              full_name
            )
          `
          )
          .eq("exam_id", examId);

        if (cheatingError) throw cheatingError;

        const processedCheatingLogs = cheatingLogs.map((log) => ({
          ...log,
          full_name: log.profiles?.full_name,
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
  const updateTotalScore = async (feedback) => {
    if (!feedback?.submission_id) {
      console.error("Error: feedback submission_id is missing", feedback);
      return;
    }

    console.log("Updating feedback:", feedback);

    const { error } = await supabase
      .from("student_feedback")
      .update({ total_score: feedback.total_score })
      .eq("submission_id", feedback.submission_id); // Use submission_id instead of id

    if (error) {
      console.error("Error updating score:", error.message);
      return;
    }

    // Update the state to reflect the new score
    setAnalyticsData((prevData) => ({
      ...prevData,
      submissions: prevData.submissions.map((sub) =>
        sub.submission_id === feedback.submission_id
          ? { ...sub, total_score: feedback.total_score }
          : sub
      ),
    }));

    setSelectedFeedback(null);
  };
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
        const metricsData = processMetricsData(submission.metrics_data);

        // Parse answers here
        const answers = (() => {
          try {
            const parsedAnswers =
              typeof submission.answers === "string"
                ? JSON.parse(submission.answers)
                : submission.answers;
            return Array.isArray(parsedAnswers) ? parsedAnswers : [];
          } catch (error) {
            console.error("Error parsing answers:", error);
            return [];
          }
        })();

        // Define the matching function here
        const getAnswerForQuestion = (questionId) => {
          const matchingAnswer = answers.find(
            (answer) => answer.questionId === questionId
          );
          return matchingAnswer ? matchingAnswer.code : "No answer submitted";
        };
        const updateTotalScore = async (feedback) => {
          const { error } = await supabase
            .from("student_feedback")
            .update({ total_score: feedback.total_score })
            .eq("id", feedback.id);

          if (error) {
            console.error("Error updating score:", error.message);
            return;
          }

          // Refresh data
          setAnalyticsData((prevData) => ({
            ...prevData,
            submissions: prevData.submissions.map((sub) =>
              sub.submission_id === feedback.submission_id
                ? { ...sub, total_score: feedback.total_score }
                : sub
            ),
          }));

          setSelectedFeedback(null);
        };

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
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!feedbackData.length && !metricsData.length}
                  >
                    View Details
                  </Button>
                </AlertDialogTrigger>

                <AlertDialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className="ml-2"
                    onClick={() => setSelectedFeedback(submission)}
                  >
                    Edit Grade
                  </Button>
                </AlertDialogTrigger>
              </AlertDialog>
              <AlertDialogContent className="max-w-4xl">
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Details for {submission.full_name}
                  </AlertDialogTitle>
                </AlertDialogHeader>

                <Tabs defaultValue="feedback" className="w-full">
                  <TabsList>
                    <TabsTrigger value="feedback">Feedback</TabsTrigger>
                    <TabsTrigger value="metrics">Metrics</TabsTrigger>
                  </TabsList>

                  <TabsContent value="feedback">
                    <div className="whitespace-pre-wrap text-sm text-gray-800 max-h-96 overflow-y-auto space-y-6">
                      {feedbackData.length > 0 ? (
                        feedbackData.map((feedback, index) => (
                          <div
                            key={index}
                            className="p-4 border rounded-lg bg-white"
                          >
                            <div className="space-y-4">
                              <div>
                                <h3 className="font-medium text-base">
                                  Question {index + 1}
                                </h3>
                                <p className="text-gray-600">
                                  {feedback.questionText}
                                </p>
                              </div>

                              <div className="bg-gray-50 p-4 rounded-md">
                                <h4 className="font-medium mb-2">
                                  Student's Answer:
                                </h4>
                                <pre className="bg-black text-white p-4 rounded-md overflow-x-auto">
                                  <code>
                                    {getAnswerForQuestion(feedback.questionId)}
                                  </code>
                                </pre>
                              </div>

                              <div className="space-y-2">
                                <div className="bg-blue-50 p-3 rounded-md">
                                  <p className="font-medium text-blue-700">
                                    LLM Feedback
                                  </p>
                                  <p className="text-blue-600">
                                    {feedback.llmFeedback}
                                  </p>
                                </div>

                                <div className="bg-green-50 p-3 rounded-md">
                                  <p className="font-medium text-green-700">
                                    Syntax Analysis
                                  </p>
                                  <p className="text-green-600">
                                    {feedback.syntaxAnalysis}
                                  </p>
                                </div>

                                <div className="bg-purple-50 p-3 rounded-md">
                                  <p className="font-medium text-purple-700">
                                    PMD Feedback
                                  </p>
                                  <p className="text-purple-600">
                                    {feedback.pmdFeedback}
                                  </p>
                                </div>

                                <div className="bg-orange-50 p-3 rounded-md">
                                  <p className="font-medium text-orange-700">
                                    Overall Feedback
                                  </p>
                                  <p className="text-orange-600">
                                    {feedback.overallFeedback}
                                  </p>
                                </div>
                              </div>
                            </div>
                            {index < feedbackData.length - 1 && (
                              <hr className="my-4" />
                            )}
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
                              <Bar
                                name="Score"
                                dataKey="score"
                                fill="#8884d8"
                              />
                              <Bar
                                name="Max Score"
                                dataKey="maxScore"
                                fill="#82ca9d"
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>

                        <div className="mt-4">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-gray-50">
                                <th className="text-left p-2">Concept</th>
                                <th className="text-right p-2">Score</th>
                                <th className="text-right p-2">Max Score</th>
                                <th className="text-right p-2">Percentage</th>
                              </tr>
                            </thead>
                            <tbody>
                              {metricsData.map((metric, index) => (
                                <tr key={index} className="border-t">
                                  <td className="p-2">{metric.concept}</td>
                                  <td className="text-right p-2">
                                    {metric.score}
                                  </td>
                                  <td className="text-right p-2">
                                    {metric.maxScore}
                                  </td>
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
        {selectedFeedback && (
          <AlertDialog
            open={true}
            onOpenChange={() => setSelectedFeedback(null)}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Edit Grade for {selectedFeedback.user_id}
                </AlertDialogTitle>
              </AlertDialogHeader>

              <div className="space-y-4">
                <label className="block">
                  <span className="text-sm font-medium">Total Score</span>
                  <input
                    type="number"
                    value={selectedFeedback.total_score}
                    onChange={(e) =>
                      setSelectedFeedback({
                        ...selectedFeedback,
                        total_score: Number(e.target.value),
                      })
                    }
                    className="w-full p-2 border rounded-md"
                  />
                </label>
              </div>

              <AlertDialogFooter>
                <Button onClick={() => updateTotalScore(selectedFeedback)}>
                  Save
                </Button>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

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
