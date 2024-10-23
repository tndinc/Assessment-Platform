import { createClient } from "@/utils/supabase/client";
import { useState } from "react";
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
import { PlusCircle } from "lucide-react";

const supabase = createClient();

const AddTopic = ({
  examId,
  onTopicAdded,
}: {
  examId: string;
  onTopicAdded: () => void;
}) => {
  const [topicTitle, setTopicTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddTopic = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Check if the topic already exists for this exam
      const { data: existingTopics, error: fetchError } = await supabase
        .from("topic_tbl")
        .select("*")
        .eq("exam_id", examId)
        .eq("topic_title", topicTitle);

      if (fetchError) throw fetchError;

      // If the topic already exists, show an error
      if (existingTopics && existingTopics.length > 0) {
        setError("Topic with this title already exists for this exam.");
        setIsLoading(false);
        return;
      }

      // Proceed to add the new topic if it's not a duplicate
      const { data, error } = await supabase.from("topic_tbl").insert([
        {
          exam_id: examId,
          topic_title: topicTitle,
        },
      ]);

      if (error) throw error;

      // Clear input and call the onTopicAdded callback
      setSuccess(true);
      setTopicTitle("");
      onTopicAdded(); // Notify parent component
    } catch (err) {
      setError("Failed to add topic. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Reset error and success state when the dialog opens or closes
  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      // Reset error and success when dialog is closed
      setError(null);
      setSuccess(false);
      setTopicTitle("");
    }
  };

  return (
    <div className="flex flex-col space-y-2">
      <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogTrigger asChild>
          <Button className="dark:bg-blue-500">
            {" "}
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Topic
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Topic</DialogTitle>
            <DialogDescription>
              Enter the title for the new topic you want to add.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="text"
              placeholder="Topic Title"
              value={topicTitle}
              onChange={(e) => setTopicTitle(e.target.value)}
            />
            {success && (
              <p className="text-green-500">Topic added successfully!</p>
            )}
            {error && <p className="text-red-500">{error}</p>}
            <Button
              onClick={handleAddTopic}
              disabled={isLoading || !topicTitle}
            >
              {isLoading ? "Adding..." : "Add Topic"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddTopic;
