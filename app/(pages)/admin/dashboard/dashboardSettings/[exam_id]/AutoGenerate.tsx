"use client";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Loader2 } from "lucide-react";
import OpenAI from "openai";
import mammoth from "mammoth";
import * as pdfjsLib from "pdfjs-dist";

const supabase = createClient();
const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || "",
  dangerouslyAllowBrowser: true,
});

const MAX_CHUNK_CHARS = 4000;

interface Topic {
  title: string;
  questions: {
    description: string;
    choices: string[];
    answer: string;
  }[];
}

interface AutoGenerateFormProps {
  examId: string;
  onContentAdded: () => void;
}

const readFileContent = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const fileExtension = file.name.split(".").pop()?.toLowerCase();

        if (
          fileExtension === "txt" ||
          fileExtension === "csv" ||
          fileExtension === "json" ||
          fileExtension === "xml" ||
          fileExtension === "html"
        ) {
          // Handle text files (txt, csv, json, xml, html)
          const text = event.target?.result as string;
          const cleanText = cleanTextContent(text);
          resolve(cleanText);
        } else if (fileExtension === "pdf") {
          // Handle PDF files
          const pdfText = await extractTextFromPDF(file);
          resolve(pdfText);
        } else if (fileExtension === "docx") {
          // Handle DOCX files
          const docxText = await extractTextFromDocx(file);
          resolve(docxText);
        } else {
          reject(new Error("Unsupported file type."));
        }
      } catch (error) {
        reject(new Error("Failed to process the file content."));
      }
    };

    reader.onerror = () => {
      reject(new Error("Failed to read the file."));
    };

    reader.readAsArrayBuffer(file); // Use ArrayBuffer to handle binary files like PDFs and DOCX
  });
};

const cleanTextContent = (text: string): string => {
  return text
    .replace(/\s+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/([.!?])\s*([A-Z])/g, "$1\n$2")
    .replace(/\n\s+/g, "\n")
    .replace(/[^\S\r\n]+/g, " ")
    .replace(/\.{3,}/g, "...")
    .trim();
};

// Extract text from PDF using pdf.js
const extractTextFromPDF = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const typedArray = new Uint8Array(event.target?.result as ArrayBuffer);
        const pdf = await pdfjsLib.getDocument(typedArray).promise;
        let pdfText = "";

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();
          const textItems = textContent.items
            .map((item: any) => item.str)
            .join(" ");
          pdfText += textItems + "\n";
        }

        resolve(cleanTextContent(pdfText));
      } catch (error) {
        reject(new Error("Failed to extract text from PDF."));
      }
    };

    reader.readAsArrayBuffer(file);
  });
};

// Extract text from DOCX using Mammoth.js
const extractTextFromDocx = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const arrayBuffer = event.target?.result as ArrayBuffer;
        const result = await mammoth.extractRawText({ arrayBuffer });
        const text = result.value;
        resolve(cleanTextContent(text));
      } catch (error) {
        reject(new Error("Failed to extract text from DOCX."));
      }
    };

    reader.readAsArrayBuffer(file);
  });
};

const splitIntoSmallChunks = (
  text: string,
  maxChunkSize: number = MAX_CHUNK_CHARS
): string[] => {
  const paragraphs = text.split(/\n+/).filter((p) => p.trim().length > 0);
  const chunks: string[] = [];
  let currentChunk = "";

  for (const paragraph of paragraphs) {
    if (paragraph.length > maxChunkSize) {
      const sentences = paragraph.match(/[^.!?]+[.!?]+/g) || [paragraph];

      for (const sentence of sentences) {
        if (currentChunk.length + sentence.length > maxChunkSize) {
          if (currentChunk) chunks.push(currentChunk.trim());
          currentChunk = sentence;
        } else {
          currentChunk += (currentChunk ? " " : "") + sentence;
        }
      }
    } else if (currentChunk.length + paragraph.length > maxChunkSize) {
      chunks.push(currentChunk.trim());
      currentChunk = paragraph;
    } else {
      currentChunk += (currentChunk ? "\n\n" : "") + paragraph;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }

  return chunks.map((chunk) => chunk.replace(/\s+/g, " ").trim());
};

const AutoGenerateForm = ({
  examId,
  onContentAdded,
}: AutoGenerateFormProps) => {
  const [topicCount, setTopicCount] = useState<number>(1);
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);

  const generateContent = async (
    chunk: string,
    requestedTopics: number
  ): Promise<Topic[]> => {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `Create exactly${requestedTopics} topic(s) with exactly ${questionCount} multiple-choice questions per topic based on the provided text. Each question MUST have exactly 4 choices(If it cant process choices just put random choices connected to the questions). Return only valid JSON in format: {"topics":[{"title":"Topic Title","questions":[{"description":"Question","choices":["A","B","C","D"],"answer":"Correct Answer"}]}]}`,
          },
          {
            role: "user",
            content: chunk,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error("No content generated");

      try {
        const parsed = JSON.parse(content);
        return parsed.topics || [];
      } catch {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("Invalid response format");
        return JSON.parse(jsonMatch[0]).topics || [];
      }
    } catch (error) {
      console.error("OpenAI API Error:", error);
      return [];
    }
  };

  const saveTopicsToDatabase = async (topics: Topic[]): Promise<boolean> => {
    try {
      for (const topic of topics) {
        const { data: topicData, error: topicError } = await supabase
          .from("topic_tbl")
          .insert([{ exam_id: examId, topic_title: topic.title }])
          .select();

        if (topicError) throw topicError;
        if (!topicData?.[0]) continue;

        const topicId = topicData[0].topic_id;

        for (const question of topic.questions) {
          const { data: questionData, error: questionError } = await supabase
            .from("question_tbl")
            .insert([
              {
                topic_id: topicId,
                question_desc: question.description,
                question_points: 1,
                question_answer: question.answer,
              },
            ])
            .select();

          if (questionError || !questionData?.[0]) continue;

          const questionId = questionData[0].question_id;

          const choicesData = question.choices.map((choice) => ({
            question_id: questionId,
            question_txt: choice,
          }));

          await supabase.from("choices_tbl").insert(choicesData);
        }
      }
      return true;
    } catch (error) {
      console.error("Database Error:", error);
      return false;
    }
  };

  const handleSave = async () => {
    if (!file) {
      setError("Please upload a file.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setProgress(0);

    try {
      const fileContent = await readFileContent(file);
      const chunks = splitIntoSmallChunks(fileContent);
      let allTopics: Topic[] = [];

      // Generate all topics at once from the first chunk
      const topics = await generateContent(chunks[0], topicCount);

      if (!topics || topics.length !== topicCount) {
        throw new Error(
          `Failed to generate the requested number of topics (${topicCount}). Please try again.`
        );
      }
      allTopics = topics;
      setProgress(50); // Set progress to 50% after generating topics

      const savedSuccessfully = await saveTopicsToDatabase(allTopics);
      if (savedSuccessfully) {
        onContentAdded();
        setIsDialogOpen(false);
      } else {
        throw new Error("Failed to save content to database.");
      }

      setProgress(100);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col space-y-2">
      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => setIsDialogOpen(open)}
      >
        <DialogTrigger asChild>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Auto Generate Content
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Auto Generate Topics and Questions</DialogTitle>
            <DialogDescription>
              Upload a Word Document file to automatically generate exam
              content.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <label htmlFor="topicCount">Number of Topics</label>
                <Input
                  id="topicCount"
                  type="number"
                  min={1}
                  max={3}
                  onChange={(e) =>
                    setTopicCount(
                      Math.max(1, Math.min(3, Number(e.target.value)))
                    )
                  }
                  disabled={isLoading}
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="questionCount">Questions per Topic</label>
                <Input
                  id="questionCount"
                  type="number"
                  min={5}
                  max={50}
                  onChange={(e) =>
                    setQuestionCount(
                      Math.max(5, Math.min(50, Number(e.target.value)))
                    )
                  }
                  disabled={isLoading}
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="file">Word File</label>
                <Input
                  id="file"
                  type="file"
                  accept=".doc,.docx"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  disabled={isLoading}
                />
              </div>
            </div>

            {isLoading && (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Processing... {Math.round(progress)}%</span>
              </div>
            )}

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isLoading || !file}>
                {isLoading ? "Generating..." : "Generate & Save"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AutoGenerateForm;
