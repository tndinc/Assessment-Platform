import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

interface EditQuestionProps {
  questionId: number;
  questionText?: string; // Make questionText optional
  questionPoints?: number; // Make questionPoints optional
  choices?: string[]; // Make choices optional
  correctChoice?: number | null; // Make correctChoice optional
  onQuestionUpdated: () => void; // Define the function type
}

const EditQuestion: React.FC<EditQuestionProps> = ({
  questionId,
  questionText, // Provide default values
  questionPoints,
  choices = ["", "", "", ""],
  correctChoice = null,
  onQuestionUpdated,
}) => {
  const [localQuestionText, setQuestionText] = useState(questionText); // Use props if available
  const [localQuestionPoints, setQuestionPoints] = useState(questionPoints); // Use props if available
  const [localChoices, setChoices] = useState(choices); // Use props if available
  const [localCorrectChoice, setCorrectChoice] = useState(correctChoice); // Use props if available
  const [isOpen, setIsOpen] = useState(false); // State for modal open/close

  // Fetch question details when the component mounts
  useEffect(() => {
    const fetchQuestionDetails = async () => {
      const { data: questionData } = await supabase
        .from("question_tbl")
        .select(
          "question_desc, question_points, question_answer, choices:choices_tbl (question_txt)"
        )
        .eq("question_id", questionId)
        .single();

      if (questionData) {
        setQuestionText(questionData.question_desc);
        setQuestionPoints(questionData.question_points);
        setChoices(
          questionData.choices.map((choice: any) => choice.question_txt)
        );

        const correctAnswerIndex = questionData.choices.findIndex(
          (choice: any) => choice.question_txt === questionData.question_answer
        );
        setCorrectChoice(correctAnswerIndex);
      }
    };

    fetchQuestionDetails();
  }, [questionId]);

  const handleEditQuestion = async () => {
    // Update the question in question_tbl
    const { error: questionError } = await supabase
      .from("question_tbl")
      .update({
        question_desc: questionText,
        question_points: questionPoints,
        question_answer: choices[correctChoice!],
      })
      .eq("question_id", questionId);

    if (!questionError) {
      // Assuming you have choices with their IDs
      const { data: existingChoices } = await supabase
        .from("choices_tbl")
        .select("choices_id")
        .eq("question_id", questionId);

      if (existingChoices) {
        for (let i = 0; i < choices.length; i++) {
          const choiceId = existingChoices[i]?.choices_id; // Get the choices_id

          if (choiceId) {
            // Update each choice in choices_tbl using the correct choices_id
            await supabase
              .from("choices_tbl")
              .update({ question_txt: choices[i] })
              .eq("question_id", questionId)
              .eq("choices_id", choiceId); // Use the actual choices_id here
          }
        }
      }
      alert("Question updated successfully");
      onQuestionUpdated();
      setIsOpen(false); // Close the modal after submission
    } else {
      console.error("Error updating question:", questionError);
      alert("Failed to update question.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="dark:text-white">
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Edit Question</DialogTitle>
        <DialogDescription>
          Modify the question and its choices below.
        </DialogDescription>

        <Label htmlFor="question">Question Text</Label>
        <Input
          id="question"
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
        />

        <Label htmlFor="points">Points</Label>
        <Input
          id="points"
          type="number"
          value={questionPoints}
          onChange={(e) => setQuestionPoints(Number(e.target.value))}
        />

        {choices.map((choice, index) => (
          <div key={index}>
            <Label htmlFor={`choice-${index}`}>Choice {index + 1}</Label>
            <Input
              id={`choice-${index}`}
              value={choice}
              onChange={(e) => {
                const updatedChoices = [...choices];
                updatedChoices[index] = e.target.value;
                setChoices(updatedChoices);
              }}
            />
          </div>
        ))}

        <Label>Correct Choice</Label>
        <Select onValueChange={(value) => setCorrectChoice(Number(value) - 1)}>
          <SelectTrigger>
            {correctChoice !== null
              ? `Choice ${correctChoice + 1}`
              : "Select Correct Choice"}
          </SelectTrigger>
          <SelectContent>
            {choices.map((_, index) => (
              <SelectItem key={index} value={(index + 1).toString()}>
                Choice {index + 1}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button onClick={handleEditQuestion}>Update Question</Button>
      </DialogContent>
    </Dialog>
  );
};

export default EditQuestion;
