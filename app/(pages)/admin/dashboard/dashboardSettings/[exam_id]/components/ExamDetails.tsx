"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "./ui/use-toast";

const supabase = createClient();

type Exam = {
  exam_id: number;
  course_id: string;
  exam_title: string;
  exam_desc: string;
  exam_time_limit: number;
  exam_points: number;
  exam_created_by: string;
  status: string;
  subject: string;
  deadline: string;
};

export default function ExamDetails({ examId }: { examId: number }) {
  const [exam, setExam] = useState<Exam | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchExamDetails = async () => {
      try {
        const { data, error } = await supabase
          .from("exam_tbl")
          .select("*")
          .eq("exam_id", examId)
          .single();

        if (error) throw error;
        setExam(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load exam details",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchExamDetails();
  }, [examId]);

  const handleUpdate = async () => {
    if (!exam) return;

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from("exam_tbl")
        .update({
          exam_title: exam.exam_title,
          exam_desc: exam.exam_desc,
          exam_time_limit: exam.exam_time_limit,
          exam_points: exam.exam_points,
          exam_created_by: exam.exam_created_by,
          deadline: exam.deadline,
          status: exam.status,
          subject: exam.subject,
        })
        .eq("exam_id", examId);

      if (error) throw error;

      toast({
        title: "Exam details updated",
        description: "Your changes have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update exam details",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!exam) {
    return <div>Exam not found</div>;
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-4 sm:p-6 flex-1 lg:w-2/5 overflow-auto">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        Exam Details
      </h2>
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Exam Title
          </label>
          <Input
            id="title"
            value={exam.exam_title}
            onChange={(e) => setExam({ ...exam, exam_title: e.target.value })}
            className="w-full"
          />
        </div>
        <div>
          <label
            htmlFor="subject"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Subject
          </label>
          <Input
            id="subject"
            value={exam.subject}
            onChange={(e) => setExam({ ...exam, subject: e.target.value })}
            className="w-full"
          />
        </div>
        <div>
          <label
            htmlFor="timeLimit"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Time Limit (minutes)
          </label>
          <Input
            id="timeLimit"
            type="number"
            value={exam.exam_time_limit}
            onChange={(e) =>
              setExam({
                ...exam,
                exam_time_limit: Number.parseInt(e.target.value),
              })
            }
            className="w-full"
          />
        </div>
        <div>
          <label
            htmlFor="points"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Total Points
          </label>
          <Input
            id="points"
            type="number"
            value={exam.exam_points}
            onChange={(e) =>
              setExam({ ...exam, exam_points: Number.parseInt(e.target.value) })
            }
            className="w-full"
          />
        </div>
        <div>
          <label
            htmlFor="createdBy"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Created By
          </label>
          <Input
            id="createdBy"
            value={exam.exam_created_by}
            onChange={(e) =>
              setExam({ ...exam, exam_created_by: e.target.value })
            }
            className="w-full"
          />
        </div>
        <div>
          <label
            htmlFor="deadline"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Deadline
          </label>
          <Input
            id="deadline"
            type="datetime-local"
            value={exam.deadline}
            onChange={(e) => setExam({ ...exam, deadline: e.target.value })}
            className="w-full"
          />
        </div>
        <div>
          <label
            htmlFor="status"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Status
          </label>
          <select
            id="status"
            value={exam.status}
            onChange={(e) => setExam({ ...exam, status: e.target.value })}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="open">Open</option>

            <option value="close">Closed</option>
          </select>
        </div>
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Exam Description
          </label>
          <Textarea
            id="description"
            value={exam.exam_desc}
            onChange={(e) => setExam({ ...exam, exam_desc: e.target.value })}
            className="w-full"
            rows={3}
          />
        </div>
      </div>
      <Button
        onClick={handleUpdate}
        className="mt-4 w-full"
        disabled={isUpdating}
      >
        {isUpdating ? "Updating..." : "Update Exam Details"}
      </Button>
    </div>
  );
}
