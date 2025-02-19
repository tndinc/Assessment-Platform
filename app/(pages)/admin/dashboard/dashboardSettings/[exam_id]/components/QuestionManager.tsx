"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Edit, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "./ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const supabase = createClient();

type Question = {
  id: number;
  question_txt: string;
  exam_id: number;
  type: string;
  points: number;
};

type Exam = {
  exam_id: number;
  exam_title: string;
  subject: string;
};

export default function QuestionManager({ examId }: { examId: number }) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [examDetails, setExamDetails] = useState<Exam | null>(null);
  const [newQuestion, setNewQuestion] = useState({
    question_txt: "",
    type: "easy",
    points: 0,
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const questionsPerPage = 5;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: examData, error: examError } = await supabase
          .from("exam_tbl")
          .select("exam_id, exam_title, subject")
          .eq("exam_id", examId)
          .single();

        if (examError) throw examError;
        setExamDetails(examData);

        const { data: questionsData, error: questionsError } = await supabase
          .from("question_tbl2")
          .select("*")
          .eq("exam_id", examId);

        if (questionsError) throw questionsError;
        setQuestions(questionsData);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load exam data",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [examId]);

  const addQuestion = async () => {
    if (newQuestion.question_txt && newQuestion.points > 0) {
      try {
        const { data, error } = await supabase
          .from("question_tbl2")
          .insert([
            {
              question_txt: newQuestion.question_txt,
              exam_id: examId,
              type: newQuestion.type,
              points: newQuestion.points,
            },
          ])
          .select()
          .single();

        if (error) throw error;

        setQuestions([...questions, data]);
        setNewQuestion({
          question_txt: "",
          type: "multiple_choice",
          points: 0,
        });
        setIsDialogOpen(false);
        toast({
          title: "Question added",
          description: "Your new question has been added successfully.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to add question",
        });
      }
    }
  };

  const deleteQuestion = async (id: number) => {
    try {
      const { error } = await supabase
        .from("question_tbl2")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setQuestions(questions.filter((q) => q.id !== id));
      toast({
        title: "Question deleted",
        description: "The question has been removed from the exam.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete question",
      });
    }
  };

  const startEditing = (question: Question) => {
    setEditingId(question.id);
    setNewQuestion({
      question_txt: question.question_txt,
      type: question.type,
      points: question.points,
    });
    setIsDialogOpen(true);
  };

  const updateQuestion = async () => {
    if (!editingId) return;

    try {
      const { data, error } = await supabase
        .from("question_tbl2")
        .update({
          question_txt: newQuestion.question_txt,
          type: newQuestion.type,
          points: newQuestion.points,
        })
        .eq("id", editingId)
        .select()
        .single();

      if (error) throw error;

      setQuestions(questions.map((q) => (q.id === editingId ? data : q)));
      setEditingId(null);
      setNewQuestion({ question_txt: "", type: "multiple_choice", points: 0 });
      setIsDialogOpen(false);
      toast({
        title: "Question updated",
        description: "Your changes have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update question",
      });
    }
  };

  const indexOfLastQuestion = currentPage * questionsPerPage;
  const indexOfFirstQuestion = indexOfLastQuestion - questionsPerPage;
  const currentQuestions = questions.slice(
    indexOfFirstQuestion,
    indexOfLastQuestion
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-4 sm:p-6 flex-1 flex flex-col overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">
            {examDetails?.exam_title}
          </h2>
          <p className="text-sm text-gray-500">
            Subject: {examDetails?.subject}
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingId(null);
                setNewQuestion({
                  question_txt: "",
                  type: "multiple_choice",
                  points: 0,
                });
              }}
            >
              <Plus className="h-4 w-4 mr-2" /> Add Question
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Edit Question" : "Add New Question"}
              </DialogTitle>
              <DialogDescription>
                {editingId
                  ? "Make changes to your question here."
                  : "Create a new question for your exam."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Question Type
                </label>
                <select
                  value={newQuestion.type}
                  onChange={(e) =>
                    setNewQuestion({ ...newQuestion, type: e.target.value })
                  }
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Points
                </label>
                <Input
                  type="number"
                  value={newQuestion.points}
                  onChange={(e) =>
                    setNewQuestion({
                      ...newQuestion,
                      points: Number(e.target.value),
                    })
                  }
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Question Text
                </label>
                <Textarea
                  value={newQuestion.question_txt}
                  onChange={(e) =>
                    setNewQuestion({
                      ...newQuestion,
                      question_txt: e.target.value,
                    })
                  }
                  placeholder="Enter question text"
                  className="w-full"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={editingId ? updateQuestion : addQuestion}>
                {editingId ? "Update" : "Add"} Question
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <div className="flex-1 overflow-auto space-y-2">
        {currentQuestions.map((question) => (
          <div
            key={question.id}
            className="flex items-center justify-between bg-gray-50 p-4 rounded-md"
          >
            <div className="flex-1 mr-4">
              <p className="text-gray-800">{question.question_txt}</p>
              <div className="flex gap-4 mt-1 text-sm text-gray-500">
                <span>Type: {question.type}</span>
                <span>Points: {question.points}</span>
              </div>
            </div>
            <div className="flex space-x-2 flex-shrink-0">
              <Button
                variant="outline"
                size="icon"
                onClick={() => startEditing(question)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => deleteQuestion(question.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
      {questions.length > questionsPerPage && (
        <div className="flex justify-center items-center mt-4 space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            Page {currentPage} of{" "}
            {Math.ceil(questions.length / questionsPerPage)}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() =>
              setCurrentPage((prev) =>
                Math.min(
                  prev + 1,
                  Math.ceil(questions.length / questionsPerPage)
                )
              )
            }
            disabled={
              currentPage === Math.ceil(questions.length / questionsPerPage)
            }
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
