'use client';

import { useState, useEffect } from 'react';
import { createClient } from "@/utils/supabase/client";
import ExamHeader from './components/ExamHeader';
import QuestionNavigation from './components/QuestionNavigation';
import QuestionDisplay from './components/QuestionsDisplay';
import ProgressBar from './components/ProgressBar';
import SubmitButton from './components/SubmitButton';
import OpenAI from "openai";
import { User } from "@supabase/supabase-js";

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || "",
  dangerouslyAllowBrowser: true,
});

const ExamInterface = ({ params }: { params: { exam_id: string } }) => {
  const { exam_id } = params;
  const supabase = createClient();
  const [examData, setExamData] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [score, setScore] = useState<number>(0);
  const [topicScores, setTopicScores] = useState<Record<string, { score: number; total: number }>>({});
  const [user, setUser] = useState<User | null>(null);

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
          .from('exam_tbl')
          .select('*')
          .eq('exam_id', exam_id)
          .single();
        if (examError) throw examError;
        setExamData(exam);
        setTimeRemaining(exam.exam_time_limit);

        const { data: topics, error: topicsError } = await supabase
          .from('topic_tbl')
          .select('topic_id, topic_title')
          .eq('exam_id', exam_id);
        if (topicsError) throw topicsError;
        const topicIds = topics.map((topic) => topic.topic_id);

        const { data: questions, error: questionsError } = await supabase
          .from('question_tbl')
          .select('question_id, question_desc, question_points, topic_id, question_answer')
          .in('topic_id', topicIds);
        if (questionsError) throw questionsError;

        const questionIds = questions.map((q) => q.question_id);
        const { data: choices, error: choicesError } = await supabase
          .from('choices_tbl')
          .select('question_id, question_txt')
          .in('question_id', questionIds);
        if (choicesError) throw choicesError;

        const questionsWithChoices = questions.map((q, index) => ({
          ...q,
          number: index + 1,
          choices: choices.filter((c) => c.question_id === q.question_id),
        }));

        setQuestions(questionsWithChoices);
      } catch (err) {
        console.error('Error fetching exam data:', err);
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

  const saveExamResults = async (resultData: {
    user_id: string;
    exam_id: string;
    total_score: number;
    topic_scores: Record<string, { score: number; total: number }>;
    ai_feedback: string;
  }) => {
    try {
      const { data, error } = await supabase
        .from("exam_results")
        .insert([resultData]);

      if (error) throw error;

      console.log("Exam results saved successfully:", data);
    } catch (err) {
      console.error("Error saving exam results:", err);
    }
  };

  const handleSubmit = async () => {
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

    setScore(totalScore);
    setTopicScores(topicScoresTemp);

    try {
      const topicFeedback = Object.entries(topicScoresTemp).map(([topic, { score, total }]) => {
        const percentage = ((score / total) * 100).toFixed(2);
        const strength = percentage >= 75 ? "strength" : "weakness";
        return `Topic ${topic}: ${percentage}% (${strength})`;
      }).join("\n");

      const prompt = `The student completed an exam with the following scores:\n\n${topicFeedback}.\n\nGenerate constructive feedback highlighting strengths and weaknesses to help the student improve.`;

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
      });

      const aiFeedback = response.choices[0]?.message?.content.trim() || "No feedback available.";

      setFeedback(aiFeedback);

      if (!user) {
        console.error("User is not authenticated");
        return;
      }

      await saveExamResults({
        user_id: user.id,
        exam_id,
        total_score: totalScore,
        topic_scores: topicScoresTemp,
        ai_feedback: aiFeedback,
      });
    } catch (err) {
      console.error("Error generating feedback or saving results:", err);
      setFeedback("Could not generate feedback. Please try again later.");
    }

    setIsSubmitted(true);
  };

  if (!examData || questions.length === 0) {
    return <div>Loading...</div>;
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold">Exam Feedback</h1>
        <p className="mt-4">Your Total Score: {score}</p>
        <div className="mt-4">
          {Object.entries(topicScores).map(([topic, { score, total }]) => (
            <p key={topic}>
              {`Topic ${topic}: ${((score / total) * 100).toFixed(2)}%`}
            </p>
          ))}
        </div>
        <div className="mt-6 p-4 border rounded bg-white shadow">
          <h2 className="font-bold">AI Feedback:</h2>
          <p className="mt-2">{feedback}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <ExamHeader
        title={examData.exam_title}
        timeRemaining={timeRemaining}
        instructions={examData.exam_desc || "Answer all questions."}
      />
      <div className="flex-grow flex flex-col md:flex-row">
        <QuestionNavigation
          questions={questions}
          currentQuestion={currentQuestion}
          setCurrentQuestion={setCurrentQuestion}
          answers={answers}
        />
        <main className="flex-grow p-2 md:p-6 overflow-y-auto">
          <QuestionDisplay
            question={questions[currentQuestion - 1]}
            answer={answers[questions[currentQuestion - 1]?.question_id]}
            onAnswer={handleAnswer}
            isSubmitted={isSubmitted}
          />
        </main>
      </div>
      <footer className="bg-white shadow-md p-4">
        <ProgressBar
          totalQuestions={questions.length}
          answeredQuestions={Object.keys(answers).length}
        />
        <SubmitButton
          onSubmit={handleSubmit}
          disabled={Object.keys(answers).length === 0}
        />
      </footer>
    </div>
  );
};

export default ExamInterface;
