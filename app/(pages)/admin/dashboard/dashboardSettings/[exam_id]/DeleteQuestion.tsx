import React, { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

interface DeleteQuestionProps {
  questionId: number;
  onQuestionDeleted: () => void;
}

const DeleteQuestion: React.FC<DeleteQuestionProps> = ({
  questionId,
  onQuestionDeleted,
}) => {
  const [isOpen, setIsOpen] = useState(false); // Local state for dialog open/close

  const handleDeleteQuestion = async () => {
    const { error: deleteError } = await supabase
      .from("question_tbl")
      .delete()
      .eq("question_id", questionId);

    if (!deleteError) {
      alert("Question deleted successfully");
      onQuestionDeleted(); // Refresh the questions list
      setIsOpen(false); // Close the modal after successful deletion
    } else {
      console.error("Error deleting question:", deleteError);
      alert("Failed to delete question.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="dark:text-white">
          Delete
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Delete Question</DialogTitle>
        <DialogDescription>
          Are you sure you want to delete this question?
        </DialogDescription>
        <Button onClick={handleDeleteQuestion} variant="destructive">
          Delete
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteQuestion;
