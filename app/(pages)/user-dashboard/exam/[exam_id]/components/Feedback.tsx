"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { motion } from "framer-motion";
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
import {
  AlertCircle,
  CheckCircle,
  Award,
  BookOpen,
  Code,
  PenTool,
  XCircle,
} from "lucide-react";

const supabase = createClient();

// OpenAI API configuration - this should be stored in environment variables in production
const OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

export default function FeedbackPage({ examId, userId, answers }) {
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [metricsData, setMetricsData] = useState([]);
  const [totalScore, setTotalScore] = useState(0);
  const [maxPossibleScore, setMaxPossibleScore] = useState(0);
  const [processingStatus, setProcessingStatus] = useState(
    "Analyzing your answers..."
  );

  useEffect(() => {
    if (!examId || !userId || !answers) return;

    async function fetchQuestionsAndGrade() {
      try {
        setLoading(true);

        // Fetch questions for this exam
        const { data: questionsData, error: questionsError } = await supabase
          .from("question_tbl2")
          .select("*")
          .eq("exam_id", examId);

        if (questionsError) throw questionsError;
        setQuestions(questionsData);

        // Calculate maximum possible score
        const maxScore = questionsData.reduce((sum, q) => sum + q.points, 0);
        setMaxPossibleScore(maxScore);

        // Check if feedback already exists
        const { data: existingFeedback, error: feedbackError } = await supabase
          .from("student_feedback")
          .select("*")
          .eq("user_id", userId)
          .eq("exam_id", examId)
          .single();

        if (!feedbackError && existingFeedback) {
          // If feedback exists, load it and sort by difficulty
          const parsedFeedback = JSON.parse(existingFeedback.feedback_data);
          const sortedFeedback = sortFeedbackByDifficulty(parsedFeedback);
          setFeedback(sortedFeedback);
          setTotalScore(existingFeedback.total_score);
          setMetricsData(JSON.parse(existingFeedback.metrics_data));
          setLoading(false);
          return;
        }

        // If no feedback exists, generate it
        await generateFeedback(questionsData, answers);
      } catch (error) {
        console.error("Error fetching data:", error);
        setProcessingStatus("Error analyzing answers. Please try again later.");
        setLoading(false);
      }
    }

    fetchQuestionsAndGrade();
  }, [examId, userId, answers]);

  // Helper function to sort feedback by difficulty
  const sortFeedbackByDifficulty = (feedbackItems) => {
    const difficultyOrder = { easy: 1, medium: 2, hard: 3 };

    return [...feedbackItems].sort((a, b) => {
      // Default to 'medium' if difficulty is not defined
      const diffA = a.difficulty?.toLowerCase() || "medium";
      const diffB = b.difficulty?.toLowerCase() || "medium";

      return difficultyOrder[diffA] - difficultyOrder[diffB];
    });
  };

  const generateFeedback = async (questions, answers) => {
    try {
      const feedbackResults = [];
      let totalPoints = 0;
      const metricsScores = {
        "Fundamentals of programming": 0,
        "Control Structures": 0,
        Arrays: 0,
      };
      const metricsMax = {
        "Fundamentals of programming": 0,
        "Control Structures": 0,
        Arrayss: 0,
      };

      // Process each question
      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        const answer = answers[i] || { code: "", explanation: "" };

        setProcessingStatus(
          `Analyzing question ${i + 1} of ${questions.length}...`
        );

        // Track metrics maximum possible points
        if (question.metrics) {
          const metrics = Array.isArray(question.metrics)
            ? question.metrics
            : [question.metrics];

          metrics.forEach((metric) => {
            if (metricsMax[metric] !== undefined) {
              metricsMax[metric] += question.points;
            }
          });
        }

        // Determine grading approach based on question type
        let gradingResult;

        if (question.question_type === "java") {
          gradingResult = await gradeJavaQuestion(question, answer);
        } else {
          gradingResult = await gradeTextQuestion(question, answer);
        }

        // Update total points
        totalPoints += gradingResult.points;

        // Update metrics scores - Fixed to use actual awarded points
        if (question.metrics) {
          const metrics = Array.isArray(question.metrics)
            ? question.metrics
            : [question.metrics];

          // Get the grading result first
          let gradingResult;
          if (question.question_type === "java") {
            gradingResult = await gradeJavaQuestion(question, answer);
          } else {
            gradingResult = await gradeTextQuestion(question, answer);
          }

          // Update total points
          totalPoints += gradingResult.points;

          metrics.forEach((metric) => {
            if (metricsMax[metric] !== undefined) {
              metricsMax[metric] += question.points; // Add maximum possible points
              metricsScores[metric] += gradingResult.points; // Add actual earned points
            }
          });
        }

        // Format the correct answer for display
        let correctAnswer = question.question_answer;
        try {
          if (
            typeof question.question_answer === "string" &&
            question.question_answer.trim().startsWith("{")
          ) {
            const parsedAnswer = JSON.parse(question.question_answer);
            correctAnswer = JSON.stringify(parsedAnswer, null, 2);
          }
        } catch (e) {
          console.error("Error parsing question_answer:", e);
        }

        feedbackResults.push({
          questionId: question.id,
          questionText: question.question_txt,
          questionType: question.question_type,
          difficulty: question.type,
          maxPoints: question.points,
          awardedPoints: gradingResult.points,
          feedback: gradingResult.feedback,
          code: answer.code || "",
          explanation: answer.explanation || "",
          correctAnswer: correctAnswer,
          isCorrect: gradingResult.points === question.points,
          initialCode: question.initial_code || null,
        });
      }

      // Sort feedback results by difficulty (easy to hard)
      const sortedFeedbackResults = sortFeedbackByDifficulty(feedbackResults);

      // Prepare metrics data for visualization
      const metricsChartData = Object.keys(metricsScores).map((metric) => ({
        name: metric,
        score: metricsScores[metric],
        maxScore: metricsMax[metric],
      }));

      // Store feedback in database
      await supabase.from("student_feedback").upsert({
        user_id: userId,
        exam_id: examId,
        total_score: totalPoints,
        max_score: maxPossibleScore,
        feedback_data: JSON.stringify(sortedFeedbackResults),
        metrics_data: JSON.stringify(metricsChartData),
        created_at: new Date().toISOString(),
      });

      setFeedback(sortedFeedbackResults);
      setTotalScore(totalPoints);
      setMetricsData(metricsChartData);
      setLoading(false);
    } catch (error) {
      console.error("Error generating feedback:", error);
      setProcessingStatus("Error analyzing answers. Please try again later.");
      setLoading(false);
    }
  };

  const gradeJavaQuestion = async (question, answer) => {
    try {
      // Validate OpenAI API key is present
      if (!OPENAI_API_KEY) {
        console.error("OpenAI API key is missing");
        return {
          points: Math.floor(question.points / 2), // Default to half points if API key missing
          feedback:
            "Automated grading is currently unavailable. Your answer has been assigned partial credit. Please contact your instructor for detailed feedback.",
        };
      }

      // Prepare the prompt for the OpenAI API
      const prompt = `
You are an expert Java programming teacher grading a student's answer.

QUESTION:
${question.question_txt}

EXPECTED ANSWER:
${question.question_answer || ""}

STUDENT'S ANSWER:
${answer.code || ""}

STUDENT'S EXPLANATION:
${answer.explanation || ""}

GRADING INSTRUCTIONS:
1. Grade on a scale of 0 to ${question.points} points.
2. Be fair and objective in your assessment.
3. Consider both code correctness and explanation quality.
4. Provide specific feedback on what was good and what needs improvement.
5. If the student's answer is completely wrong, explain what the correct approach would be.

FORMAT YOUR RESPONSE AS JSON:
{
  "points": [awarded points as a number],
  "feedback": [detailed feedback as a string with constructive criticism and praise where deserved]
}`;

      try {
        // Call OpenAI API
        const apiResponse = await fetch(
          "https://api.openai.com/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
              model: "gpt-4o", // or appropriate model
              messages: [
                {
                  role: "system",
                  content:
                    "You are an expert Java programming instructor providing objective feedback.",
                },
                { role: "user", content: prompt },
              ],
              temperature: 0.2,
            }),
          }
        );

        // Check if API call was successful
        if (!apiResponse.ok) {
          const errorData = await apiResponse.json();
          console.error("OpenAI API error:", errorData);
          throw new Error(
            `OpenAI API error: ${errorData.error?.message || "Unknown error"}`
          );
        }

        const result = await apiResponse.json();

        // Verify result has expected structure
        if (!result.choices || !result.choices[0]?.message?.content) {
          throw new Error("Unexpected API response format");
        }

        // Handle potential parsing issues
        try {
          const feedbackContent = JSON.parse(result.choices[0].message.content);

          // Validate response structure
          if (
            typeof feedbackContent.points !== "number" ||
            typeof feedbackContent.feedback !== "string"
          ) {
            throw new Error("Invalid response format from OpenAI API");
          }

          return {
            points: Math.min(
              Math.max(0, feedbackContent.points),
              question.points
            ),
            feedback: feedbackContent.feedback,
          };
        } catch (jsonError) {
          console.error("Error parsing OpenAI response:", jsonError);
          // Fallback to simple extraction if JSON parsing fails
          const content = result.choices[0].message.content;
          const pointsMatch = content.match(/points"?\s*:\s*(\d+)/);
          const feedbackMatch = content.match(
            /feedback"?\s*:\s*"(.+?)(?:"|$)/s
          );

          return {
            points: pointsMatch
              ? Math.min(parseInt(pointsMatch[1]), question.points)
              : Math.floor(question.points / 2),
            feedback: feedbackMatch
              ? feedbackMatch[1]
              : "Feedback extraction failed. Your answer has been graded based on general criteria.",
          };
        }
      } catch (apiCallError) {
        console.error("API call error:", apiCallError);
        // Implement fallback grading logic
        return implementFallbackGrading(question, answer);
      }
    } catch (error) {
      console.error("Error grading Java question:", error);
      return implementFallbackGrading(question, answer);
    }
  };

  const gradeTextQuestion = async (question, answer) => {
    try {
      // Validate OpenAI API key is present
      if (!OPENAI_API_KEY) {
        console.error("OpenAI API key is missing");
        return {
          points: Math.floor(question.points / 2), // Default to half points if API key missing
          feedback:
            "Automated grading is currently unavailable. Your answer has been assigned partial credit. Please contact your instructor for detailed feedback.",
        };
      }

      // Try to parse the question_answer if it's in JSON format
      let gradingCriteria = {};
      let expectedAnswer = question.question_answer;

      try {
        if (
          typeof question.question_answer === "string" &&
          question.question_answer.trim().startsWith("{")
        ) {
          const parsedAnswer = JSON.parse(question.question_answer);
          gradingCriteria = parsedAnswer;
          expectedAnswer = JSON.stringify(
            parsedAnswer.answer || parsedAnswer,
            null,
            2
          );
        }
      } catch (e) {
        // If parsing fails, use the raw question_answer
        console.log("Not a JSON answer format, using raw text");
      }

      // Prepare the prompt for the OpenAI API
      const prompt = `
You are an expert computer science teacher grading a student's answer.

QUESTION:
${question.question_txt}

EXPECTED ANSWER:
${expectedAnswer}

STUDENT'S ANSWER:
${answer.code || ""}

GRADING CRITERIA:
${JSON.stringify(gradingCriteria.grading_rubric || {}, null, 2)}

GRADING INSTRUCTIONS:
1. Grade on a scale of 0 to ${question.points} points.
2. Be fair and objective in your assessment.
3. Consider completeness, correctness, and clarity of the answer.
4. If JSON grading criteria is provided, use it as a guide.
5. Provide specific feedback on what was good and what needs improvement.

FORMAT YOUR RESPONSE AS JSON:
{
  "points": [awarded points as a number],
  "feedback": [detailed feedback as a string with constructive criticism and praise where deserved]
}`;

      try {
        // Call OpenAI API
        const apiResponse = await fetch(
          "https://api.openai.com/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
              model: "gpt-4o", // or appropriate model
              messages: [
                {
                  role: "system",
                  content:
                    "You are an expert computer science instructor providing objective feedback.",
                },
                { role: "user", content: prompt },
              ],
              temperature: 0.2,
            }),
          }
        );

        // Check if API call was successful
        if (!apiResponse.ok) {
          const errorData = await apiResponse.json();
          console.error("OpenAI API error:", errorData);
          throw new Error(
            `OpenAI API error: ${errorData.error?.message || "Unknown error"}`
          );
        }

        const result = await apiResponse.json();

        // Verify result has expected structure
        if (!result.choices || !result.choices[0]?.message?.content) {
          throw new Error("Unexpected API response format");
        }

        // Handle potential parsing issues
        try {
          const feedbackContent = JSON.parse(result.choices[0].message.content);

          // Validate response structure
          if (
            typeof feedbackContent.points !== "number" ||
            typeof feedbackContent.feedback !== "string"
          ) {
            throw new Error("Invalid response format from OpenAI API");
          }

          return {
            points: Math.min(
              Math.max(0, feedbackContent.points),
              question.points
            ),
            feedback: feedbackContent.feedback,
          };
        } catch (jsonError) {
          console.error("Error parsing OpenAI response:", jsonError);
          // Fallback to simple extraction if JSON parsing fails
          const content = result.choices[0].message.content;
          const pointsMatch = content.match(/points"?\s*:\s*(\d+)/);
          const feedbackMatch = content.match(
            /feedback"?\s*:\s*"(.+?)(?:"|$)/s
          );

          return {
            points: pointsMatch
              ? Math.min(parseInt(pointsMatch[1]), question.points)
              : Math.floor(question.points / 2),
            feedback: feedbackMatch
              ? feedbackMatch[1]
              : "Feedback extraction failed. Your answer has been graded based on general criteria.",
          };
        }
      } catch (apiCallError) {
        console.error("API call error:", apiCallError);
        // Implement fallback grading logic
        return implementFallbackGrading(question, answer);
      }
    } catch (error) {
      console.error("Error grading text question:", error);
      return implementFallbackGrading(question, answer);
    }
  };

  // New helper function for fallback grading when API calls fail
  const implementFallbackGrading = (question, answer) => {
    // Simple keyword matching for basic evaluation
    const keywordScore = calculateKeywordScore(question, answer);
    const calculatedPoints = Math.round((keywordScore / 100) * question.points);

    return {
      points: calculatedPoints,
      feedback: generateFallbackFeedback(question, answer, keywordScore),
    };
  };

  // Helper function to calculate a basic score based on keyword matching
  const calculateKeywordScore = (question, answer) => {
    const studentAnswer =
      (answer.code || "") + " " + (answer.explanation || "");

    if (!studentAnswer.trim()) {
      return 0; // No answer provided
    }

    // Extract potential keywords from question and expected answer
    const expectedAnswerText = question.question_answer || "";
    const combinedExpected = question.question_txt + " " + expectedAnswerText;

    // Extract keywords (simplified approach)
    const keywordRegex = /\b[A-Za-z]{3,}\b/g;
    const expectedKeywords = [
      ...new Set(combinedExpected.match(keywordRegex) || []),
    ];

    if (expectedKeywords.length === 0) {
      return 50; // If we can't extract keywords, default to partial credit
    }

    // Count matching keywords
    let matchCount = 0;
    for (const keyword of expectedKeywords) {
      if (studentAnswer.toLowerCase().includes(keyword.toLowerCase())) {
        matchCount++;
      }
    }

    // Calculate percentage of matching keywords
    const matchPercentage = (matchCount / expectedKeywords.length) * 100;

    // Apply length penalty if answer is too short compared to expected
    const lengthRatio =
      studentAnswer.length / Math.max(expectedAnswerText.length, 1);
    const lengthFactor = Math.min(Math.max(lengthRatio, 0.5), 1.5);

    return Math.min(matchPercentage * lengthFactor, 100);
  };

  // Helper function to generate basic feedback
  const generateFallbackFeedback = (question, answer, score) => {
    const studentAnswer = (answer.code || "").trim();

    if (!studentAnswer) {
      return "No answer was provided. Please review the material and try again.";
    }

    if (score >= 80) {
      return "Your answer demonstrates good understanding of the concepts. It covers most of the key points expected in a correct solution.";
    } else if (score >= 60) {
      return "Your answer shows partial understanding of the concepts. Consider reviewing the key principles related to this topic.";
    } else if (score >= 40) {
      return "Your answer addresses some aspects of the question, but misses several important concepts. Please review the course materials thoroughly.";
    } else {
      return "Your answer needs significant improvement. Please review the fundamental concepts covered in this section and try again.";
    }
  };

  // Custom tooltip component to fix potential object rendering issues
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 shadow-md rounded-md border border-gray-200">
          <p className="font-medium">{`${label}`}</p>
          <p className="text-blue-600">{`Points Earned: ${payload[0].value}`}</p>
          <p className="text-gray-600">{`Maximum Points: ${payload[1].value}`}</p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-400 via-blue-500 to-indigo-600 flex justify-center items-center">
        <div className="bg-white/80 backdrop-blur-md p-8 rounded-xl shadow-2xl text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-gray-800">
            {processingStatus}
          </h2>
          <p className="text-gray-600 mt-2">This may take a few minutes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-400 via-blue-500 to-indigo-600 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div
          className="bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden mb-8"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="p-8">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  Exam Feedback
                </h1>
                <p className="text-gray-600 mt-1">
                  Your performance analysis and personalized feedback
                </p>
              </div>
              <div className="mt-4 md:mt-0 bg-gray-100 p-4 rounded-xl flex items-center">
                <div className="mr-4">
                  <p className="text-gray-600 text-sm">Your Score</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {totalScore}/{maxPossibleScore}
                  </p>
                  <p className="text-gray-600 text-sm">
                    {Math.round((totalScore / maxPossibleScore) * 100)}% Overall
                  </p>
                </div>
                <div className="w-20 h-20 relative">
                  <svg viewBox="0 0 36 36" className="w-full h-full">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#E5E7EB"
                      strokeWidth="3"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#3B82F6"
                      strokeWidth="3"
                      strokeDasharray={`${
                        (totalScore / maxPossibleScore) * 100
                      }, 100`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Award size={24} className="text-blue-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Metrics Chart */}
            <div className="mb-8 p-6 bg-gray-50 rounded-xl">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Your Performance by Category
              </h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={metricsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, "dataMax"]} />{" "}
                    {/* Use dataMax to set scale based on maximum points */}
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="score" fill="#3B82F6" name="Points Earned" />
                    <Bar
                      dataKey="maxScore"
                      fill="#E5E7EB"
                      name="Maximum Points"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                {metricsData.map((metric) => (
                  <div
                    key={metric.name}
                    className="p-4 bg-white rounded-lg shadow"
                  >
                    <h3 className="font-medium text-gray-700 flex items-center">
                      {metric.name === "Fundamentals of programming" && (
                        <BookOpen size={18} className="mr-2 text-blue-500" />
                      )}
                      {metric.name === "Control Structures" && (
                        <PenTool size={18} className="mr-2 text-green-500" />
                      )}
                      {metric.name === "Arrays" && (
                        <Code size={18} className="mr-2 text-purple-500" />
                      )}
                      {metric.name}
                    </h3>
                    <p className="text-2xl font-bold mt-1">
                      {metric.score}/{metric.maxScore}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {((metric.score / metric.maxScore) * 100).toFixed(1)}% of
                      available points
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Question Feedback */}
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Detailed Feedback
            </h2>
            <div className="space-y-6">
              {feedback.map((item, index) => (
                <motion.div
                  key={item.questionId || index}
                  className="p-6 bg-white rounded-xl shadow"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-sm font-medium px-2 py-1 rounded bg-gray-200 text-gray-800 mr-2">
                        Question {index + 1}
                      </span>
                      <span
                        className={`text-sm font-medium px-2 py-1 rounded ${
                          item.difficulty === "easy"
                            ? "bg-emerald-100 text-emerald-800"
                            : item.difficulty === "medium"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {(item.difficulty || "").charAt(0).toUpperCase() +
                          (item.difficulty || "").slice(1)}
                      </span>
                      <span
                        className={`text-sm font-medium px-2 py-1 rounded ml-2 ${
                          item.questionType === "java"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-purple-100 text-purple-800"
                        }`}
                      >
                        {item.questionType === "java" ? "Java" : "Theory"}
                      </span>
                    </div>
                    <div className="flex items-center">
                      {item.isCorrect ? (
                        <CheckCircle
                          size={20}
                          className="text-green-500 mr-1"
                        />
                      ) : (
                        <XCircle size={20} className="text-red-500 mr-1" />
                      )}
                      <span className="text-lg font-bold">
                        {item.awardedPoints}/{item.maxPoints}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    {item.questionText}
                  </h3>

                  {/* Display student answer */}
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-700 mb-2">
                      Your Answer:
                    </h4>
                    {item.questionType === "java" ? (
                      <>
                        <div className="bg-gray-50 p-4 rounded-lg mb-2 overflow-x-auto">
                          <pre className="text-sm">{item.code || ""}</pre>
                        </div>
                        {item.explanation && (
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-800">
                              {item.explanation}
                            </p>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-800">
                          {item.code || ""}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Display correct answer if user is incorrect */}
                  {!item.isCorrect && (
                    <div className="mb-4">
                      <h4 className="font-medium text-green-700 mb-2 flex items-center">
                        <CheckCircle size={16} className="mr-1" /> Correct
                        Answer:
                      </h4>
                      {item.questionType === "java" ? (
                        <div className="bg-green-50 p-4 rounded-lg overflow-x-auto border-l-4 border-green-500">
                          <pre className="text-sm">
                            {typeof item.correctAnswer === "string"
                              ? item.correctAnswer
                              : JSON.stringify(item.correctAnswer, null, 2)}
                          </pre>
                        </div>
                      ) : (
                        <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                          <p className="text-sm text-gray-800">
                            {typeof item.correctAnswer === "string"
                              ? item.correctAnswer
                              : JSON.stringify(item.correctAnswer, null, 2)}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Display feedback */}
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">
                      Feedback:
                    </h4>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-800">
                        {item.feedback || "No feedback available."}
                      </p>
                    </div>
                  </div>

                  {/* If incorrect, show a clear message */}

                  {/* If incorrect, show a clear message */}
                  {!item.isCorrect && (
                    <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200 flex items-start">
                      <AlertCircle
                        size={20}
                        className="text-red-500 mr-2 flex-shrink-0 mt-0.5"
                      />
                      <p className="text-sm text-red-700">
                        Your answer is incorrect. Please review the correct
                        solution above and the provided feedback to understand
                        where you went wrong.
                      </p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
