"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Check, Clock, Info } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useParams } from "next/navigation";
import JavaCompiler from "./components/JavaCompiler";
import FeedbackPage from "./components/Feedback";
import { User } from "@supabase/supabase-js";
import DashboardButton from "./components/DashboardButton";

const supabase = createClient();

interface Question {
  id: number;
  question_txt: string;
  exam_id: number;
  points: number;
  type: string;
  question_type: "text" | "java";
  initial_code?: string;
}

interface Exam {
  exam_id: number;
  course_id: number;
  exam_title: string;
  exam_desc: string;
  exam_time_limit: number;
  exam_points: number;
  exam_created_by: string;
  status: string;
  subject: string;
  deadline: string;
}

interface Answer {
  questionId: number;
  code: string;
  explanation?: string; // Make explanation optional
}

type Difficulty = "easy" | "medium" | "hard"; // Type for valid difficulty levels

export default function QuizPage() {
  const params = useParams();
  const examId = params.exam_id as string;

  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showInstructions, setShowInstructions] = useState(true);
  const [loading, setLoading] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [examScore, setExamScore] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [user, setUser] = useState<User | null | undefined>(undefined); // Initialize as `undefined` to indicate loading
  const [copyAttemptsPerQuestion, setCopyAttemptsPerQuestion] = useState<{
    [key: number]: number;
  }>({});
  const [timeAwayStart, setTimeAwayStart] = useState<number | null>(null);
  const [timeSpentAway, setTimeSpentAway] = useState<number>(0);

  const [submissionId, setSubmissionId] = useState(null);

  const navigateToDashboard = () => {
    router.push("/user-dashboard");
  };
  // ✅ Track time away
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTimeAwayStart(Date.now());
      } else if (timeAwayStart) {
        const timeAwayDuration = Math.floor(
          (Date.now() - timeAwayStart) / 60000
        ); // minutes
        setTimeSpentAway((prev) => prev + timeAwayDuration);
        setTimeAwayStart(null);
        console.log(
          `🕒 User returned after ${timeAwayDuration} minute(s) away`
        );
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [timeAwayStart]);

  const determineCheatRisk = (
    copyPercentage: number,
    timeAwayMinutes: number
  ): string => {
    if (copyPercentage >= 25 || timeAwayMinutes > 10) return "High";
    if (copyPercentage >= 15 || timeAwayMinutes > 5) return "Medium";
    return "Low";
  };

  const [compilationResults, setCompilationResults] = useState<{
    [key: number]: { output: string; memory: string; cpuTime: string };
  }>({});

  const isValidJavaCode = (code: string): boolean => {
    const javaClassPattern = /public\s+class\s+\w+\s*{/; // `public class ClassName {`
    const javaMainPattern =
      /public\s+static\s+void\s+main\s*\(\s*String\[\]\s+\w+\s*\)/; // `public static void main(String[] args)`

    return javaClassPattern.test(code) && javaMainPattern.test(code);
  };

  const [invalidAnswers, setInvalidAnswers] = useState<{
    [key: number]: boolean;
  }>({});

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      const totalQuestions = questions.length;
      const copiedQuestions = Object.keys(copyAttemptsPerQuestion).length;
      const copyPercentage = (copiedQuestions / totalQuestions) * 100;

      // ✅ Determine risk based on copy percentage & time spent away
      const cheatRiskLevel = determineCheatRisk(copyPercentage, timeSpentAway);

      console.log("🕵️ Cheating Detection:", {
        copiedQuestions,
        copyPercentage: copyPercentage.toFixed(2),
        timeSpentAway,
        cheatRiskLevel,
      });

      // ✅ Insert cheating log with time_spent_away directly
      if (
        (copyPercentage > 0 || timeSpentAway > 0) &&
        cheatRiskLevel !== "Low"
      ) {
        await supabase.from("cheating_logs").insert({
          user_id: user.id,
          exam_id: parseInt(examId),
          copy_percentage: copyPercentage.toFixed(2),
          time_spent_away: timeSpentAway, // ✅ Directly added here
          cheat_risk_level: cheatRiskLevel,
          timestamp: new Date().toISOString(),
        });
        console.log("🚨 Cheating log recorded with time spent away.");
      } else {
        console.log("✅ No suspicious activity detected.");
      }

      // ✅ Validate Java code before submission
      const invalidAnswers = answers.filter(
        (answer) =>
          questions.find((q) => q.id === answer.questionId)?.question_type ===
            "java" && !isValidJavaCode(answer.code) // Check only Java questions
      );

      if (invalidAnswers.length > 0) {
        alert(
          "❌ Some Java answers are not correctly formatted! Please check and fix them."
        );
        setIsSubmitting(false);
        return; // Stop submission if any Java code is invalid
      }

      // ✅ Continue with normal submission
      const { data: submissionData, error: submissionError } = await supabase
        .from("exam_submissions")
        .insert({
          user_id: user.id,
          exam_id: parseInt(examId),
          submission_date: new Date().toISOString(),
          time_spent: exam.exam_time_limit * 60 - timeRemaining,
          answers: JSON.stringify(answers),
        })
        .select("submission_id")
        .single();

      if (submissionError) throw submissionError;

      const submissionId = submissionData.submission_id;
      console.log("✅ Exam submitted with ID:", submissionId);

      setExamSubmitted(true);
      setShowFeedback(true);
      setSubmissionId(submissionId);
    } catch (error) {
      console.error("❌ Error submitting exam:", error);
      alert("There was an error submitting your exam. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchUserAndProfile = async () => {
      // Step 1: Get the authenticated user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        router.push("/"); // Redirect to home if there's an error or no user
        return;
      }

      // Step 2: Fetch the user's profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("user_section, status")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        router.push("/"); // Handle the error (e.g., redirect to home)
        return;
      }

      // Step 3: Redirect based on profile data
      if (!profile || !profile.user_section) {
        router.push("/agreements");
        return;
      }

      if (profile.status === "pending") {
        router.push("/confirmation");
        return;
      }

      if (profile.status === "rejected") {
        console.error("User status is rejected.");
        router.push("/");
        return;
      }

      // If the status is approved, allow access to the dashboard
      setUser(user);

      // Fetch exam data only if the user is approved
      fetchExamData();
    };

    async function fetchExamData() {
      try {
        // Fetch exam details
        const { data: examData, error: examError } = await supabase
          .from("exam_tbl")
          .select("*")
          .eq("exam_id", examId)
          .single();

        if (examError) throw examError;

        // Fetch questions
        const { data: questionData, error: questionError } = await supabase
          .from("question_tbl2")
          .select("*")
          .eq("exam_id", examId);

        if (questionError) throw questionError;

        // Sort questions by difficulty
        const sortedQuestions = questionData.sort((a, b) => {
          const difficultyOrder: { [key in Difficulty]: number } = {
            easy: 1,
            medium: 2,
            hard: 3,
          };

          return (
            difficultyOrder[a.type.toLowerCase() as Difficulty] - // Type assertion here
            difficultyOrder[b.type.toLowerCase() as Difficulty] // Type assertion here
          );
        });

        setExam(examData);
        setQuestions(sortedQuestions);
        setAnswers(
          sortedQuestions.map((q) => ({
            questionId: q.id,
            code: "",
            explanation: "",
          }))
        );
        setTimeRemaining(examData.exam_time_limit * 60);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching exam data:", error);
        setLoading(false);
      }
    }

    fetchUserAndProfile();
  }, [examId, router]);

  // ... (keep existing navigation functions)

  const getDifficultyColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "easy":
        return "bg-emerald-500";
      case "medium":
        return "bg-amber-500";
      case "hard":
        return "bg-rose-500";
      default:
        return "bg-gray-500";
    }
  };

  useEffect(() => {
    if (timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  // Modify handleAnswer to handle both text and Java answers
  const handleAnswer = (
    code: string,
    explanation?: string,
    compileResult?: any
  ) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = {
      questionId: questions[currentQuestion].id,
      code: code || "",
      explanation: explanation || "",
    };
    setAnswers(newAnswers);

    // ✅ Track if the current Java answer is invalid
    if (questions[currentQuestion].question_type === "java") {
      setInvalidAnswers((prev) => ({
        ...prev,
        [currentQuestion]: !isValidJavaCode(code),
      }));
    }

    if (compileResult) {
      setCompilationResults((prev) => ({
        ...prev,
        [currentQuestion]: {
          output: compileResult.output,
          memory: compileResult.memory,
          cpuTime: compileResult.cpuTime,
        },
      }));
    }
  };

  const navigateToQuestion = (index: number) => {
    setCurrentQuestion(index);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const progress =
    (answers.filter(
      (a) =>
        (a?.code?.trim() ?? "") !== "" || (a?.explanation?.trim() ?? "") !== ""
    ).length /
      questions.length) *
    100;
  const allAnswered = answers.every((answer) => {
    if (questions[answers.indexOf(answer)].question_type === "java") {
      return questions[answers.indexOf(answer)].initial_code
        ? true
        : answer.code.trim() !== "";
    }
    return answer.code.trim() !== "";
  });

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  if (loading) {
    return (
      <div
        className="min-h-screen bg-gradient-to-br from-teal-400 via-blue-500 to-indigo-600 
      dark:bg-gradient-to-br dark:from-[#27374D] dark:to-[#526D82]/30
      flex justify-center items-center"
      >
        <div className="text-white text-xl">Loading exam...</div>
      </div>
    );
  }

  if (!exam || questions.length === 0) {
    return (
      <div
        className="min-h-screen bg-gradient-to-br from-teal-400 via-blue-500 to-indigo-600 
      dark:bg-[#27374D] 
      flex justify-center items-center"
      >
        <div className="text-white text-xl">Exam not found</div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-400 via-blue-500 to-indigo-600 flex flex-col justify-center items-center p-4">
      <div class="absolute inset-0 bg-white/10"></div>
      <DashboardButton onClick={navigateToDashboard} />

      {/* Conditionally render based on submission status */}
      {showFeedback ? (
        <FeedbackPage
          examId={parseInt(examId)}
          userId={user.id}
          answers={answers}
          submissionId={submissionId}
        />
      ) : (
        <motion.div
          className="w-full max-w-2xl bg-white/80 dark:bg-[#27374D] backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden relative z-10"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {showInstructions ? (
            <div className="p-8">
              <h2 className="text-2xl font-bold dark:text-gray-200 text-gray-800 mb-4">
                Exam Instructions
              </h2>
              <div className="dark:text-gray-200 text-gray-700 space-y-2 mb-6">
                <div dangerouslySetInnerHTML={{ __html: exam.exam_desc }} />
                <ul className="list-disc list-inside mt-4">
                  <li>Time limit: {exam.exam_time_limit} minutes</li>
                  <li>Total questions: {questions.length}</li>
                  <li>Total points: {exam.exam_points}</li>
                </ul>
              </div>
              <button
                className="w-full px-6 py-2 bg-blue-500 text-white font-semibold rounded-full hover:bg-blue-600 transition-colors"
                onClick={() => setShowInstructions(false)}
              >
                Start Exam
              </button>
            </div>
          ) : (
            <>
              <div className="p-8 dark:bg-[#344C64]">
                <div className="flex justify-between items-center mb-6">
                  <motion.h1
                    className="text-3xl font-bold text-gray-800"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    {exam.exam_title}
                  </motion.h1>
                  <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-200">
                    <Clock size={20} />
                    <span className="font-semibold">
                      {formatTime(timeRemaining)}
                    </span>
                  </div>
                </div>
                <motion.div
                  className="h-2 bg-gray-200 rounded-full mb-6 overflow-hidden"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <motion.div
                    className="h-full bg-gradient-to-r from-teal-400 to-blue-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </motion.div>
                <div className="flex flex-wrap justify-center gap-2 mb-6">
                  {questions.map((_, index) => (
                    <motion.button
                      key={index}
                      className={`w-8 h-8 rounded-full font-semibold text-sm flex items-center justify-center
                        ${
                          currentQuestion === index
                            ? "bg-blue-500 text-white"
                            : (answers[index]?.code?.trim() || "") !== "" ||
                              (answers[index]?.explanation?.trim() || "") !== ""
                            ? "bg-teal-500 text-white"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      onClick={() => navigateToQuestion(index)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {index + 1}
                    </motion.button>
                  ))}
                </div>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentQuestion}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-200">
                        Question {currentQuestion + 1} of {questions.length}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-white px-2 py-1 rounded-full bg-blue-500">
                          Points: {questions[currentQuestion].points}
                        </span>
                        <span
                          className={`text-sm font-medium text-white px-2 py-1 rounded-full ${getDifficultyColor(
                            questions[currentQuestion].type
                          )}`}
                        >
                          {questions[currentQuestion].type}
                        </span>
                        {questions[currentQuestion].question_type ===
                          "java" && (
                          <span className="text-sm font-medium text-white px-2 py-1 rounded-full bg-blue-600">
                            Java
                          </span>
                        )}
                      </div>
                    </div>
                    <h2
                      className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200 select-text"
                      onCopy={() => {
                        const qId = questions[currentQuestion].id;
                        setCopyAttemptsPerQuestion((prev) => ({
                          ...prev,
                          [qId]: (prev[qId] || 0) + 1, // ✅ Increment copy count per question
                        }));
                        console.log(
                          `⚠️ User copied question ${currentQuestion + 1}`
                        );
                      }}
                    >
                      {questions[currentQuestion].question_txt}
                    </h2>

                    {questions[currentQuestion].question_type === "java" ? (
                      <div className="space-y-4">
                        {!questions[currentQuestion].initial_code ? (
                          <JavaCompiler
                            value={answers[currentQuestion].code}
                            onChange={(code) =>
                              handleAnswer(
                                code,
                                answers[currentQuestion].explanation
                              )
                            }
                            onCompileSuccess={(result) =>
                              handleAnswer(
                                answers[currentQuestion].code,
                                answers[currentQuestion].explanation,
                                result
                              )
                            }
                          />
                        ) : (
                          <div className="bg-gray-100 p-4 rounded-lg">
                            <pre className="whitespace-pre-wrap">
                              {questions[currentQuestion].initial_code}
                            </pre>
                          </div>
                        )}

                        {/* <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Explain your solution:
                          </label>
                          <textarea
                            className="w-full h-40 p-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all duration-300 resize-none text-gray-800 bg-white/50 backdrop-blur-sm"
                            value={answers[currentQuestion].explanation}
                            onChange={(e) =>
                              handleAnswer(
                                answers[currentQuestion].code,
                                e.target.value
                              )
                            }
                            placeholder="Explain your approach and solution here..."
                          />
                        </div> */}

                        {compilationResults[currentQuestion] &&
                          !questions[currentQuestion].initial_code && (
                            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                              <div className="text-sm text-gray-600">
                                <p>
                                  Memory used:{" "}
                                  {compilationResults[currentQuestion].memory}
                                </p>
                                <p>
                                  CPU time:{" "}
                                  {compilationResults[currentQuestion].cpuTime}
                                </p>
                              </div>
                            </div>
                          )}
                        {invalidAnswers[currentQuestion] && (
                          <div className="flex justify-center mt-2">
                            <button className="bg-red-500 text-white px-4 py-2 rounded-full font-semibold">
                              ❌ Fix Your Java Code Before Submitting
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <textarea
                        className="w-full h-40 p-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all duration-300 resize-none text-gray-800 bg-white/50 backdrop-blur-sm"
                        value={answers[currentQuestion].code}
                        onChange={(e) => handleAnswer(e.target.value, "")}
                        placeholder="Type your answer here..."
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
                <div className="flex justify-between mt-6">
                  <motion.button
                    className="px-4 py-2 bg-gray-200 rounded-full text-gray-700 font-semibold flex items-center hover:bg-gray-300 transition-colors"
                    onClick={prevQuestion}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={currentQuestion === 0}
                  >
                    <ChevronLeft size={20} className="mr-1" /> Previous
                  </motion.button>

                  {currentQuestion < questions.length - 1 && (
                    <motion.button
                      className="px-4 py-2 bg-blue-500 rounded-full text-white font-semibold flex items-center hover:bg-blue-600 transition-colors"
                      onClick={nextQuestion}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Next <ChevronRight size={20} className="ml-1" />
                    </motion.button>
                  )}
                </div>
              </div>
              <motion.div
                className="bg-gray-100/80 dark:bg-[#344C64] backdrop-blur-sm p-4 flex justify-between items-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <button
                  className="text-gray-600 hover:text-gray-800 dark:text-gray-200 transition-colors flex items-center"
                  onClick={() => setShowInstructions(true)}
                >
                  <Info size={20} className="mr-1" /> Instructions
                </button>
                <motion.button
                  className={`px-6 py-2 rounded-full text-white font-semibold flex items-center ${
                    allAnswered && !isSubmitting
                      ? "bg-teal-500 hover:bg-teal-600"
                      : "bg-gray-400 cursor-not-allowed"
                  } transition-colors`}
                  disabled={!allAnswered || isSubmitting}
                  whileHover={
                    allAnswered && !isSubmitting ? { scale: 1.05 } : {}
                  }
                  whileTap={allAnswered && !isSubmitting ? { scale: 0.95 } : {}}
                  onClick={handleSubmit}
                >
                  {isSubmitting ? (
                    "Submitting..."
                  ) : (
                    <>
                      Submit
                      <Check size={20} className="ml-2" />
                    </>
                  )}
                </motion.button>
              </motion.div>
            </>
          )}
        </motion.div>
      )}
    </div>
  );
}
