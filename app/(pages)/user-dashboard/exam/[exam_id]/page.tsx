"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import ExamInterface from "./components/ExamInterface";
import ExamFeedback from "./components/ExamFeedback";
import Loading from "@/components/Loading";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || "",
  dangerouslyAllowBrowser: true,
});

const ExamPage = ({ params }: { params: { exam_id: string } }) => {
  const { exam_id } = params;
  const supabase = createClient();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [feedbackData, setFeedbackData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleExamSubmit = async (
    score: number,
    topicScores: Record<string, { score: number; total: number }>,
    answers: Record<number, any>,
    questions: any[]
  ) => {
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("User not authenticated");
      }

      const topicFeedback = Object.entries(topicScores)
        .map(([topic, { score, total }]) => {
          const percentage = ((score / total) * 100).toFixed(2);
          const percentageValue = parseFloat(percentage);
          const strength = percentageValue >= 75 ? "strength" : "weakness";
          return `Topic: ${topic} - ${percentage}% (${strength})`;
        })
        .join("\n");

      const detailedFeedback = Object.entries(answers)
        .map(([questionId, userAnswer]) => {
          const question = questions.find(q => q.question_id.toString() === questionId);
          if (!question) return ''; // Handle case where question is not found
          const isCorrect = userAnswer.trim() === question.question_answer.trim();
          return `Q: ${question.question_desc}\nYour Answer: ${userAnswer}\nCorrect Answer: ${question.question_answer}\nResult: ${isCorrect ? "Correct" : "Incorrect"}`;
        })
        .filter(feedback => feedback !== '') // Remove any empty feedback strings
        .join("\n\n");

      const prompt = `You completed an exam with the following performance:\n\n${topicFeedback}.\n\nProvide specific feedback based on these details:\n\n${detailedFeedback}.\n\nHighlight strengths, weaknesses, and suggestions for improvement.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
      });

      const aiFeedback = response?.choices?.[0]?.message?.content?.trim() || "No feedback available.";

      const strengthsMatch = aiFeedback.match(/Strengths:([\s\S]+?)(?=\nWeaknesses:|$)/);
      const weaknessesMatch = aiFeedback.match(/Weaknesses:([\s\S]+?)(?=\nOverall feedback:|$)/);
      const overallFeedbackMatch = aiFeedback.match(/Overall feedback:([\s\S]+)/);

      const strengths = strengthsMatch ? strengthsMatch[1].trim() : "No Strengths Provided";
      const weaknesses = weaknessesMatch ? weaknessesMatch[1].trim() : "No Weaknesses Provided";
      const overallFeedback = overallFeedbackMatch ? overallFeedbackMatch[1].trim() : `Strengths: ${strengths}\nWeaknesses: ${weaknesses}`;

      await supabase.from("exam_results").insert([{
        user_id: user.id,
        exam_id,
        total_score: score,
        topic_scores: topicScores,
        strength_analysis: strengths,
        weakness_analysis: weaknesses,
        overall_feedback: overallFeedback,
      }]);

      setFeedbackData({
        score,
        topicScores,
        feedbackSections: {
          strengths,
          weaknesses,
          overallFeedback,
        },
        questions,
        answers,
      });

      setIsSubmitted(true);
    } catch (error) {
      console.error("Error generating feedback or saving results:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen flex flex-col relative bg-[#FEFAF6] dark:bg-[#092635]">
      {isSubmitted ? (
        <ExamFeedback {...feedbackData} />
      ) : (
        <ExamInterface 
          exam_id={exam_id}
          onSubmit={handleExamSubmit}
        />
      )}
    </div>
  )
};

export default ExamPage;

