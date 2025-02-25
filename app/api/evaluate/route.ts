// Updated Next.js API route with criteria scores
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

// Extract class name from Java code
function extractClassName(javaCode: string): string {
  const match = javaCode.match(/public\s+class\s+(\w+)/);
  return match ? match[1] : "StudentCode";
}

function isValidJavaCode(code: string) {
  const javaKeywords = ["class", "public", "static", "void", "int", "boolean", "System.out.println", "{", "}"];
  return javaKeywords.some(keyword => code.includes(keyword));
}

// Clean directory paths from error messages
function cleanErrorMessage(message: string): string {
  return message.replace(/(\w:)?[\\/][^:\n]+:/g, "");
}

// Check if code requires logic evaluation
function requiresLogicEvaluation(question: string, code: string): boolean {
  const logicKeywords = ["loop", "condition", "if", "else", "switch", "algorithm", "logic", "find", "compare", "search", "largest", "smallest", "sort", "calculate"];
  const codeLogicPatterns = ["if", "else", "for", "while", "switch", "case", "do", "break", "continue"];

  const questionRequiresLogic = logicKeywords.some(keyword => question.toLowerCase().includes(keyword));
  const codeContainsLogic = codeLogicPatterns.some(pattern => new RegExp(`\\b${pattern}\\b`).test(code));

  return questionRequiresLogic || codeContainsLogic;
}

// Run PMD analysis
function runPMD(filePath: string): string {
  try {
    const pmdCommand = `"C:/Program Files/pmd/pmd-bin-7.10.0/bin/pmd.bat" check -d "${filePath}" -R "C:/Program Files/pmd/pmd-bin-7.10.0/bin/rule_set.xml" -f text`;
    const output = execSync(pmdCommand, { encoding: "utf-8" });
    return output.trim().length > 0 ? `❌ PMD Violations:\n${cleanErrorMessage(output)}` : "✅ No PMD violations detected.";
  } catch (error: any) {
    const errorMessage = error.stdout || error.message;
    return `❌ PMD Violations:\n${cleanErrorMessage(errorMessage)}`;
  }
}

// Evaluate code against criteria and assign scores
function evaluateCriteria(  syntaxFeedback: string, pmdFeedback: string, llmFeedback: string) {
  return {
    "Code Correctness": syntaxFeedback.includes("✅") ? 5 : 2,
    "Input Handling": llmFeedback ? (syntaxFeedback.includes("✅") ? 5 : 3) : 0,
    "Code Structure": pmdFeedback.includes("✅") ? 5 : 3,
    "Logic Functionality": llmFeedback ? (syntaxFeedback.includes("✅") ? 5 : 2) : 0
  };
}

// Generate LLM feedback with fallback
async function generateLLMFeedback(openai: OpenAI, code: string, question: string){
  try {
    const response = await openai.chat.completions.create({
      model: "ft:gpt-4o-mini-2024-07-18:personal::B4r8Uh7Y",
      messages: [
        { role: "system", content: "Evaluate the Java code considering correctness, efficiency, and suggest improvements." },
        { role: "user", content: `Question: ${question}\nStudent Code:\n${code}` }
      ],
      max_tokens: 300
    });
    return response.choices[0]?.message?.content || "Unable to generate feedback.";
  } catch (error: any) {
    console.error("LLM Feedback Error:", error);
    return "Error generating AI feedback. Please try again.";
  }
}

// Main API route handler
export async function POST(req: NextRequest) {
  let tempFilePath = null;

  try {
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_API_KEY) throw new Error("Missing OpenAI API Key");

    const body = await req.json();
    const { studentCode, question } = body;
    if (!studentCode || !question) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    let syntaxFeedback = "✅ No syntax errors detected.";
    let pmdFeedback = "✅ No PMD violations detected.";
    let llmFeedback = "";
    let overallFeedback = "";

    const requiresLogic = requiresLogicEvaluation(question, studentCode);

    if (studentCode.trim()) {
      const className = extractClassName(studentCode);
      const filename = `${className}.java`;
      tempFilePath = path.join(process.cwd(), filename);

      fs.writeFileSync(tempFilePath, studentCode);

      try {
        execSync(`javac "${tempFilePath}"`, { stdio: "pipe" });
      } catch (error: any) {
        syntaxFeedback = `❌ Syntax Error:\n${cleanErrorMessage(error.stderr.toString())}`;
      }

      pmdFeedback = runPMD(tempFilePath);

      const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
      llmFeedback = await generateLLMFeedback(openai, studentCode, question);

      const criteriaScores = evaluateCriteria(syntaxFeedback, pmdFeedback, llmFeedback);

      const evaluationSummary = `Syntax Analysis: ${syntaxFeedback}\nPMD Analysis: ${pmdFeedback}\nCriteria Scores: ${JSON.stringify(criteriaScores, null, 2)}\nLLM Feedback: ${llmFeedback}`;

      const overallResponse = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a supportive first year computer science professor providing feedback on Java code. Structure your response with: Overall Summary, Strengths, Weaknesses, and Final Thoughts."
          },
          { role: "user", content: `Evaluation Results:\n${evaluationSummary}` }
        ],
        max_tokens: 400
      });

      if (!isValidJavaCode(studentCode)) {
        return NextResponse.json({
          error: "Invalid Java Code Submission",
          message: "Your submission does not appear to be valid Java code. Please submit a Java program for evaluation.",
        });
      }

      overallFeedback = overallResponse.choices[0]?.message?.content || "Unable to generate overall feedback.";

      return NextResponse.json({
        llmFeedback,
        syntaxAnalysis: syntaxFeedback,
        pmdFeedback,
        criteriaScores,
        overallFeedback
      });
    }
  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Server Error", details: cleanErrorMessage(error.message) }, { status: 500 });
  } finally {
    if (tempFilePath) {
      const classFile = tempFilePath.replace(".java", ".class");
      if (fs.existsSync(classFile)) fs.unlinkSync(classFile);
      if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
    }
  }
}