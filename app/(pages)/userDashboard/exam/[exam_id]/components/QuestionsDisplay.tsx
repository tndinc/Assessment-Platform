"use client";

import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

interface Choice {
  question_txt: string;
}

interface Question {
  question_id: string | number;
  question_desc: string;
  choices?: Choice[];
}

interface QuestionDisplayProps {
  question: Question | null;
  answer: string | null;
  onAnswer: (questionId: string | number, answer: string) => void;
  isSubmitted: boolean;
}

export default function QuestionDisplay({
  question,
  answer,
  onAnswer,
  isSubmitted,
}: QuestionDisplayProps) {
  const renderChoices = () => {
    if (!question?.choices || question.choices.length === 0) {
      return (
        <div className="flex items-center justify-center h-32 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="flex items-center text-yellow-700">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span>No choices available for this question.</span>
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {question.choices.map((choice, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card
              className={`cursor-pointer transition-all duration-200 ${
                answer === choice.question_txt
                  ? "border-primary shadow-lg"
                  : "hover:border-gray-300"
              }`}
              onClick={() =>
                !isSubmitted &&
                onAnswer(question.question_id, choice.question_txt)
              }
            >
              <CardContent className="p-4 flex items-center justify-between">
                <p className="text-lg">{choice.question_txt}</p>
                {answer === choice.question_txt && (
                  <CheckCircle2 className="w-6 h-6 text-primary" />
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    );
  };

  if (!question) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="flex items-center justify-center h-64">
          <div className="animate-pulse flex space-x-4">
            <div className="rounded-full bg-slate-200 h-10 w-10"></div>
            <div className="flex-1 space-y-6 py-1">
              <div className="h-2 bg-slate-200 rounded"></div>
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-4">
                  <div className="h-2 bg-slate-200 rounded col-span-2"></div>
                  <div className="h-2 bg-slate-200 rounded col-span-1"></div>
                </div>
                <div className="h-2 bg-slate-200 rounded"></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardContent className="space-y-6 pt-6">
        <CardTitle className="text-2xl font-bold">
          {question.question_desc}
        </CardTitle>
        {renderChoices()}
      </CardContent>
    </Card>
  );
}
