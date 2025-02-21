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

// Determine if the question requires code evaluation
function isCodingQuestion(question: string): boolean {
  const codingKeywords = ["code", "function", "method", "class", "array", "loop", "algorithm", "syntax", "compile"];
  return codingKeywords.some(keyword => question.toLowerCase().includes(keyword));
}

// Check if the submitted answer looks like code
function isCodeInput(answer: string): boolean {
  const codeIndicators = ["public class", "{", "}", "return", ";", "System.out.println", "int ", "String "];
  return codeIndicators.some(indicator => answer.includes(indicator));
}

// Extract filename from full file path
function extractFileName(fullPath: string): string {
  return fullPath.split("\\").pop() || fullPath;
}

// Simplify Checkstyle feedback messages
function simplifyCheckstyleMessage(message: string): string {
  if (message.includes("Missing a Javadoc comment")) {
    return "Add a descriptive comment for this class or method.";
  }
  if (message.includes("incorrect indentation")) {
    return "Fix the indentation to match the expected format.";
  }
  if (message.includes("child has incorrect indentation")) {
    return "Correct the indentation of the nested code block.";
  }
  if (message.includes("method def rcurly")) {
    return "Align the closing brace of the method properly.";
  }
  return message; // Default message if no simplification is found
}

// Group Checkstyle violations by type and file
function groupCheckstyleViolations(violations: any[]): string {
  const groupedViolations: Record<string, any> = {};

  violations.forEach(violation => {
    const key = `${violation.file}-${violation.message}`;
    if (!groupedViolations[key]) {
      groupedViolations[key] = {
        file: violation.file,
        message: violation.message,
        rule: violation.rule,
        lines: [violation.line],
      };
    } else {
      groupedViolations[key].lines.push(violation.line);
    }
  });

  return Object.values(groupedViolations)
    .map((violation: any) => {
      return `File: ${violation.file}\nLines: ${violation.lines.join(", ")}\nMessage: ${violation.message}\nRule: ${violation.rule}\n`;
    })
    .join("\n");
}

// Run Checkstyle and return simplified, grouped feedback
function runCheckstyle(filePath: string): string {
  try {
    const checkstylePath = "C:\\Checkstyle\\checkstyle-10.21.2-all.jar";
    const configFilePath = "C:\\Checkstyle\\google_checks.xml";
    const command = `java -jar "${checkstylePath}" -c "${configFilePath}" "${filePath}"`;
    const output = execSync(command, { encoding: "utf-8" });

    const violations = output
      .split("\n")
      .filter(line => line.includes("[WARN]"))
      .map(line => {
        const match = line.match(/\[WARN\] (.+):(\d+):(\d+): (.+) \[(.+)]/);
        if (match) {
          return {
            file: extractFileName(match[1]),
            line: parseInt(match[2]),
            column: parseInt(match[3]),
            message: simplifyCheckstyleMessage(match[4]),
            rule: match[5], 
          };
        }
        return null;
      })
      .filter(Boolean);

    return violations.length
      ? groupCheckstyleViolations(violations)
      : "✅ No Checkstyle violations detected.";
  } catch (error: any) {
    return `❌ Checkstyle Violations:\n${error.stdout || error.message}`;
  }
}

// Define rubric scoring based on specific feedback
type RubricScore = {
  codeCorrectness: number;
  readabilityStructure: number;
  logicEfficiency: number;
  errorHandling: number;
  outputDisplay: number;
};

// Assign scores based on feedback content
function evaluateRubric(llmFeedback: string, checkstyleFeedback: string, syntaxFeedback: string): RubricScore {
  let scores: RubricScore = {
    codeCorrectness: 1,
    readabilityStructure: 1,
    logicEfficiency: 1,
    errorHandling: 1,
    outputDisplay: 1,
  };

 // Code Correctness
if (llmFeedback.includes("all cases")) scores.codeCorrectness = 5;
else if (llmFeedback.includes("most cases") || llmFeedback.includes("handles edge cases")) scores.codeCorrectness = 4;
else if (llmFeedback.includes("minor errors") || llmFeedback.includes("misses some cases")) scores.codeCorrectness = 3;
else if (llmFeedback.includes("produces incorrect output")) scores.codeCorrectness = 2;
else if (llmFeedback.includes("fails to run") || llmFeedback.includes("throws errors")) scores.codeCorrectness = 1;

// Readability & Structure
if (llmFeedback.includes("well-structured") || llmFeedback.includes("properly indented")) scores.readabilityStructure = 5;
else if (llmFeedback.includes("mostly clean") || llmFeedback.includes("easy to follow")) scores.readabilityStructure = 4;
else if (llmFeedback.includes("somewhat readable") || llmFeedback.includes("minor formatting issues")) scores.readabilityStructure = 3;
else if (llmFeedback.includes("poor formatting") || llmFeedback.includes("difficult to follow")) scores.readabilityStructure = 2;
else if (llmFeedback.includes("messy") || llmFeedback.includes("hard to read")) scores.readabilityStructure = 1;

// Logic & Efficiency
if (llmFeedback.includes("most efficient") || llmFeedback.includes("optimal solution")) scores.logicEfficiency = 5;
else if (llmFeedback.includes("efficient logic") || llmFeedback.includes("minor optimization needed")) scores.logicEfficiency = 4;
else if (llmFeedback.includes("works but contains avoidable inefficiencies")) scores.logicEfficiency = 3;
else if (llmFeedback.includes("partially correct but inefficient")) scores.logicEfficiency = 2;
else if (llmFeedback.includes("inefficient logic") || llmFeedback.includes("redundant code")) scores.logicEfficiency = 1;

// Error Handling
if (llmFeedback.includes("handles all errors effectively") || llmFeedback.includes("handles edge cases")) scores.errorHandling = 5;
else if (llmFeedback.includes("handles most common errors")) scores.errorHandling = 4;
else if (llmFeedback.includes("basic error handling") || llmFeedback.includes("missing some scenarios")) scores.errorHandling = 3;
else if (llmFeedback.includes("handles few errors") || llmFeedback.includes("weak error handling")) scores.errorHandling = 2;
else if (llmFeedback.includes("no error handling present")) scores.errorHandling = 1;

// Output Display
if (llmFeedback.includes("clear output") || llmFeedback.includes("well-presented")) scores.outputDisplay = 5;
else if (llmFeedback.includes("mostly clear output") || llmFeedback.includes("easy to understand")) scores.outputDisplay = 4;
else if (llmFeedback.includes("works but lacks clarity") || llmFeedback.includes("minor display issues")) scores.outputDisplay = 3;
else if (llmFeedback.includes("output present but confusing")) scores.outputDisplay = 2;
else if (llmFeedback.includes("no output") || llmFeedback.includes("unclear display")) scores.outputDisplay = 1;

return scores;

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

    // LLM Evaluation
    const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
    const response = await openai.chat.completions.create({
      model: "ft:gpt-4o-mini-2024-07-18:personal::B3208MXR",
      messages: [
        { role: "system", content: "Evaluate the answer for correctness, logic, and suggest improvements." },
        { role: "user", content: `Question: ${question}` },
        { role: "user", content: `Student Answer:\n\`\`\`${studentCode}\n\`\`\`` }
      ],
      max_tokens: 300,
    });

    const llmFeedback = response.choices[0]?.message?.content || "No feedback received.";

    // Syntax and Checkstyle Evaluation
    let syntaxFeedback = "✅ No syntax check required.";
    let checkstyleFeedback = "✅ No Checkstyle violations detected.";

    if (isCodingQuestion(question) && isCodeInput(studentCode)) {
      const className = extractClassName(studentCode);
      const filename = `${className}.java`;
      const filePath = path.join(process.cwd(), filename);

      // Save code to a file
      fs.writeFileSync(filePath, studentCode);

      // Syntax Check using javac
      try {
        execSync(`javac "${filePath}"`, { stdio: "pipe" });
        syntaxFeedback = "✅ No syntax errors detected.";
      } catch (error: any) {
        syntaxFeedback = `❌ Syntax Error:\n${error.stderr.toString()}`;
      }

      // Run Checkstyle
      checkstyleFeedback = runCheckstyle(filePath);

      // Clean up generated files
      const classFile = filePath.replace(".java", ".class");
      if (fs.existsSync(classFile)) fs.unlinkSync(classFile);
      fs.unlinkSync(filePath);
    }

    // Calculate rubric scores
    const rubricScores = evaluateRubric(llmFeedback, checkstyleFeedback, syntaxFeedback);
    const totalScore = Object.values(rubricScores).reduce((sum, score) => sum + score, 0);

    // Return response
    return NextResponse.json({
      llmFeedback,
      syntaxAnalysis: syntaxFeedback,
      checkstyleAnalysis: checkstyleFeedback,
      rubricScores,
      totalScore: `${totalScore} / 25`
    });

  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Server Error", details: error.message }, { status: 500 });
  }
}
