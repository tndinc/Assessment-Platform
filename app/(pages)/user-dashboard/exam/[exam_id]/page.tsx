"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Check, Clock, Info } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useParams } from "next/navigation";
import JavaCompiler from "./components/JavaCompiler";

const supabase = createClient();

interface Question {
  id: number;
  question_txt: string;
  exam_id: number;
  points: number;
  type: string;
  question_type: "text" | "java"; // Add this field to your question_tbl2
  initial_code?: string; // Add this field for programming questions
}

interface Exam {
  exam_id: number;
  course_id: number;
  exam_title: string;
  exam_desc: string; // Updated from exam_dec to exam_desc
  exam_time_limit: number;
  exam_points: number;
  exam_created_by: string;
  status: string;
  subject: string;
  deadline: string;
}

export default function QuizPage() {
  const params = useParams();
  const examId = params.exam_id as string;

  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showInstructions, setShowInstructions] = useState(true);
  const [loading, setLoading] = useState(true);

  //java compiler
  const [compilationResults, setCompilationResults] = useState<{
    [key: number]: { output: string; memory: string; cpuTime: string };
  }>({});

  useEffect(() => {
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

        setExam(examData);
        setQuestions(questionData);
        setAnswers(Array(questionData.length).fill(""));
        setTimeRemaining(examData.exam_time_limit * 60); // Convert minutes to seconds
        setLoading(false);
      } catch (error) {
        console.error("Error fetching exam data:", error);
        setLoading(false);
      }
    }

    fetchExamData();
  }, [examId]);

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
  const handleAnswer = (answer: string, compileResult?: any) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answer;
    setAnswers(newAnswers);

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
    (answers.filter((a) => a.trim() !== "").length / questions.length) * 100;

  const allAnswered = answers.every((answer) => answer.trim() !== "");

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-400 via-blue-500 to-indigo-600 flex justify-center items-center">
        <div className="text-white text-xl">Loading exam...</div>
      </div>
    );
  }

  if (!exam || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-400 via-blue-500 to-indigo-600 flex justify-center items-center">
        <div className="text-white text-xl">Exam not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-400 via-blue-500 to-indigo-600 flex flex-col justify-center items-center p-4">
      <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
      <motion.div
        className="w-full max-w-2xl bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden relative z-10"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {showInstructions ? (
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Exam Instructions
            </h2>
            <div className="text-gray-700 space-y-2 mb-6">
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
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <motion.h1
                  className="text-3xl font-bold text-gray-800"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {exam.exam_title}
                </motion.h1>
                <div className="flex items-center space-x-2 text-gray-600">
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
                          : answers[index].trim() !== ""
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
                    <span className="text-sm font-medium text-gray-600">
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
                      {questions[currentQuestion].question_type === "java" && (
                        <span className="text-sm font-medium text-white px-2 py-1 rounded-full bg-blue-600">
                          Java
                        </span>
                      )}
                    </div>
                  </div>
                  <h2 className="text-xl font-semibold mb-4 text-gray-800">
                    {questions[currentQuestion].question_txt}
                  </h2>

                  {questions[currentQuestion].question_type === "java" ? (
                    <div className="space-y-4">
                      <JavaCompiler
                        value={
                          answers[currentQuestion] ||
                          questions[currentQuestion].initial_code ||
                          ""
                        }
                        onChange={(code) => handleAnswer(code)}
                        onCompileSuccess={(result) =>
                          handleAnswer(answers[currentQuestion], result)
                        }
                      />
                      {compilationResults[currentQuestion] && (
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
                    </div>
                  ) : (
                    <textarea
                      className="w-full h-40 p-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all duration-300 resize-none text-gray-800 bg-white/50 backdrop-blur-sm"
                      value={answers[currentQuestion]}
                      onChange={(e) => handleAnswer(e.target.value)}
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
                <motion.button
                  className="px-4 py-2 bg-blue-500 rounded-full text-white font-semibold flex items-center hover:bg-blue-600 transition-colors"
                  onClick={nextQuestion}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={currentQuestion === questions.length - 1}
                >
                  Next <ChevronRight size={20} className="ml-1" />
                </motion.button>
              </div>
            </div>
            <motion.div
              className="bg-gray-100/80 backdrop-blur-sm p-4 flex justify-between items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <button
                className="text-gray-600 hover:text-gray-800 transition-colors flex items-center"
                onClick={() => setShowInstructions(true)}
              >
                <Info size={20} className="mr-1" /> Instructions
              </button>
              <motion.button
                className={`px-6 py-2 rounded-full text-white font-semibold flex items-center ${
                  allAnswered
                    ? "bg-teal-500 hover:bg-teal-600"
                    : "bg-gray-400 cursor-not-allowed"
                } transition-colors`}
                disabled={!allAnswered}
                whileHover={allAnswered ? { scale: 1.05 } : {}}
                whileTap={allAnswered ? { scale: 0.95 } : {}}
              >
                Submit <Check size={20} className="ml-2" />
              </motion.button>
            </motion.div>
          </>
        )}
      </motion.div>
    </div>
  );
}
