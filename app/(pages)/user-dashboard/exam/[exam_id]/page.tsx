"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import ExamHeader from "./components/ExamHeader";
import QuestionNavigation from "./components/QuestionNavigation";
import QuestionDisplay from "./components/QuestionsDisplay";
import ProgressBar from "./components/ProgressBar";
import SubmitButton from "./components/SubmitButton";
import Loading from "@/components/Loading";
import OpenAI from "openai";
import { User } from "@supabase/supabase-js";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || "",
  dangerouslyAllowBrowser: true,
});

const ExamInterface = ({ params }: { params: { exam_id: string } }) => {
  const router = useRouter();
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
  const [topicScores, setTopicScores] = useState<
    Record<string, { score: number; total: number }>
  >({});
  const [user, setUser] = useState<User | null>(null);
  const [showQuestionReview, setShowQuestionReview] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const toggleQuestionReview = () => {
    setShowQuestionReview((prev) => !prev);
  };

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
        console.error("Error fetching user:");
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
        console.error("Error fetching exam data:");
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
    strength_analysis: string; // Updated field
    weakness_analysis: string; // Updated field
    overall_feedback: string; // Updated field
  }) => {
    try {
      const { data, error } = await supabase
        .from("exam_results")
        .insert([resultData]);

      if (error) throw error;
    } catch (err) {
      console.error("Error saving exam results:");
    }
  };

  const handleSubmit = async () => {
    let totalScore = 0;
    const topicScoresTemp: Record<string, { score: number; total: number }> =
      {};
    // Set loading state to true
    setIsLoading(true);

    // Calculate total score and topic scores
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

    setScore(totalScore);
    setTopicScores(topicScoresTemp);

    try {
      const topicFeedback = Object.entries(topicScoresTemp)
        .map(([topic, { score, total }]) => {
          // Find the topic title based on the topic_id
          const topicTitle =
            questions.find((q) => q.topic_id.toString() === topic)
              ?.topic_title || `Topic ${topic}`; // Fallback if topic title is not found

          const percentage = ((score / total) * 100).toFixed(2); // Calculate percentage and format
          const percentageValue = parseFloat(percentage);
          const strength = percentageValue >= 75 ? "strength" : "weakness"; // Determine strength or weakness

          // Return formatted feedback string
          return `Topic: ${topicTitle} - ${percentage}% (${strength})`;
        })
        .join("\n"); // Join the individual topic feedback into a single string

      const detailedFeedback = questions
        .map((question) => {
          const userAnswer = answers[question.question_id] || "No Answer";
          const isCorrect =
            userAnswer.trim() === question.question_answer.trim();
          return `Q: ${
            question.question_desc
          }\nYour Answer: ${userAnswer}\nCorrect Answer: ${
            question.question_answer
          }\nResult: ${isCorrect ? "Correct" : "Incorrect"}`;
        })
        .join("\n\n");

      const prompt = `You completed an exam with the following performance:\n\n${topicFeedback}.\n\nProvide specific feedback based on these details:\n\n${detailedFeedback}.\n\nHighlight strengths, weaknesses, and suggestions for improvement.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
      });

      const aiFeedback =
        response?.choices?.[0]?.message?.content?.trim() ||
        "No feedback available.";

      // Split feedback into sections
      const strengthsMatch = aiFeedback.match(
        /Strengths:([\s\S]+?)(?=\nWeaknesses:|$)/
      );
      const weaknessesMatch = aiFeedback.match(
        /Weaknesses:([\s\S]+?)(?=\nOverall feedback:|$)/
      );
      const overallFeedbackMatch = aiFeedback.match(
        /Overall feedback:([\s\S]+)/
      );

      // Store each part of the feedback
      const strengths = strengthsMatch
        ? strengthsMatch[1].trim()
        : "No Strengths Provided";
      const weaknesses = weaknessesMatch
        ? weaknessesMatch[1].trim()
        : "No Weaknesses Provided";
      const overallFeedback = overallFeedbackMatch
        ? overallFeedbackMatch[1].trim()
        : `Strengths: ${strengths}\nWeaknesses: ${weaknesses}`;

      // Save the exam results and feedback in the database
      await saveExamResults({
        user_id: user?.id || "",
        exam_id,
        total_score: totalScore,
        topic_scores: topicScoresTemp,
        strength_analysis: strengths,
        weakness_analysis: weaknesses,
        overall_feedback: overallFeedback,
      });

      // Update state with feedback sections for navigation
      setFeedbackSections({
        strengths,
        weaknesses,
        overallFeedback,
      });
      setCurrentFeedbackIndex(0); // Start at the first feedback section
    } catch (err) {
      console.error("Error generating feedback or saving results:");
      setFeedback("Could not generate feedback. Please try again later.");
    }
    setIsLoading(false);
    setIsSubmitted(true);
  };

  // Define the type for feedback sections
  type FeedbackSections = {
    strengths: string;
    weaknesses: string;
    overallFeedback: string;
  };

  // State to handle feedback sections and navigation
  const [feedbackSections, setFeedbackSections] = useState({
    strengths: "",
    weaknesses: "",
    overallFeedback: "",
  });
  const [currentFeedbackIndex, setCurrentFeedbackIndex] = useState(0);

  // Handle Next button click for navigating feedback sections
  const handleNextFeedback = () => {
    if (currentFeedbackIndex < Object.values(feedbackSections).length - 1) {
      setCurrentFeedbackIndex((prevIndex) => prevIndex + 1);
    }
  };

  // Handle Previous button click for navigating feedback sections
  const handlePreviousFeedback = () => {
    if (currentFeedbackIndex > 0) {
      setCurrentFeedbackIndex((prevIndex) => prevIndex - 1);
    }
  };

  // Display feedback based on current index
  const getFeedbackToDisplay = () => {
    const keys = Object.keys(feedbackSections) as (keyof FeedbackSections)[];
    return feedbackSections[keys[currentFeedbackIndex]];
  };

  if (!examData || questions.length === 0) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col relative">
      {/* Full-page loading spinner if loading */}
      {isLoading ? (
        <div className="loading-overlay">
          <Loading /> {/* Full-page loading spinner */}
        </div>
      ) : (
        <>
          {isSubmitted ? (
            <div className="min-h-screen bg-gradient-to-t from-[#B3C8CF] to-[#E5E1DA] text-gray-800 dark:bg-gradient-to-b dark:from-[#092635] dark:to-[#092635]/90 flex flex-col items-center justify-center p-4">
              <Card className="w-full max-w-4xl bg-white shadow-lg rounded-lg overflow-hidden bg-[#D7D3BF]/30 dark:bg-[#384B70]/30 border-gray-300 dark:border-gray-700">
                <CardHeader className="text-white p-6 relative bg-[#D7D3BF]/30 dark:bg-[#384B70]/60">
                  {/* Exam Feedback Title */}
                  <CardTitle className="text-3xl font-bold text-center w-full text-gray-800 dark:text-gray-300">
                    Exam Feedback
                  </CardTitle>

                  {/* Close Button aligned to the top-right corner of the CardHeader */}
                  <Button
                    onClick={() => router.push("/user-dashboard")}
                    className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white transition-all duration-300 ease-in-out transform hover:scale-105"
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
                      {score} /{" "}
                      {Object.values(topicScores).reduce(
                        (acc, { total }) => acc + total,
                        0
                      )}
                    </p>
                    <p className="text-lg font-medium text-gray-800 dark:text-gray-300 mt-2">
                      {(
                        (score /
                          Object.values(topicScores).reduce(
                            (acc, { total }) => acc + total,
                            0
                          )) *
                        100
                      ).toFixed(2)}
                      %
                    </p>
                  </div>

                  {/* Topic Score Progress Section */}
                  <div className="grid gap-4 mb-6">
                    {Object.entries(topicScores).map(
                      ([topic, { score, total }]) => {
                        const topicTitle =
                          questions.find((q) => q.topic_id.toString() === topic)
                            ?.topic_title || `Topic ${topic}`;
                        const percentage = (score / total) * 100;
                        return (
                          <div
                            key={topic}
                            className="p-4 rounded-lg bg-[#D7D3BF]/30 dark:bg-[#384B70]/70"
                          >
                            <p className="font-semibold text-gray-800 dark:text-gray-300 mb-2">
                              {topicTitle}
                            </p>
                            <div className="flex items-center">
                              <Progress
                                value={percentage}
                                className="flex-grow mr-4"
                              />
                              <span className="text-sm font-medium text-gray-800 dark:text-gray-300">
                                {percentage.toFixed(2)}%
                              </span>
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>

                  {/* AI Feedback Section */}
                  <Card className=" border-blue-200 mb-6 bg-[#D7D3BF]/30 dark:bg-[#384B70]/30">
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
                      className="bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={handleNextFeedback}
                      disabled={
                        currentFeedbackIndex ===
                        Object.values(feedbackSections).length - 1
                      }
                      className="bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      Next
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* "Show Question Review" Button Centered Outside the Card */}
              <div className="flex justify-center items-center gap-4 mt-4 w-full max-w-4xl">
                <Button
                  onClick={toggleQuestionReview}
                  variant={showQuestionReview ? "secondary" : "default"}
                  className="transition-all duration-300 ease-in-out transform hover:scale-105"
                >
                  {showQuestionReview
                    ? "Hide Question Review"
                    : "Show Question Review"}
                </Button>
              </div>

              {/* Question Review Section */}
              {showQuestionReview && (
                <Card className="w-full max-w-4xl mt-8 shadow-lg rounded-lg overflow-hidden bg-[#D7D3BF]/30 dark:bg-[#384B70]/30 border-gray-300 dark:border-gray-700">
                  <CardHeader className="bg-[#D7D3BF]/30 dark:bg-[#384B70]/60 text-white p-6">
                    <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-300">
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
                              <span className="font-medium text-gray-800 dark:text-gray-300">
                                Your Answer:
                              </span>{" "}
                              <span className="text-gray-800 dark:text-gray-300">
                                {answers[question.question_id] || "No Answer"}
                              </span>
                            </p>
                            <p className="mb-2">
                              <span className="font-medium text-gray-800 dark:text-gray-300">
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
          ) : (
            <div className="min-h-screen bg-gray-50 flex flex-col">
              {isLoading && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <Loading />
                </div>
              )}
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
                <main className="flex-grow p-4 md:p-6 overflow-y-auto 
                bg-gradient-to-t from-[#FEFAF6] to-[#B3C8CF] text-gray-800 
                dark:bg-gradient-to-t dark:from-[#092635] dark:to-[#092635]/90 dark:text-gray-800">
                  <div className="max-w-3xl mx-auto">
                    <QuestionDisplay
                      question={questions[currentQuestion - 1]}
                      answer={
                        answers[questions[currentQuestion - 1]?.question_id]
                      }
                      onAnswer={handleAnswer}
                      isSubmitted={isSubmitted}
                    />
                  </div>
                </main>
              </div>
              <footer className="bg-white shadow-md p-4 sticky bottom-0 left-0 right-0 
              bg-gradient-to-b from-[#FEFAF6] to-[#B3C8CF] text-gray-800 
              dark:bg-gradient-to-b dark:from-[#092635] dark:to-[#092635]/90 dark:text-gray-800">
                <div className="max-w-7xl mx-auto">
                  <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4">
                    {/* Progress Bar Section */}
                    <div className="w-full sm:w-2/3">
                      <ProgressBar
                        totalQuestions={questions.length}
                        answeredQuestions={Object.keys(answers).length}
                      />
                    </div>

                    {/* Submit Button Section */}
                    <div className="w-full sm:w-1/3 flex justify-end">
                      <SubmitButton
                        onSubmit={handleSubmit}
                        disabled={
                          Object.keys(answers).length !== questions.length
                        }
                      />
                    </div>
                  </div>
                </div>
              </footer>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ExamInterface;
