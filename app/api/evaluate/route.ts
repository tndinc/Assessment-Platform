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

// Clean directory paths from error messages
function cleanErrorMessage(message: string): string {
  return message.replace(/(\w:)?[\\/][^:\n]+:/g, "");
}

// Check if code requires logic evaluation
function requiresLogicEvaluation(question: string, code: string): boolean {
  const logicKeywords = [
    "loop", "condition", "if", "else", "switch", 
    "algorithm", "logic", "find", "compare", "search", 
    "largest", "smallest", "sort", "calculate"
  ];
  
  const codeLogicPatterns = [
    "if", "else", "for", "while", "switch", 
    "case", "do", "break", "continue"
  ];

  const questionRequiresLogic = logicKeywords.some(keyword => 
    question.toLowerCase().includes(keyword)
  );
  const codeContainsLogic = codeLogicPatterns.some(pattern => 
    new RegExp(`\\b${pattern}\\b`).test(code)
  );

  return questionRequiresLogic || codeContainsLogic;
}

// Run PMD analysis
function runPMD(filePath: string): string {
  try {
    const pmdCommand = `"C:/Program Files/pmd/pmd-bin-7.10.0/bin/pmd.bat" check -d "${filePath}" -R "C:/Program Files/pmd/pmd-bin-7.10.0/bin/rule_set.xml" -f text`;
    const output = execSync(pmdCommand, { encoding: "utf-8" });
    return output.trim().length > 0 
      ? `❌ PMD Violations:\n${cleanErrorMessage(output)}`
      : "✅ No PMD violations detected.";
  } catch (error: any) {
    const errorMessage = error.stdout || error.message;
    return `❌ PMD Violations:\n${cleanErrorMessage(errorMessage)}`;
  }
}

// Evaluate code against criteria
function evaluateCriteria(
  syntaxFeedback: string, 
  pmdFeedback: string, 
  requiresLogic: boolean
): Record<string, string> {
  return {
    "Code Structure": pmdFeedback.includes("✅")
      ? "✅ Well-structured and follows Java conventions"
      : "❌ Code structure needs improvement",
      
    "Functionality": syntaxFeedback.includes("✅")
      ? "✅ Code compiles and functions as expected"
      : "❌ Code has compilation issues",
      
    "Best Practices": pmdFeedback.includes("✅")
      ? "✅ Follows Java best practices"
      : "❌ Some best practices violations detected",
      
    "Logic Implementation": requiresLogic
      ? (syntaxFeedback.includes("✅") 
          ? "✅ Logic implementation appears correct"
          : "❌ Logic implementation needs review")
      : "⚠️ Logic evaluation not applicable"
  };
}

async function generateLLMFeedback(
  openai: OpenAI,
  code: string,
  question: string
): Promise<string> {
  try {
    // ✅ Try Fine-Tuned Model First
    const fineTunedResponse = await openai.chat.completions.create({
      model: "ft:gpt-4o-mini-2024-07-18:personal::B4r8Uh7Y",
      messages: [
        { role: "system", content: "Evaluate the Java code considering correctness, efficiency, and suggest improvements." },
        { role: "user", content: `Question: ${question}\nStudent Code:\n${code}` }
      ],
      max_tokens: 300
    });

    if (fineTunedResponse.choices[0]?.message?.content) {
      console.log("✅ Fine-Tuned Model Used");
      return fineTunedResponse.choices[0].message.content;
    }
  } catch (error) {
    console.error("❌ Fine-Tuned Model Failed. Falling back to GPT-4o-mini:", error);
  }

  // ✅ Fallback to GPT-4o-mini
  try {
    const gpt4Response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a Java programming expert. Evaluate the code and start your response with 'Correct' or 'Incorrect'." },
        { role: "user", content: `Question: ${question}\nStudent Code:\n${code}` }
      ],
      max_tokens: 300
    });

    let feedback = gpt4Response.choices[0]?.message?.content || "Unable to generate feedback.";

    // ✅ Ensure feedback starts with "Correct" or "Incorrect"
    feedback = formatFeedback(feedback);
    console.log("✅ Used GPT-4o-mini as fallback:", feedback);

    return feedback;
  } catch (fallbackError) {
    console.error("❌ GPT-4o-mini Failed as Well:", fallbackError);
  }

  return "⚠️ Unable to generate AI feedback. Please try again.";
}
function formatFeedback(feedback: string): string {
  const lowercaseFeedback = feedback.toLowerCase();

  if (lowercaseFeedback.startsWith("correct") || lowercaseFeedback.startsWith("incorrect")) {
    return feedback; // ✅ If already correct, return as-is
  }

  // ✅ If feedback mentions correctness, extract the correct response
  if (lowercaseFeedback.includes("correct") && !lowercaseFeedback.includes("incorrect")) {
    return "Correct. " + feedback;
  }
  if (lowercaseFeedback.includes("incorrect") && !lowercaseFeedback.includes("correct")) {
    return "Incorrect. " + feedback;
  }

  // ✅ Default to "Incorrect" if the response is unclear
  return "Incorrect. " + feedback;
}



// Main API route handler
export async function POST(req: NextRequest) {
  let tempFilePath: string | null = null;

  try {
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_API_KEY) {
      throw new Error("Missing OpenAI API Key");
    }

    const body = await req.json();
    const { studentCode, question } = body;

    if (!studentCode || !question) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Initialize feedback variables
    let syntaxFeedback = "✅ No syntax errors detected.";
    let pmdFeedback = "✅ No PMD violations detected.";
    let llmFeedback = "";
    let overallFeedback = "";
    
    const requiresLogic = requiresLogicEvaluation(question, studentCode);

    // Process student code
    if (studentCode.trim()) {
      const className = extractClassName(studentCode);
      const filename = `${className}.java`;
      tempFilePath = path.join(process.cwd(), filename);

      // Save code to file
      fs.writeFileSync(tempFilePath, studentCode);

      // Check syntax
      try {
        execSync(`javac "${tempFilePath}"`, { stdio: "pipe" });
      } catch (error: any) {
        syntaxFeedback = `❌ Syntax Error:\n${cleanErrorMessage(error.stderr.toString())}`;
      }

      // Run PMD
      pmdFeedback = runPMD(tempFilePath);

      // Generate feedback
      const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
      
      // Get LLM feedback
      llmFeedback = await generateLLMFeedback(openai, studentCode, question);

      // Generate criterion feedback
      const criterionFeedback = evaluateCriteria(
        syntaxFeedback,
        pmdFeedback,
        requiresLogic
      );

      // Generate overall feedback
      const evaluationSummary = `
        Syntax Analysis: ${syntaxFeedback}
        PMD Analysis: ${pmdFeedback}
        Criterion Feedback: ${JSON.stringify(criterionFeedback, null, 2)}
        LLM Feedback: ${llmFeedback}
      `;

      const overallResponse = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a supportive computer science professor providing feedback on Java code.
            Structure your response with:
            - Overall Summary: Brief assessment of code quality
            - Strengths: What the student did well
            - Weaknesses & Suggestions for Improvement: What the Student Struggled With. Specific, actionable advice
            - Final Thoughts: Encouraging closing message`
          },
          {
            role: "user",
            content: `Evaluation Results:\n${evaluationSummary}`
          }
        ],
        max_tokens: 400
      });

      overallFeedback = overallResponse.choices[0]?.message?.content || 
        "Unable to generate overall feedback.";
    }

    return NextResponse.json({
      llmFeedback,
      syntaxAnalysis: syntaxFeedback,
      pmdFeedback,
      criterionFeedback: evaluateCriteria(syntaxFeedback, pmdFeedback, requiresLogic),
      overallFeedback
    });

  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json(
      { 
        error: "Server Error", 
        details: cleanErrorMessage(error.message) 
      }, 
      { status: 500 }
    );

  } finally {
    // Cleanup temporary files
    if (tempFilePath) {
      const classFile = tempFilePath.replace(".java", ".class");
      if (fs.existsSync(classFile)) fs.unlinkSync(classFile);
      if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
    }
  }
}