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
  onSubmit: (score: number, topicScores: Record<string, { score: number; total: number }>, answers: Record<number, any>, questions: any[]) => void;
}

const ExamInterface = ({ 
  exam_id, 
  onSubmit 
}: ExamInterfaceProps) => {
  const supabase = createClient();
  const [examData, setExamData] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setUser(user);
        if (!user) {
          throw new Error("User not authenticated");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const fetchExamData = async () => {
      try {
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
      }
    };

    fetchExamData();
  }, [exam_id]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleAnswer = (questionId: string | number, answer: string): void => {
    setAnswers((prevAnswers) => ({ ...prevAnswers, [questionId]: answer }));
  };

  const handleSubmit = () => {
    let totalScore = 0;
    const topicScoresTemp: Record<string, { score: number; total: number }> = {};

    questions.forEach((question) => {
      const { question_id, question_points, topic_id, question_answer } = question;
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

    onSubmit(totalScore, topicScoresTemp, answers, questions);
  };

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
      <div className="flex-grow flex flex-col md:flex-row">
        <aside className="w-full md:w-64 bg-white shadow-md md:shadow-lg">
          <QuestionNavigation
            questions={questions}
            currentQuestion={currentQuestion}
            setCurrentQuestion={setCurrentQuestion}
            answers={answers}
          />
        </aside>
        <main className="flex-grow p-4 md:p-6 overflow-y-auto bg-gradient-to-t from-[#FEFAF6] to-[#B3C8CF] text-gray-800 dark:bg-gradient-to-t dark:from-[#092635] dark:to-[#092635]/90 dark:text-gray-800">
          <div className="max-w-3xl mx-auto">
            <QuestionDisplay
              question={questions[currentQuestion - 1]}
              answer={answers[questions[currentQuestion - 1]?.question_id]}
              onAnswer={handleAnswer}
              isSubmitted={false}
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
                disabled={Object.keys(answers).length !== questions.length}
              />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ExamInterface;

