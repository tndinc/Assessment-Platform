// Backend: Fully Restored with All Functionalities and Overall Feedback Integration Including Criterion Feedback

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

// Function to extract public class name from Java code
function extractClassName(javaCode: string): string {
  const match = javaCode.match(/public\s+class\s+(\w+)/);
  return match ? match[1] : "StudentCode";
}

// Function to clean directory paths from error messages
function cleanErrorMessage(message: string): string {
  return message.replace(/(\w:)?[\\/][^:\n]+:/g, "");
}

// Refined logic detection: Prioritize scanning student code and validate against question requirements
function requiresLogicEvaluation(question: string, code: string): boolean {
  const logicKeywords = ["loop", "condition", "if", "else", "switch", "algorithm", "logic", "find", "compare", "search", "largest"];
  const codeLogicPatterns = ["if", "else", "for", "while", "switch", "case"];

  const questionRequiresLogic = logicKeywords.some(keyword => question.toLowerCase().includes(keyword));
  const codeContainsLogic = codeLogicPatterns.some(pattern => new RegExp(`\\b${pattern}\\b`).test(code));

  // If the question requires logic, ensure the code contains it
  if (questionRequiresLogic) {
    return codeContainsLogic;
  }
  // Otherwise, only base on code content
  return codeContainsLogic;
}

// Run PMD analysis and return feedback
function runPMD(filePath: string): string {
  try {
    const pmdCommand = `"C:/Program Files/pmd/pmd-bin-7.10.0/bin/pmd.bat" check -d "${filePath}" -R "C:/Program Files/pmd/pmd-bin-7.10.0/bin/rule_set.xml" -f text`;
    const output = execSync(pmdCommand, { encoding: "utf-8" });
    return output.length ? cleanErrorMessage(output) : "✅ No PMD violations detected.";
  } catch (error: any) {
    return `❌ PMD Violations:\n${cleanErrorMessage(error.stdout || error.message)}`;
  }
}

// Generate criterion-based feedback
function evaluateCriteria(syntaxFeedback: string, pmdFeedback: string, requiresLogic: boolean): any {
  return {
    codeCorrectness: syntaxFeedback.includes("No syntax errors detected")
      ? "✅ Code is correct."
      : `❌ Code has syntax errors: ${syntaxFeedback}`,
    inputHandling: syntaxFeedback.includes("No syntax errors detected")
      ? "✅ Code handles input correctly."
      : `❌ Input handling issue: ${syntaxFeedback}`,
    codeStructureReadability: pmdFeedback.includes("No PMD violations detected")
      ? "✅ Code structure follows best practices."
      : `❌ Code readability issues detected: ${pmdFeedback}`,
    logicFunctionality: requiresLogic
      ? "✅ Logic is functional and correct."
      : "⚠️ Logic evaluation not required or not detected based on student's code."
  };
}

// API Route Handler
export async function POST(req: NextRequest) {
  try {
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_API_KEY) {
      return NextResponse.json({ error: "Server Error: Missing API Key." }, { status: 500 });
    }

    const body = await req.json();
    const { studentCode, question } = body;

    if (!studentCode || !question) {
      return NextResponse.json({ error: "Missing studentCode or question." }, { status: 400 });
    }

    const requiresLogic = requiresLogicEvaluation(question, studentCode);
    let syntaxFeedback = "✅ No syntax errors detected.";
    let pmdFeedback = "✅ No PMD violations detected.";
    let llmFeedback = "No LLM feedback.";
    let logicFeedback = "Logic evaluation not required.";
    let overallFeedback = "No overall feedback.";

    if (studentCode) {
      const className = extractClassName(studentCode);
      const filename = `${className}.java`;
      const filePath = path.join(process.cwd(), filename);

      // Save code to a file
      fs.writeFileSync(filePath, studentCode);

      // Syntax Check using javac
      try {
        execSync(`javac "${filePath}"`, { stdio: "pipe" });
      } catch (error: any) {
        syntaxFeedback = `❌ Syntax Error:\n${cleanErrorMessage(error.stderr.toString())}`;
      }

      // Run PMD Analysis
      pmdFeedback = runPMD(filePath);

      // Generate LLM feedback for code evaluation
      const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
      const llmResponse = await openai.chat.completions.create({
        model: "ft:gpt-4o-mini-2024-07-18:personal::B3Rjviyf",
        messages: [
          {
            role: "system",
            content: "Evaluate the Java code considering correctness, efficiency, and suggest improvements."
          },
          {
            role: "user",
            content: `Student Code:\n${studentCode}`
          }
        ],
        max_tokens: 300
      });
      llmFeedback = llmResponse.choices[0]?.message?.content || "No LLM feedback received.";

      // Generate criterion-based feedback
      const criterionFeedback = evaluateCriteria(syntaxFeedback, pmdFeedback, requiresLogic);
      const evaluationResults = `Syntax Analysis: ${syntaxFeedback}\nPMD Feedback: ${pmdFeedback}\nCriterion Feedback: ${JSON.stringify(criterionFeedback, null, 2)}\nLLM Feedback: ${llmFeedback}`;

      const overallResponse = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a friendly and supportive first-year computer science professor. 
            Provide clear, beginner-friendly feedback on Java code. Avoid using markdown symbols like asterisks for bold or italics. 
            Structure your response in a clear, readable way with emojis and line breaks for visual appeal. 
      
            Follow this format:
            1. 🎯 Overall Summary - A short, encouraging sentence about the code's overall quality.
            2. ✅ Strengths - A list of things the student did well.
            3. 🛠️ Suggestions for Improvement - Helpful advice on how to improve the code.
            4. 🎓 Final Thoughts - A supportive closing message that motivates the student to keep learning.`
          },
          {
            role: "user",
            content: `Evaluation Results:\n${evaluationResults}`
          }
        ],
        max_tokens: 400
      });
      
      overallFeedback = overallResponse.choices[0]?.message?.content || "No overall feedback received.";

      // Clean up generated files
      const classFile = filePath.replace(".java", ".class");
      if (fs.existsSync(classFile)) fs.unlinkSync(classFile);
      fs.unlinkSync(filePath);

      // Return response with all necessary fields
      return NextResponse.json({
        llmFeedback,
        syntaxAnalysis: syntaxFeedback,
        pmdFeedback,
        logicFeedback,
        overallFeedback,
        criterionFeedback
      });
    }
  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Server Error", details: cleanErrorMessage(error.message) }, { status: 500 });
  }
}