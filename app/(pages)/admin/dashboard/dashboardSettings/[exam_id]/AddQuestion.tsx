import React, { useState } from "react";
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
import { PlusCircle } from "lucide-react";

const supabase = createClient();

type Topic = {
  topic_id: number;
  topic_title: string;
};

interface AddQuestionProps {
  exam_id: number; // Pass exam_id to filter topics
  onQuestionAdded: () => void; // Callback to notify parent component
  topics: Topic[]; // Accept topics as a prop
}

const AddQuestion: React.FC<AddQuestionProps> = ({
  exam_id,
  onQuestionAdded,
  topics,
}) => {
  const [selectedTopic, setSelectedTopic] = useState<number | null>(null);
  const [points, setPoints] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [choices, setChoices] = useState<string[]>(["", "", "", ""]);
  const [correctChoice, setCorrectChoice] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const resetForm = () => {
    setSelectedTopic(null);
    setPoints("");
    setQuestionText("");
    setChoices(["", "", "", ""]);
    setCorrectChoice(null);
  };

  const handleAddQuestion = async () => {
    if (!selectedTopic || !points || !questionText || correctChoice === null) {
      alert("Please fill out all fields.");
      return;
    }

    const { data: questionData, error: questionError } = await supabase
      .from("question_tbl")
      .insert({
        topic_id: selectedTopic,
        question_points: parseInt(points),
        question_desc: questionText,
        question_answer: choices[correctChoice],
      })
      .select();

    if (questionData && questionData.length > 0) {
      const question_id = questionData[0].question_id;
      const choiceInserts = choices.map((choice) => ({
        question_id,
        question_txt: choice,
      }));
      await supabase.from("choices_tbl").insert(choiceInserts);
      alert("Question added successfully!");
      resetForm();
      setIsOpen(false);
      onQuestionAdded(); // Notify parent component
    } else {
      console.error(questionError);
      alert("Failed to add question.");
    }
  };

  return (
    <div>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button className="dark:bg-blue-500" onClick={() => setIsOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Question
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>Add a New Question</DialogTitle>
          <DialogDescription>
            Fill in the question details and choices below.
          </DialogDescription>

          {/* Topic Select */}
          <Label htmlFor="topic">Choose Topic</Label>
          <Select onValueChange={(value) => setSelectedTopic(Number(value))}>
            <SelectTrigger>
              {selectedTopic
                ? topics.find((t) => t.topic_id === selectedTopic)?.topic_title
                : "Select Topic"}
            </SelectTrigger>
            <SelectContent>
              {topics.map((topic) => (
                <SelectItem
                  key={topic.topic_id}
                  value={topic.topic_id.toString()}
                >
                  {topic.topic_title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Points Input */}
          <Label htmlFor="points">Points</Label>
          <Input
            id="points"
            type="number"
            value={points}
            onChange={(e) => setPoints(e.target.value)}
            placeholder="Enter points"
          />

          {/* Question Text */}
          <Label htmlFor="question">Question Text</Label>
          <Input
            id="question"
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder="Enter the question"
          />

          {/* Choices Inputs */}
          {choices.map((choice, index) => (
            <div key={index}>
              <Label htmlFor={`choice-${index}`}>Choice {index + 1}</Label>
              <Input
                id={`choice-${index}`}
                value={choice}
                onChange={(e) => {
                  const newChoices = [...choices];
                  newChoices[index] = e.target.value;
                  setChoices(newChoices);
                }}
                placeholder={`Enter choice ${index + 1}`}
              />
            </div>
          ))}

          {/* Correct Choice Select */}
          <Label>Correct Choice</Label>
          <Select onValueChange={(value) => setCorrectChoice(Number(value))}>
            <SelectTrigger>
              {correctChoice !== null
                ? `Choice ${correctChoice + 1}`
                : "Select Correct Choice"}
            </SelectTrigger>
            <SelectContent>
              {choices.map((_, index) => (
                <SelectItem key={index} value={index.toString()}>
                  Choice {index + 1}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Submit Button */}
          <Button onClick={handleAddQuestion}>Submit Question</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddQuestion;
