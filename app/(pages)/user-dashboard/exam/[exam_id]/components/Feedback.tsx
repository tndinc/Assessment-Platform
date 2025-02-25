"use client";
import React from "react";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Award, BookOpen, PenTool, Code } from "lucide-react";

const supabase = createClient();

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
        <p className="font-bold">{label}</p>
        <p className="text-blue-600">Score: {payload[0].value}</p>
        <p className="text-gray-600">Maximum Score: {payload[1].value}</p>
      </div>
    );
  }
  return null;
};

export default function FeedbackPage({
  examId,
  userId,
  answers,
  submissionId,
}) {
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [metricsData, setMetricsData] = useState([]);
  const [totalScore, setTotalScore] = useState(0);
  const [maxPossibleScore, setMaxPossibleScore] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!examId || !userId || !answers || !submissionId) {
      setError("Missing required data");
      setLoading(false);
      return;
    }
    fetchQuestionsAndGrade();
  }, [examId, userId, answers, submissionId]);

  async function fetchQuestionsAndGrade() {
    try {
      setLoading(true);
      setError(null);

      // Fetch questions
      const { data: questionsData, error: questionsError } = await supabase
        .from("question_tbl2")
        .select("*")
        .eq("exam_id", examId);

      if (questionsError) throw questionsError;
      if (!questionsData || questionsData.length === 0) {
        throw new Error("No questions found for this exam");
      }

      // IMPORTANT FIX: Sort questions by difficulty to match QuizPage sort order
      const sortedQuestions = questionsData.sort((a, b) => {
        const difficultyOrder = { easy: 1, medium: 2, hard: 3 };
        const aDifficulty = a.type.toLowerCase();
        const bDifficulty = b.type.toLowerCase();
        return difficultyOrder[aDifficulty] - difficultyOrder[bDifficulty];
      });

      setQuestions(sortedQuestions);

      // Log the order for troubleshooting
      console.log(
        "Questions order:",
        sortedQuestions.map((q) => `ID: ${q.id}, Difficulty: ${q.type}`)
      );
      console.log("Answers:", answers);

      // Initialize metrics
      const initialMetrics = {};
      sortedQuestions.forEach((question) => {
        if (question.metrics) {
          const metrics = Array.isArray(question.metrics)
            ? question.metrics
            : [question.metrics];
          metrics.forEach((metric) => {
            if (!initialMetrics[metric]) {
              initialMetrics[metric] = { score: 0, maxScore: 0 };
            }
          });
        }
      });

      await generateFeedback(sortedQuestions, answers, initialMetrics);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(error.message);
      setLoading(false);
    }
  }

  async function generateFeedback(questions, answers, initialMetrics) {
    try {
      const feedbackResults = [];
      let totalScore = 0;
      let maxScore = 0;
      const metricsScores = { ...initialMetrics };

      // Process each question sequentially
      for (const question of questions) {
        // Find the matching answer by questionId
        const answer = answers.find((a) => a.questionId === question.id);

        // Debug log for troubleshooting
        console.log(
          `Processing Q${question.id}:`,
          answer ? `Found matching answer` : `No matching answer found!`
        );

        // If no matching answer found, create a default empty one
        const processedAnswer = answer || { code: "", explanation: "" };

        // Generate default feedback structure
        const defaultFeedback = {
          points: 0,
          llmFeedback: "No submission provided",
          syntaxAnalysis: "No code to analyze",
          pmdFeedback: "No code to analyze",
          criteriaScores: {
            "Code Correctness": 0,
            "Input Handling": 0,
            "Code Structure": 0,
            "Logic Functionality": 0
          },
          overallFeedback:
            "No submission to evaluate\nSuggestions for Improvement: Please submit your code for evaluation.",
        };

        // Only grade if there's actual code to evaluate
        let gradingResult = processedAnswer.code
          ? await gradeJavaQuestion(question, processedAnswer)
          : defaultFeedback;

        // Ensure we have all feedback fields
        gradingResult = {
          ...defaultFeedback,
          ...gradingResult,
        };

        // Update metrics scores
        if (question.metrics) {
          const metrics = Array.isArray(question.metrics)
            ? question.metrics
            : [question.metrics];
          metrics.forEach((metric) => {
            if (metricsScores[metric]) {
              metricsScores[metric].score += gradingResult.points;
              metricsScores[metric].maxScore += question.points;
            }
          });
        }

        totalScore += gradingResult.points;
        maxScore += question.points;

        // Build comprehensive feedback object
        feedbackResults.push({
          ...gradingResult,
          questionId: question.id,
          questionText: question.question_txt,
          questionType: question.question_type,
          difficulty: question.type,
          maxPoints: question.points,
          code: processedAnswer.code || "",
          correctAnswer: question.question_answer,
          isCorrect: gradingResult.points === question.points,
        });
      }

      // Save feedback to database
      try {
        await supabase.from("student_feedback").upsert({
          user_id: userId,
          exam_id: examId,
          submission_id: submissionId,
          total_score: totalScore,
          max_score: maxScore,
          feedback_data: JSON.stringify(feedbackResults),
          metrics_data: JSON.stringify(metricsScores),
          created_at: new Date().toISOString(),
        });
      } catch (dbError) {
        console.error("Error saving feedback to database:", dbError);
        // Continue execution even if database save fails
      }

      // Update state
      setFeedback(feedbackResults);
      setTotalScore(totalScore);
      setMaxPossibleScore(maxScore);
      setMetricsData(
        Object.entries(metricsScores).map(([name, data]) => ({ name, ...data }))
      );
      setLoading(false);
    } catch (error) {
      console.error("Error generating feedback:", error);
      setError("Failed to generate feedback for all questions");
      setLoading(false);
    }
  }

  async function gradeJavaQuestion(question, answer) {
    try {
      const response = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentCode: answer.code,
          question: question.question_txt,
          expectedAnswer: question.question_answer,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const evaluation = await response.json();

      // Calculate points based on LLM's correct/incorrect signal
      let points = 0;

      // Check if the submission contains Java code
      const hasJavaCode =
        answer.code &&
        (answer.code.includes("class") ||
          answer.code.includes("public") ||
          answer.code.includes("private") ||
          answer.code.includes("void") ||
          answer.code.includes("int") ||
          answer.code.includes("String") ||
          answer.code.includes("boolean"));

      // If no Java code submitted, give 0 points
      if (!hasJavaCode) {
        points = 0;
      }
      // If correct Java implementation, give full points
      else if (
        evaluation.llmFeedback.toLowerCase().includes("correct") &&
        !evaluation.llmFeedback.toLowerCase().includes("incorrect")
      ) {
        points = question.points;
      }
      // If close implementation (similar logic/approach but with minor issues)
      else if (
        evaluation.llmFeedback.toLowerCase().includes("close") ||
        evaluation.llmFeedback.toLowerCase().includes("almost correct") ||
        evaluation.llmFeedback.toLowerCase().includes("partially correct")
      ) {
        points = Math.round(question.points * 0.7); // 70% of full points
      }
      // If submission is Java code but not close to correct implementation
      else {
        points = Math.round(question.points * 0.4); // 40% of full points for an attempt
      }

      return {
        points,
        ...evaluation,
      };
    } catch (error) {
      console.error("Error grading Java question:", error);
      return {
        points: 0,
        llmFeedback: "⚠️ An error occurred while grading: " + error.message,
        syntaxAnalysis: "⚠️ Unable to analyze syntax",
        pmdFeedback: "⚠️ Unable to perform PMD analysis",
        criterionFeedback: {
          Error: "Failed to evaluate submission",
          Status: "Please try submitting again",
        },
        overallFeedback:
          "⚠️ An error occurred during evaluation\nSuggestions for Improvement: Please try submitting your code again.",
      };
    }
  }

  if (error) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 dark:border-gray-200"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen dark:bg-[#344C64]">
      <div className="bg-white/80 dark:bg-[#344C64] backdrop-blur-md rounded-2xl shadow-2xl">
        <div className="p-8 border-4">
          {/* Score Header Section */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-[#67C6E3]">
                Exam Feedback
              </h1>
              <p className="text-gray-600 mt-1 dark:text-gray-300">
                Your performance analysis and personalized feedback
              </p>
            </div>
            <div className="mt-4 md:mt-0 bg-gray-100 dark:bg-[#27374D] p-4 rounded-xl flex items-center">
              <div className="mr-4">
                <p className="text-gray-600 dark:text-gray-200 text-sm">Your Score</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-[#37B7C3]">
                  {totalScore}/{maxPossibleScore}
                </p>
                <p className="text-gray-600 dark:text-gray-200 text-sm">
                  {((totalScore / maxPossibleScore) * 100).toFixed(1)}% Overall
                </p>
              </div>
              <div className="w-20 h-20 relative">
                <svg viewBox="0 0 36 36" className="w-full h-full">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#088395"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#37B7C3"
                    strokeWidth="3"
                    strokeDasharray={`${
                      (totalScore / maxPossibleScore) * 100
                    }, 100`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Award className="text-blue-600 dark:text-[#37B7C3]" size={24} />
                </div>
              </div>
            </div>
          </div>

          {/* Metrics Chart */}
          <div className="mb-8 p-6 bg-gray-50 dark:bg-[#27374D] rounded-xl">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">
              Score Distribution
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metricsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="score" fill="#87CBB9" name="Points Earned" />
                  <Bar
                    dataKey="maxScore"
                    fill="#0E8388"
                    name="Maximum Points"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Detailed Feedback Section */}
          <Card className="shadow-lg dark:bg-[#27374D]">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 dark:text-gray-200">
                Question Feedback
              </h2>
              <Tabs defaultValue="1" className="w-full">
                <TabsList className="flex flex-wrap justify-center gap-2 mb-4 rounded-lg bg-transparent">
                  {feedback.map((_, index) => (
                    <TabsTrigger
                      key={index}
                      value={`${index + 1}`}
                      className="text-sm px-4 py-2 rounded-md border border-gray-300 bg-white dark:bg-[#344C64] shadow-sm hover:bg-gray-200 transition"
                    >
                      Q{index + 1}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {feedback.map((item, index) => (
                  <TabsContent key={index} value={`${index + 1}`}>
                    <div className="space-y-6">
                      <div className="p-4 bg-blue-50 rounded-lg dark:bg-[#344C64]">
                        <h4 className="font-semibold">Question:</h4>
                        <p>{item.questionText}</p>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 ">
                        <div className="p-4 bg-gray-50 rounded-lg dark:bg-[#344C64]">
                          <h4 className="font-semibold">Your Answer:</h4>
                          <pre className="mt-2 whitespace-pre-wrap">
                            {item.code}
                          </pre>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg dark:bg-[#344C64]">
                          <h4 className="font-semibold">Expected Answer:</h4>
                          <pre className="mt-2 whitespace-pre-wrap">
                            {item.correctAnswer}
                          </pre>
                        </div>
                      </div>

                      <div className="p-4 bg-blue-50 dark:bg-[#4C6793] rounded-lg">
                        <h4 className="text-lg font-bold text-blue-400">
                          🤖 LLM Feedback:
                        </h4>
                        <pre className="mt-2 whitespace-pre-wrap">
                          {item.llmFeedback}
                        </pre>
                      </div>

                      <div className="p-4 bg-green-50 dark:bg-[#697565] rounded-lg">
                        <h4 className="text-lg font-bold text-green-400">
                          📄 Syntax Analysis:
                        </h4>
                        <pre className="mt-2 whitespace-pre-wrap">
                          {item.syntaxAnalysis}
                        </pre>
                      </div>

                      <div className="p-4 bg-yellow-50 dark:bg-[#957777] rounded-lg">
                        <h4 className="text-lg font-bold text-yellow-400">
                          🛠️ PMD Feedback:
                        </h4>
                        <pre className="mt-2 whitespace-pre-wrap">
                          {item.pmdFeedback}
                        </pre>
                      </div>

                      <div className="p-4 bg-purple-50 dark:bg-[#6D5D6E] rounded-lg">
                        <h4 className="text-lg font-bold text-purple-400">
                          🎓 Graded Criteria:
                        </h4>
                        <ul className="mt-2 list-disc pl-5">
                          {Object.entries(item.criteriaScores || {}).map(
                            ([criteria, score]) => (
                              <li key={criteria}>
                                <strong>
                                  {criteria.replace(/([A-Z])/g, " $1")}:
                                </strong>{" "}
                                {score}/5 {" "}
                                {score >= 4 ? "✅" : "⚠️"}
                              </li>
                            )
                          )}
                        </ul>
                      </div>

                      {item.overallFeedback && (
                      <div className="p-4 bg-gray-50 dark:bg-[#395B64] rounded-lg">
                        <h4 className="mt-4 text-lg font-bold">📊 Overall Feedback:</h4>
                        <ul className="list-none pl-0 text-gray-800 dark:text-white space-y-2">
                          {item.overallFeedback &&
                            typeof item.overallFeedback === "string" &&
                            item.overallFeedback.split("\n").map((feedback, idx) => {
                              if (feedback.includes("Overall Summary:")) {
                                return (
                                  <li key={idx} className="flex items-start gap-2 text-green-600">
                                    ✅{" "}
                                      <span>
                                        <strong>Overall Summary:</strong>{" "}
                                        {feedback
                                          .replace("Overall Summary:", "")
                                          .trim()}

                                      </span>
                                    </li>
                                  );
                                }
                                if (feedback.includes("Strengths:")) {
                                  return (
                                    <li
                                      key={idx}
                                      className="flex items-start gap-2 text-green-600"
                                    >
                                      ✅{" "}
                                      <span>
                                        <strong>Strengths:</strong>{" "}
                                        {feedback
                                          .replace("Strengths:", "")
                                          .trim()}
                                      </span>
                                    </li>
                                  );
                                }
                                if (
                                  feedback.includes(
                                    "Weaknesses & Suggestions for Improvement:"
                                  )
                                ) {
                                  return (
                                    <li
                                      key={idx}
                                      className="flex items-start gap-2 text-yellow-600"
                                    >
                                      ⚠️{" "}
                                      <span>
                                        <strong>
                                          Weakness & Suggestions for
                                          Improvement:
                                        </strong>{" "}
                                        {feedback
                                          .replace(
                                            "Weaknesses & Suggestions for Improvement:",
                                            ""
                                          )
                                          .trim()}
                                      </span>
                                    </li>
                                  );
                                }
                                if (feedback.includes("Final Thoughts:")) {
                                  return (
                                    <li
                                      key={idx}
                                      className="flex items-start gap-2 text-blue-500"
                                    >
                                      🎓{" "}
                                      <span>
                                        <strong>Final Thoughts:</strong>{" "}
                                        {feedback
                                          .replace("Final Thoughts:", "")
                                          .trim()}
                                      </span>
                                    </li>
                                  );
                                }
                                return (
                                  <li key={idx} className="text-gray-700 dark:text-gray-200">
                                    {feedback}
                                  </li>
                                );
                              })}
                          </ul>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
