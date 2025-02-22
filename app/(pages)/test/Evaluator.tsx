// Updated Evaluator.tsx with Overall Feedback Display
"use client";
import { useState } from "react";
import JavaCompiler from "./JavaCompiler";

export default function Evaluator() {
  const [studentCode, setStudentCode] = useState("");
  const [evaluation, setEvaluation] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fixedQuestion = "write a java code that can return number 3";

  const handleCompileAndEvaluate = async () => {
    setLoading(true);
    setEvaluation(null);
    setError("");

    try {
      const response = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentCode, question: fixedQuestion }),
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
    <div className="p-6 bg-gray-100 dark:bg-gray-900 rounded-2xl shadow-lg max-w-4xl mx-auto">
      <h2 className="text-xl font-bold text-center text-white">
        🚀 Java Code Evaluator
      </h2>

      <div className="p-4 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-2xl mt-4">
        <h3 className="font-semibold">Question:</h3>
        <p>{fixedQuestion}</p>
      </div>

      <div className="mt-4">
        <JavaCompiler
          value={studentCode}
          onChange={setStudentCode}
          onCompileSuccess={handleCompileAndEvaluate}
        />
      </div>

      <div className="flex gap-4 mt-4">
        <button
          className={`flex-1 bg-blue-600 text-white py-2 rounded-lg ${
            loading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
          }`}
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
          <h3 className="font-semibold text-lg text-blue-600">
            Evaluation Result:
          </h3>

          <h4 className="mt-4 text-lg font-bold">🤖 LLM Feedback:</h4>
          <pre className="whitespace-pre-wrap text-sm text-gray-800 dark:text-white">
            {evaluation.llmFeedback}
          </pre>

          <h4 className="mt-4 text-lg font-bold">📄 Syntax Analysis:</h4>
          <pre className="whitespace-pre-wrap text-sm text-gray-800 dark:text-white">
            {evaluation.syntaxAnalysis}
          </pre>

          <h4 className="mt-4 text-lg font-bold">🛠️ PMD Feedback:</h4>
          <pre className="whitespace-pre-wrap text-sm text-gray-800 dark:text-white">
            {evaluation.pmdFeedback}
          </pre>

          <h4 className="mt-4 text-lg font-bold">
            ✅ Criterion-Based Feedback:
          </h4>
          <ul className="list-disc pl-5 text-gray-800 dark:text-white">
            {Object.entries(evaluation.criterionFeedback).map(
              ([criteria, feedback]) => (
                <li key={criteria}>
                  <strong>{criteria.replace(/([A-Z])/g, " $1")}:</strong>{" "}
                  {feedback}
                </li>
              )
            )}
          </ul>

          <h4 className="mt-4 text-lg font-bold">📊 Overall Feedback:</h4>
          <ul className="list-none pl-0 text-gray-800 dark:text-white space-y-2">
            {evaluation.overallFeedback.split("\n").map((feedback, index) => {
              // Add checkmarks and bold styling for labeled feedback points
              if (feedback.includes("Overall Summary:")) {
                return (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-green-600"
                  >
                    ✅{" "}
                    <span>
                      <strong>Overall Summary:</strong>{" "}
                      {feedback.replace("Overall Summary:", "").trim()}
                    </span>
                  </li>
                );
              }
              if (feedback.includes("Strengths:")) {
                return (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-green-600"
                  >
                    ✅{" "}
                    <span>
                      <strong>Strengths:</strong>{" "}
                      {feedback.replace("Strengths:", "").trim()}
                    </span>
                  </li>
                );
              }
              if (feedback.includes("Suggestions for Improvement:")) {
                return (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-yellow-600"
                  >
                    ⚠️{" "}
                    <span>
                      <strong>Suggestions for Improvement:</strong>{" "}
                      {feedback
                        .replace("Suggestions for Improvement:", "")
                        .trim()}
                    </span>
                  </li>
                );
              }
              if (feedback.includes("Final Thoughts:")) {
                return (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-blue-600"
                  >
                    🎓{" "}
                    <span>
                      <strong>Final Thoughts:</strong>{" "}
                      {feedback.replace("Final Thoughts:", "").trim()}
                    </span>
                  </li>
                );
              }
              // Default formatting for any additional feedback
              return (
                <li
                  key={index}
                  className="flex items-start gap-2 text-gray-800 dark:text-white"
                >
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
