import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { execSync } from "child_process";
import fs from "fs";

// Function to extract public class name from Java code
function extractClassName(javaCode: string): string {
    const match = javaCode.match(/public\s+class\s+(\w+)/);
    return match ? match[1] : "StudentCode"; // Default filename if no public class is found
}

// Function to determine if the question requires code evaluation
function isCodingQuestion(question: string): boolean {
    const codingKeywords = ["code", "function", "method", "class", "array", "loop", "algorithm", "syntax", "compile"];
    return codingKeywords.some(keyword => question.toLowerCase().includes(keyword));
}

// Function to check if student input looks like code
function isCodeInput(answer: string): boolean {
    const codeIndicators = ["public class", "{", "}", "return", ";", "System.out.println", "int ", "String "];
    return codeIndicators.some(indicator => answer.includes(indicator));
}

export async function POST(req: NextRequest) {
    try {
        console.log("🔄 API request received...");

        // ✅ Verify OpenAI API Key
        const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
        if (!OPENAI_API_KEY) {
            console.error("❌ OpenAI API Key is missing!");
            return NextResponse.json({ error: "Server Error: Missing API Key." }, { status: 500 });
        }

        // ✅ Parse Request Body
        let body;
        try {
            body = await req.json();
        } catch (err) {
            console.error("❌ Invalid JSON format:", err);
            return NextResponse.json({ error: "Invalid JSON format." }, { status: 400 });
        }

        const { studentCode, question } = body;

        if (!studentCode || !question) {
            console.error("❌ Missing parameters:", { studentCode, question });
            return NextResponse.json({
                error: "Bad Request: Missing studentCode or question."
            }, { status: 400 });
        }

        // ✅ 1️⃣ LLM Evaluation for All Questions
        console.log("✅ Sending request to OpenAI...");
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

        if (!response || !response.choices || response.choices.length === 0) {
            console.error("❌ Empty response from OpenAI.");
            return NextResponse.json({ error: "Empty response from OpenAI." }, { status: 500 });
        }

        const llmFeedback = response.choices[0].message.content;
        console.log("✅ LLM Feedback Received:", llmFeedback);

        // ✅ 2️⃣ Check if Question and Answer Require Code Compilation
        let syntaxFeedback = "✅ No syntax check required (essay-type question or non-code answer).";

        if (isCodingQuestion(question) && isCodeInput(studentCode)) {
            // Run javac only for coding questions with valid-looking code input
            const className = extractClassName(studentCode);
            const filename = `${className}.java`;
            fs.writeFileSync(filename, studentCode);

            try {
                execSync(`javac ${filename}`, { stdio: "pipe" });
                syntaxFeedback = "✅ No syntax errors detected.";
            } catch (error: any) {
                syntaxFeedback = `❌ Syntax Error:\n${error.stderr.toString()}`;
            }

            // Cleanup compiled Java files
            const classFile = filename.replace(".java", ".class");
            if (fs.existsSync(classFile)) fs.unlinkSync(classFile);
            fs.unlinkSync(filename);
        }

        // ✅ 3️⃣ Return the Final Combined Result
        return NextResponse.json({
            llmFeedback,
            syntaxAnalysis: syntaxFeedback
        });

    } catch (error: any) {
        console.error("🔥 API Error:", error);
        return NextResponse.json({ error: "Server Error: Failed to process request.", details: error.message }, { status: 500 });
    }
}
