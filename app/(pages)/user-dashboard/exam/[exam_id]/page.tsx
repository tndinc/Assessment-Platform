"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Check, Clock, Info } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useParams } from "next/navigation";

const supabase = createClient();

interface Question {
  id: number;
  question_txt: string;
  exam_id: number;
  points: number;
  type: string;
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

  const handleAnswer = (answer: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answer;
    setAnswers(newAnswers);
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
    <div className="min-h-screen flex flex-col relative bg-[#FEFAF6] dark:bg-[#092635]">
      {isSubmitted ? (
        <ExamFeedback {...feedbackData} />
      ) : (
        <ExamInterface exam_id={exam_id} onSubmit={handleExamSubmit} />
      )}
    </div>
  );
}

export default ExamPage;
