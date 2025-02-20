"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";

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

  const compileCode = async () => {
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

      if (!response.ok) {
        throw new Error(data.error || "Compilation failed");
      }

      if (data.statusCode === 200) {
        setOutput(data.output);
        onCompileSuccess?.(data);
      } else {
        setError(
          `Compilation Error: ${data.output || "Unknown error occurred"}`
        );
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
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-64 p-4 font-mono text-sm border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all duration-300 resize-none bg-white/50 backdrop-blur-sm"
          placeholder="Write your Java code here..."
        />
      </div>

      <div className="flex justify-between items-center">
        <button
          onClick={compileCode}
          disabled={isCompiling || !value.trim()}
          className={`px-4 py-2 rounded-full font-semibold flex items-center gap-2 ${
            isCompiling || !value.trim()
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600"
          } text-white transition-colors`}
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

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 font-medium">Error:</p>
          <pre className="text-red-500 mt-2 whitespace-pre-wrap text-sm">
            {error}
          </pre>
        </div>
      )}

      {output && !error && (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h3 className="font-semibold mb-2">Output:</h3>
          <pre className="font-mono text-sm whitespace-pre-wrap">{output}</pre>
        </div>
      )}
    </div>
  );
};

export default JavaCompiler;
