"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ExamFeedbackProps {
  score: number;
  topicScores: Record<string, { score: number; total: number }>;
  feedbackSections: {
    strengths: string;
    weaknesses: string;
    overallFeedback: string;
  };
  questions: any[];
  answers: Record<number, any>;
}

const ExamFeedback = ({
  score,
  topicScores,
  feedbackSections,
  questions,
  answers,
}: ExamFeedbackProps) => {
  const router = useRouter();
  const [currentFeedbackIndex, setCurrentFeedbackIndex] = useState(0);
  const [showQuestionReview, setShowQuestionReview] = useState(false);

  const toggleQuestionReview = () => {
    setShowQuestionReview((prev) => !prev);
  };

  const handleNextFeedback = () => {
    if (currentFeedbackIndex < Object.values(feedbackSections).length - 1) {
      setCurrentFeedbackIndex((prevIndex) => prevIndex + 1);
    }
  };

  const handlePreviousFeedback = () => {
    if (currentFeedbackIndex > 0) {
      setCurrentFeedbackIndex((prevIndex) => prevIndex - 1);
    }
  };

  const getFeedbackToDisplay = () => {
    const keys = Object.keys(feedbackSections) as (keyof typeof feedbackSections)[];
    return feedbackSections[keys[currentFeedbackIndex]];
  };

  return (
    <div className="min-h-screen bg-gradient-to-t from-[#B3C8CF] to-[#E5E1DA] text-gray-800 dark:bg-gradient-to-b dark:from-[#092635] dark:to-[#092635]/90 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-4xl shadow-lg rounded-lg overflow-hidden border-gray-300 dark:border-gray-700 bg-[#E5E1DA] dark:bg-[#27374D]">
        <CardHeader className="text-white p-6 relative bg-[#D7D3BF] dark:bg-[#344C64]">
          <CardTitle className="text-3xl font-bold text-center w-full text-[#74512D] dark:text-[#67C6E3]">
            Exam Feedback
          </CardTitle>
          <Button
            onClick={() => router.push("/user-dashboard")}
            className="absolute top-4 right-4 transition-all duration-300 ease-in-out transform hover:scale-105 bg-[#982B1C]/70 hover:bg-[#982B1C] text-gray-200 dark:bg-[#EF5A6F]/70 dark:hover:bg-[#EF5A6F] dark:text-gray-100"
          >
            Close
          </Button>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <p className="text-2xl font-semibold text-gray-800 dark:text-gray-300">
              Your Total Score
            </p>
            <p className="text-5xl font-bold text-blue-600 dark:text-blue-500 mt-2">
              {score} / {Object.values(topicScores).reduce((acc, { total }) => acc + total, 0)}
            </p>
            <p className="text-lg font-medium text-gray-800 dark:text-gray-300 mt-2">
              {((score / Object.values(topicScores).reduce((acc, { total }) => acc + total, 0)) * 100).toFixed(2)}%
            </p>
          </div>

          {/* Topic Score Progress Section */}
          <div className="grid gap-4 mb-6">
            {Object.entries(topicScores).map(([topic, { score, total }]) => {
              const topicTitle = questions.find((q) => q.topic_id.toString() === topic)?.topic_title || `Topic ${topic}`;
              const percentage = (score / total) * 100;
              return (
                <div key={topic} className="p-4 rounded-lg bg-[#D7D3BF]/30 dark:bg-[#384B70]/70">
                  <p className="font-semibold text-gray-800 dark:text-gray-300 mb-2">
                    {topicTitle}
                  </p>
                  <div className="flex items-center">
                    <Progress value={percentage} className="flex-grow mr-4" />
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-300">
                      {percentage.toFixed(2)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* AI Feedback Section */}
          <Card className="border-blue-200 mb-6 bg-[#D7D3BF]/30 dark:bg-[#384B70]/30">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-300">
                {currentFeedbackIndex === 0
                  ? "Strengths"
                  : currentFeedbackIndex === 1
                  ? "Weaknesses"
                  : "Overall Feedback"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-800 dark:text-gray-300">{getFeedbackToDisplay()}</p>
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-4">
            <Button
              onClick={handlePreviousFeedback}
              disabled={currentFeedbackIndex === 0}
              className="bg-[#B3C8CF]/60 hover:bg-[#B3C8CF] text-[#] dark:bg-[#254B62]/50 dark:hover:bg-[#254B62] dark:text-[#]"
            >
              Previous
            </Button>
            <Button
              onClick={handleNextFeedback}
              disabled={currentFeedbackIndex === Object.values(feedbackSections).length - 1}
              className="bg-[#B3C8CF]/60 hover:bg-[#B3C8CF] text-black-600 dark:bg-[#254B62]/50 dark:hover:bg-[#254B62] dark:text-white-600"
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* "Show Question Review" Button */}
      <div className="flex justify-center items-center gap-4 mt-4 w-full max-w-4xl">
        <Button
          onClick={toggleQuestionReview}
          variant={showQuestionReview ? "secondary" : "default"}
          className="transition-all duration-300 ease-in-out transform hover:scale-105"
        >
          {showQuestionReview ? "Hide Question Review" : "Show Question Review"}
        </Button>
      </div>

      {/* Question Review Section */}
      {showQuestionReview && (
        <Card className="w-full max-w-4xl mt-8 shadow-lg rounded-lg overflow-hidden bg-[#D7D3BF]/30 dark:bg-[#384B70]/30 border-gray-300 dark:border-gray-700">
          <CardHeader className="bg-[#D7D3BF]/30 dark:bg-[#384B70]/60 text-white p-6">
            <CardTitle className="text-2xl font-bold text-[#74512D] dark:text-[#67C6E3]">
              Question Review
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              {questions.map((question) => (
                <Card
                  key={question.question_id}
                  className="bg-[#D7D3BF]/30 dark:bg-[#384B70]/70 border-gray-300 dark:border-gray-700"
                >
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-300">
                      {`Q${question.number}: ${question.question_desc}`}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-2">
                      <span className="font-medium text-[#088395] dark:text-[#37B7C3]">
                        Your Answer:
                      </span>{" "}
                      <span className="text-gray-800 dark:text-gray-300">
                        {answers[question.question_id] || "No Answer"}
                      </span>
                    </p>
                    <p className="mb-2">
                      <span className="font-medium text-[#1B9C85] dark:text-[#27E1C1]">
                        Correct Answer:
                      </span>{" "}
                      <span className="text-gray-800 dark:text-gray-300">
                        {question.question_answer}
                      </span>
                    </p>
                    {answers[question.question_id]?.trim() ===
                    question.question_answer.trim() ? (
                      <p className="text-green-500 font-semibold">
                        Correct
                      </p>
                    ) : (
                      <p className="text-red-500 font-semibold">
                        Incorrect
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ExamFeedback;

