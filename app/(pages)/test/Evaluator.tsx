// Updated Evaluator.tsx with Overall Feedback Display
"use client";
import { useState } from "react";
import JavaCompiler from "./JavaCompiler";

export default function Evaluator() {
  const [studentCode, setStudentCode] = useState("");
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number | null>(null);
  const [evaluation, setEvaluation] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const questions = [
    "Write a function that takes an array of numbers and returns the second largest number.",
    "Based on the given code structure, explain the flow based on your understanding:\nSAMPLE OUTPUT:\nInput the first number: 25\nInput the second number: 45\nInput the third number: 65\nThe average value is 45.0",
    "Based on the given code structure, explain the flow based on your understanding:",
    "Assign values to condition1, condition2 and condition3 variables so that for the numbers that correspond to the winter months, true is displayed, and false in other cases.",
    "Write a Java method to check whether a string is a valid password. Password rules: A password must have at least ten characters, consist of only letters and digits, and contain at least two digits.",
    "Write a Java program to find all triplets equal to a given sum in an unsorted array of integers.",
    "Write a Java method to display the first 50 pentagonal numbers.",
    "Based on the given code structure, explain the flow based on your understanding:",
    "This challenge is an English twist on the Japanese word game Shiritori. Write a Shiritori class that follows specific game rules.",
    "Write a function that returns true if you can partition an array into one element and the rest, such that this element equals the product of all other elements."
  ];

  const handleCompileAndEvaluate = async () => {
    if (selectedQuestionIndex === null) {
      setError("Please select a question.");
      return;
    }

    setLoading(true);
    setEvaluation(null);
    setError("");

    try {
      const response = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentCode,
          question: questions[selectedQuestionIndex],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API Error: ${errorData.error || response.statusText}`);
      }

      const data = await response.json();
      setEvaluation(data);
    } catch (err: any) {
      console.error("Compile and Evaluate Error:", err);
      setError(err.message || "Failed to compile and evaluate the code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-100 dark:bg-gray-900 rounded-2xl shadow-lg w-[600px] mx-auto">
      <h2 className="text-xl font-bold text-center text-white">🚀 Java Code Evaluator</h2>

      <div className="mt-4">
        <label className="block text-white font-semibold">Select a Question:</label>
        <select
          className="w-full p-2 mt-2 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          value={selectedQuestionIndex ?? ""}
          onChange={(e) => setSelectedQuestionIndex(Number(e.target.value))}
        >
          <option value="">-- Select a question --</option>
          {questions.map((_, index) => (
            <option key={index} value={index}>
              {`Question ${index + 1}`}
            </option>
          ))}
        </select>
      </div>

      {selectedQuestionIndex !== null && (
        <div className="p-4 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-2xl mt-4">
          <h3 className="font-semibold">Selected Question:</h3>
          <p>{questions[selectedQuestionIndex]}</p>
        </div>
      )}

      <div className="mt-4">
        <JavaCompiler
          value={studentCode}
          onChange={setStudentCode}
          onCompileSuccess={handleCompileAndEvaluate}
        />
      </div>

      <div className="flex gap-4 mt-4">
        <button
          className={`flex-1 bg-blue-600 text-white py-2 rounded-lg ${loading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"}`}
          onClick={handleCompileAndEvaluate}
          disabled={loading}
        >
          {loading ? "Compiling & Evaluating..." : "Compile & Evaluate"}
        </button>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-xl border border-red-400">
          <strong>Error:</strong> {error}
        </div>
      )}

{evaluation && (
        <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-2xl border">
          <h3 className="font-semibold text-lg text-blue-600">Evaluation Result:</h3>

          <h4 className="mt-4 text-lg font-bold">🤖 LLM Feedback:</h4>
          <pre className="whitespace-pre-wrap text-sm text-gray-800 dark:text-white">{evaluation.llmFeedback}</pre>

          <h4 className="mt-4 text-lg font-bold">📄 Syntax Analysis:</h4>
          <pre className="whitespace-pre-wrap text-sm text-gray-800 dark:text-white">{evaluation.syntaxAnalysis}</pre>

          <h4 className="mt-4 text-lg font-bold">🛠️ PMD Feedback:</h4>
          <pre className="whitespace-pre-wrap text-sm text-gray-800 dark:text-white">{evaluation.pmdFeedback}</pre>

          <h4 className="mt-4 text-lg font-bold">✅ Criterion-Based Feedback:</h4>
          <ul className="list-disc pl-5 text-gray-800 dark:text-white">
            {Object.entries(evaluation.criterionFeedback).map(([criteria, feedback]) => (
              <li key={criteria}>
                <strong>{criteria.replace(/([A-Z])/g, " $1")}:</strong> {feedback}
              </li>
            ))}
          </ul>
          <h4 className="mt-4 text-lg font-bold">📊 Overall Feedback:</h4>
          <ul className="list-none pl-0 text-gray-800 dark:text-white space-y-2">
            {evaluation.overallFeedback.split("\n").map((feedback, index) => {
              if (feedback.includes("Overall Summary:")) {
                return (
                  <li key={index} className="flex items-start gap-2 text-green-600">
                    ✅ <span><strong>Overall Summary:</strong> {feedback.replace("Overall Summary:", "").trim()}</span>
                  </li>
                );
              }
              if (feedback.includes("Strengths:")) {
                return (
                  <li key={index} className="flex items-start gap-2 text-green-600">
                    ✅ <span><strong>Strengths:</strong> {feedback.replace("Strengths:", "").trim()}</span>
                  </li>
                );
              }
              if (feedback.includes("Suggestions for Improvement:")) {
                return (
                  <li key={index} className="flex items-start gap-2 text-yellow-600">
                    ⚠️ <span><strong>Suggestions for Improvement:</strong> {feedback.replace("Suggestions for Improvement:", "").trim()}</span>
                  </li>
                );
              }
              if (feedback.includes("Final Thoughts:")) {
                return (
                  <li key={index} className="flex items-start gap-2 text-blue-600">
                    🎓 <span><strong>Final Thoughts:</strong> {feedback.replace("Final Thoughts:", "").trim()}</span>
                  </li>
                );
              }
              return (
                <li key={index} className="flex items-start gap-2 text-gray-800 dark:text-white">
                  <span>{feedback}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
