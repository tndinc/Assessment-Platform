"use client";
import { useState } from "react";

export default function Evaluator() {
  const [studentCode, setStudentCode] = useState("");
  const [question, setQuestion] = useState("");
  const [evaluation, setEvaluation] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Function to handle code evaluation
  const handleEvaluate = async () => {
    setLoading(true);
    setEvaluation(null);
    setError("");

    try {
      const response = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentCode, question }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API Error: ${errorData.error || response.statusText}`);
      }

      const data = await response.json();
      setEvaluation(data); // Set the evaluation response data
    } catch (err: any) {
      console.error("Evaluation Error:", err);
      setError(err.message || "Failed to evaluate the code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-100 dark:bg-gray-900 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold text-center text-white">🚀 Java Code Evaluator</h2>

      {/* Question Input */}
      <textarea
        className="w-full p-2 border rounded mt-4 dark:text-white bg-gray-800 text-white"
        placeholder="Enter the question prompt here..."
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />

      {/* Student Code Input */}
      <textarea
        className="w-full p-2 border rounded mt-4 dark:text-white bg-gray-800 text-white"
        placeholder="Paste Java code here..."
        value={studentCode}
        onChange={(e) => setStudentCode(e.target.value)}
      />

      {/* Evaluate Button */}
      <button
        className={`mt-4 bg-blue-600 text-white p-2 rounded w-full transition ${
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

      {/* Evaluation Result Display */}
      {evaluation && (
        <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded border">
          <h3 className="font-semibold text-lg text-blue-600">Evaluation Result:</h3>

          {/* LLM Feedback */}
          <h4 className="mt-4 text-lg font-bold">🤖 LLM Feedback:</h4>
          <pre className="whitespace-pre-wrap text-sm text-gray-800 dark:text-white">{evaluation.llmFeedback}</pre>

          {/* Syntax Analysis */}
          <h4 className="mt-4 text-lg font-bold">📄 Syntax Analysis:</h4>
          <pre className="whitespace-pre-wrap text-sm text-gray-800 dark:text-white">{evaluation.syntaxAnalysis}</pre>

          {/* Checkstyle Analysis */}
          <h4 className="mt-4 text-lg font-bold">🛠️ Checkstyle Feedback:</h4>
          <pre className="whitespace-pre-wrap text-sm text-gray-800 dark:text-white">{evaluation.checkstyleAnalysis}</pre>

          {/* Rubric Scoring */}
          <h4 className="mt-4 text-lg font-bold">📊 Rubric Scores:</h4>
          <ul className="list-disc pl-5 text-gray-800 dark:text-white">
            {Object.entries(evaluation.rubricScores).map(([criteria, score]) => (
              <li key={criteria}>
                <strong>{criteria.replace(/([A-Z])/g, " $1")}:</strong> {score} / 5
              </li>
            ))}
          </ul>

          {/* Total Score */}
          <h3 className="mt-4 text-xl font-bold text-green-600">🏆 Final Score: {evaluation.totalScore}</h3>
        </div>
      )}
    </div>
  );
}
