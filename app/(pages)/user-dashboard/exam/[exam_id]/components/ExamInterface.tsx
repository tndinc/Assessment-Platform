"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import ExamHeader from "./ExamHeader";
import QuestionNavigation from "./QuestionNavigation";
import QuestionDisplay from "./QuestionsDisplay";
import ProgressBar from "./ProgressBar";
import SubmitButton from "./SubmitButton";
import Loading from "@/components/Loading";
import { User } from "@supabase/supabase-js";

interface ExamInterfaceProps {
  exam_id: string;
  onSubmit: (
    score: number,
    topicScores: Record<string, { score: number; total: number }>,
    answers: Record<number, any>,
    questions: any[]
  ) => void;
}

interface CheatingLog {
  user_id: string;
  exam_id: number;
  copy_percentage: number;
  time_spent_away: number;
  cheat_risk_level: "Low" | "Medium" | "High";
  timestamp: string;
}

const ExamInterface = ({ exam_id, onSubmit }: ExamInterfaceProps) => {
  const supabase = createClient();
  const [examData, setExamData] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copyStats, setCopyStats] = useState<Record<number, number>>({});
  const [timeSpentAway, setTimeSpentAway] = useState(0);
  const [awayStartTime, setAwayStartTime] = useState<number | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();
        if (error) throw error;
        setUser(user);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const fetchExamData = async () => {
      try {
        setIsLoading(true);
        const { data: exam, error: examError } = await supabase
          .from("exam_tbl")
          .select("*")
          .eq("exam_id", exam_id)
          .single();
        if (examError) throw examError;
        setExamData(exam);
        setTimeRemaining(exam.exam_time_limit * 60);

        const { data: topics, error: topicsError } = await supabase
          .from("topic_tbl")
          .select("topic_id, topic_title")
          .eq("exam_id", exam_id);
        if (topicsError) throw topicsError;
        const topicIds = topics.map((topic) => topic.topic_id);

        const { data: questions, error: questionsError } = await supabase
          .from("question_tbl")
          .select(
            "question_id, question_desc, question_points, topic_id, question_answer"
          )
          .in("topic_id", topicIds);
        if (questionsError) throw questionsError;

        const questionIds = questions.map((q) => q.question_id);
        const { data: choices, error: choicesError } = await supabase
          .from("choices_tbl")
          .select("question_id, question_txt")
          .in("question_id", questionIds);
        if (choicesError) throw choicesError;

        const questionsWithChoices = questions.map((q, index) => ({
          ...q,
          number: index + 1,
          topic_title:
            topics.find((t) => t.topic_id === q.topic_id)?.topic_title ||
            `Topic ${q.topic_id}`,
          choices: choices.filter((c) => c.question_id === q.question_id),
        }));

        setQuestions(questionsWithChoices);
      } catch (err) {
        console.error("Error fetching exam data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExamData();
  }, [exam_id]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prevTime) => {
        if (prevTime <= 0) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleCopy = (event: ClipboardEvent) => {
      const selection = window.getSelection()?.toString().trim();
      if (selection && questions[currentQuestion - 1]) {
        const questionId = questions[currentQuestion - 1].question_id;
        setCopyStats((prevStats) => ({
          ...prevStats,
          [questionId]: (prevStats[questionId] || 0) + 1,
        }));
      }
    };

    document.addEventListener("copy", handleCopy);
    return () => document.removeEventListener("copy", handleCopy);
  }, [currentQuestion, questions]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setAwayStartTime(Date.now());
      } else if (awayStartTime) {
        const timeAway = Math.floor((Date.now() - awayStartTime) / 1000);
        setTimeSpentAway((prev) => prev + timeAway);
        setAwayStartTime(null);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [awayStartTime]);

  const calculateCheatRisk = (
    copyPercentage: number,
    timeAway: number
  ): "Low" | "Medium" | "High" => {
    // Convert time away to minutes for easier calculation
    const timeAwayMinutes = timeAway / 60;

    // Risk based on copy percentage
    if (copyPercentage > 75) return "High";
    if (copyPercentage > 50) return "Medium";

    // Risk based on time away
    if (timeAwayMinutes > 10) return "High";
    if (timeAwayMinutes > 5) return "Medium";

    // Combined risk assessment
    if (copyPercentage > 25 && timeAwayMinutes > 3) return "Medium";
    if (copyPercentage > 40 && timeAwayMinutes > 2) return "Medium";

    return "Low";
  };

  const calculateCopyPercentage = (): number => {
    if (questions.length === 0) return 0;

    const totalCopyAttempts = Object.values(copyStats).reduce(
      (sum, count) => sum + count,
      0
    );
    const averageCopiesPerQuestion = totalCopyAttempts / questions.length;

    // Consider 3 copies per question as 100%
    const copyPercentage = Math.min((averageCopiesPerQuestion / 3) * 100, 100);
    return Math.round(copyPercentage * 10) / 10; // Round to 1 decimal place
  };

  const saveCheatingLogs = async () => {
    if (!user) return;

    try {
      const copyPercentage = calculateCopyPercentage();
      const cheatingLog: CheatingLog = {
        user_id: user.id,
        exam_id: parseInt(exam_id),
        copy_percentage: copyPercentage,
        time_spent_away: timeSpentAway,
        cheat_risk_level: calculateCheatRisk(copyPercentage, timeSpentAway),
        timestamp: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("cheating_logs")
        .insert([cheatingLog]);

      if (error) throw error;
      console.log("Cheating logs saved successfully");
    } catch (error) {
      console.error("Error saving cheating logs:", error);
    }
  };

  const handleAnswer = (questionId: string | number, answer: string): void => {
    setAnswers((prevAnswers) => ({ ...prevAnswers, [questionId]: answer }));
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 1) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      let totalScore = 0;
      const topicScoresTemp: Record<string, { score: number; total: number }> =
        {};

      questions.forEach((question) => {
        const { question_id, question_points, topic_id, question_answer } =
          question;
        const correct = answers[question_id]?.trim() === question_answer.trim();

        if (!topicScoresTemp[topic_id]) {
          topicScoresTemp[topic_id] = { score: 0, total: 0 };
        }

        topicScoresTemp[topic_id].total += question_points;
        if (correct) {
          totalScore += question_points;
          topicScoresTemp[topic_id].score += question_points;
        }
      });

      await saveCheatingLogs();
      onSubmit(totalScore, topicScoresTemp, answers, questions);
    } catch (error) {
      console.error("Error submitting exam:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  if (!examData || questions.length === 0) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FEFAF6] dark:bg-[#092635]">
      <ExamHeader
        title={examData.exam_title}
        timeRemaining={timeRemaining}
        instructions={examData.exam_desc || "Answer all questions."}
      />
      <div className="flex-grow flex flex-col md:flex-row h-auto">
        <aside className="w-full md:w-64 bg-[#FEFAF6] dark:bg-[#092635] h-auto shadow-md md:shadow-lg">
          <QuestionNavigation
            questions={questions}
            currentQuestion={currentQuestion}
            setCurrentQuestion={setCurrentQuestion}
            answers={answers}
          />
        </aside>
        <main className="flex-grow h-auto p-4 md:p-6 bg-gradient-to-t from-[#FEFAF6] to-[#B3C8CF] text-gray-800 dark:bg-gradient-to-t dark:from-[#092635] dark:to-[#092635]/90 dark:text-gray-800">
          <div className="h-full w-full">
            <QuestionDisplay
              question={questions[currentQuestion - 1]}
              answer={answers[questions[currentQuestion - 1]?.question_id]}
              onAnswer={handleAnswer}
              isSubmitted={false}
              onNextQuestion={handleNextQuestion}
              onPreviousQuestion={handlePreviousQuestion}
              currentQuestionNumber={currentQuestion}
              totalQuestions={questions.length}
            />
          </div>
        </main>
      </div>
      <footer className="bg-white shadow-md p-4 sticky bottom-0 left-0 right-0 bg-gradient-to-b from-[#FEFAF6] to-[#B3C8CF] text-gray-800 dark:bg-gradient-to-b dark:from-[#092635] dark:to-[#092635]/90 dark:text-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="w-full sm:w-2/3">
              <ProgressBar
                totalQuestions={questions.length}
                answeredQuestions={Object.keys(answers).length}
              />
            </div>
            <div className="w-full sm:w-1/3 flex justify-end">
              <SubmitButton
                onSubmit={handleSubmit}
                disabled={
                  Object.keys(answers).length !== questions.length || isLoading
                }
              />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ExamInterface;
