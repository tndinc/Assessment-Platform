"use client";

import { useState, useCallback } from "react";
import { Check, Loader2 } from "lucide-react";
import CodeMirror from "@uiw/react-codemirror";
import { java } from "@codemirror/lang-java";
import { dracula } from "@uiw/codemirror-theme-dracula";
import { autocompletion } from "@codemirror/autocomplete";

interface CompilerResponse {
  output: string;
  statusCode: number;
  memory: string;
  cpuTime: string;
}

interface JavaCompilerProps {
  value: string;
  onChange: (code: string) => void;
  onCompileSuccess: (result: any) => void;
  disabled?: boolean;
}

const JavaCompiler = ({
  value,
  onChange,
  onCompileSuccess,
}: JavaCompilerProps) => {
  const [output, setOutput] = useState<string>("");
  const [isCompiling, setIsCompiling] = useState(false);
  const [error, setError] = useState<string>("");

  // Memoized function for better performance
  const compileCode = useCallback(async () => {
    if (!value.trim()) return;

    setIsCompiling(true);
    setError("");

    try {
      const response = await fetch("/api/compile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ script: value }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Compilation failed");

      if (data.statusCode === 200) {
        setOutput(data.output);
        onCompileSuccess?.(data);
      } else {
        setError(`Compilation Error: ${data.output || "Unknown error"}`);
      }
    } catch (err) {
      setError(
        `Error: ${
          err instanceof Error ? err.message : "Failed to compile code"
        }`
      );
      console.error("Compilation error:", err);
    } finally {
      setIsCompiling(false);
    }
  }, [value, onCompileSuccess]);

  return (
    <div className="space-y-4 w-full max-w-4xl mx-auto">
      {/* Code Editor */}
      <div className="relative border rounded-lg overflow-hidden shadow-md">
        <CodeMirror
          value={value}
          onChange={(code) => onChange(code)}
          className="w-full text-sm"
          placeholder="Write your Java code here..."
          extensions={[java(), autocompletion()]}
          theme={dracula}
        />
      </div>

      {/* Compile Button */}
      <div className="flex justify-between items-center">
        <button
          onClick={compileCode}
          disabled={isCompiling || !value.trim()}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 font-semibold transition ${
            isCompiling || !value.trim()
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600"
          } text-white`}
        >
          {isCompiling ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Compiling...
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              Compile & Run
            </>
          )}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-100 text-red-700 border border-red-300 rounded-lg">
          <p className="font-semibold">Error:</p>
          <pre className="text-sm whitespace-pre-wrap mt-2">{error}</pre>
        </div>
      )}

      {/* Output Display */}
      {output && !error && (
        <div className="p-4 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg shadow">
          <h3 className="font-semibold mb-2">Output:</h3>
          <pre className="text-sm whitespace-pre-wrap overflow-auto max-h-40">
            {output}
          </pre>
        </div>
      )}
    </div>
  );
};

export default JavaCompiler;
