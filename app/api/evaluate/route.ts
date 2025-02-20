import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai"; // Import OpenAI correctly

export async function POST(req: NextRequest) {
    try {
        console.log("🔄 API request received...");

        // Ensure the OpenAI API key is present
        const OPENAI_API_KEY = process.env.OPENAI_API_KEY; // Use secure API key
        if (!OPENAI_API_KEY) {
            console.error("❌ OpenAI API Key is missing!");
            return NextResponse.json({ error: "Server Error: Missing API Key." }, { status: 500 });
        }

        const body = await req.json();
        const { studentCode, question } = body;

        if (!studentCode || !question) {
            console.error("❌ Missing parameters:", { studentCode, question });
            return NextResponse.json({ error: "Missing required parameters." }, { status: 400 });
        }

        console.log("✅ OpenAI API Key found, sending request...");
        const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

        const response = await openai.chat.completions.create({
            model: "ft:gpt-4o-mini-2024-07-18:personal::B3208MXR", // Replace with your fine-tuned model ID
            messages: [
                { role: "system", content: "Evaluate the Java code for correctness and suggest fixes." },
                { role: "user", content: `Question: ${question}` },
                { role: "user", content: `Student Answer:\n\`\`\`java\n${studentCode}\n\`\`\`` }
            ],
            max_tokens: 300,
        });

        console.log("✅ OpenAI Response Received:", response);

        if (!response || !response.choices || response.choices.length === 0) {
            console.error("❌ Empty response from OpenAI.");
            return NextResponse.json({ error: "Empty response from OpenAI." }, { status: 500 });
        }

        return NextResponse.json({ evaluation: response.choices[0].message.content });

    } catch (error: any) {
        console.error("🔥 OpenAI API Error:", error);
        return NextResponse.json({ error: "Server Error: Failed to process request.", details: error.message }, { status: 500 });
    }
}
