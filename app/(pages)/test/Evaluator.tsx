"use client";
import { useState } from "react";

export default function Evaluator() {
  const [studentCode, setStudentCode] = useState("");
  const [question, setQuestion] = useState("");
  const [evaluation, setEvaluation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(""); // Track API errors

  const handleEvaluate = async () => {
    setLoading(true);
    setEvaluation("");
    setError(""); // Reset error message

    try {
      const response = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentCode, question }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }

      const data = await response.json();
      setEvaluation(data.evaluation || "No response from evaluator.");
    } catch (err: any) {
      console.error("Evaluation Error:", err);
      setError(err.message || "Failed to evaluate the code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-100 dark:bg-gray-900 rounded-lg">
      <h2 className="text-xl font-bold">Code Evaluator</h2>

      {/* Question Input */}
      <textarea
        className="w-full p-2 border rounded mt-2 dark:text-black"
        placeholder="Enter the question..."
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />

      {/* Student Code Input */}
      <textarea
        className="w-full p-2 border rounded mt-2 dark:text-black"
        placeholder="Paste Java code here..."
        value={studentCode}
        onChange={(e) => setStudentCode(e.target.value)}
      />

      {/* Evaluate Button */}
      <button
        className={`mt-2 bg-blue-600 text-white p-2 rounded w-full transition ${
          loading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
        }`}
        onClick={handleEvaluate}
        disabled={loading}
      >
        {loading ? "Evaluating..." : "Evaluate Code"}
      </button>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded border border-red-400">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Evaluation Result */}
      {evaluation && (
        <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded border">
          <h3 className="font-semibold">Evaluation Result:</h3>
          <pre className="whitespace-pre-wrap">{evaluation}</pre>
        </div>
      )}
    </div>
  );
}
