"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import ExamHeader from "./components/ExamHeader";
import QuestionNavigation from "./components/QuestionNavigation";
import QuestionDisplay from "./components/QuestionsDisplay";
import ProgressBar from "./components/ProgressBar";
import SubmitButton from "./components/SubmitButton";
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
        setTimeRemaining(exam.exam_time_limit);

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

      console.log("Exam results saved successfully:", data);
    } catch (err) {
      console.error("Error saving exam results:", err);
    }
  };

  const handleSubmit = async () => {
    let totalScore = 0;
    const topicScoresTemp: Record<string, { score: number; total: number }> =
      {};

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
          const strength = percentage >= 75 ? "strength" : "weakness"; // Determine strength or weakness

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
        response.choices[0]?.message?.content.trim() ||
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
        user_id: user.id,
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
      console.error("Error generating feedback or saving results:", err);
      setFeedback("Could not generate feedback. Please try again later.");
    }

    setIsSubmitted(true);
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
    const keys = Object.keys(feedbackSections);
    return feedbackSections[keys[currentFeedbackIndex]];
  };

  if (!examData || questions.length === 0) {
    return <div>Loading...</div>;
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-4xl bg-white shadow-lg rounded-lg overflow-hidden">
          <CardHeader className="bg-blue-500 text-white p-6 relative">
            {/* Exam Feedback Title */}
            <CardTitle className="text-3xl font-bold text-center w-full">
              Exam Feedback
            </CardTitle>

            {/* Close Button aligned to the top-right corner of the CardHeader */}
            <Button
              onClick={() => router.push("/userDashboard")}
              className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white transition-all duration-300 ease-in-out transform hover:scale-105"
            >
              Close
            </Button>
          </CardHeader>

          <CardContent className="p-6">
            <div className="text-center mb-6">
              <p className="text-2xl font-semibold text-gray-800">
                Your Total Score
              </p>
              <p className="text-5xl font-bold text-blue-600 mt-2">
                {score} /{" "}
                {Object.values(topicScores).reduce(
                  (acc, { total }) => acc + total,
                  0
                )}
              </p>
              <p className="text-lg font-medium text-gray-700 mt-2">
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
              {Object.entries(topicScores).map(([topic, { score, total }]) => {
                const topicTitle =
                  questions.find((q) => q.topic_id.toString() === topic)
                    ?.topic_title || `Topic ${topic}`;
                const percentage = (score / total) * 100;
                return (
                  <div key={topic} className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-semibold text-gray-700 mb-2">
                      {topicTitle}
                    </p>
                    <div className="flex items-center">
                      <Progress value={percentage} className="flex-grow mr-4" />
                      <span className="text-sm font-medium text-gray-600">
                        {percentage.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* AI Feedback Section */}
            <Card className="bg-blue-50 border-blue-200 mb-6">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-blue-800">
                  {currentFeedbackIndex === 0
                    ? "Strengths"
                    : currentFeedbackIndex === 1
                    ? "Weaknesses"
                    : "Overall Feedback"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{getFeedbackToDisplay()}</p>
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
          <Card className="w-full max-w-4xl mt-8 bg-white shadow-lg rounded-lg overflow-hidden">
            <CardHeader className="bg-indigo-500 text-white p-6">
              <CardTitle className="text-2xl font-bold">
                Question Review
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {questions.map((question) => (
                  <Card
                    key={question.question_id}
                    className="bg-gray-50 border-gray-200"
                  >
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold text-gray-800">
                        {`Q${question.number}: ${question.question_desc}`}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="mb-2">
                        <span className="font-medium text-gray-700">
                          Your Answer:
                        </span>{" "}
                        <span className="text-gray-600">
                          {answers[question.question_id] || "No Answer"}
                        </span>
                      </p>
                      <p className="mb-2">
                        <span className="font-medium text-gray-700">
                          Correct Answer:
                        </span>{" "}
                        <span className="text-gray-600">
                          {question.question_answer}
                        </span>
                      </p>
                      {answers[question.question_id]?.trim() ===
                      question.question_answer.trim() ? (
                        <p className="text-green-500 font-semibold">Correct</p>
                      ) : (
                        <p className="text-red-500 font-semibold">Incorrect</p>
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
