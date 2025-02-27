import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";


// Function to extract public class name from Java code
export function extractClassName(javaCode: string): string {
    const match = javaCode.match(/public\s+class\s+(\w+)/);
    return match ? match[1] : "StudentCode";
  }
  
  // Determine if the question requires code evaluation
  function isCodingQuestion(question: string): boolean {
    const codingKeywords = ["code", "function", "method", "class", "array", "loop", "algorithm", "syntax", "compile", "program"];
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
export function simplifyCheckstyleMessage(message: string): string {
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
export function groupCheckstyleViolations(violations: any[]): string {
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
export function runCheckstyle(filePath: string): string {
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

  