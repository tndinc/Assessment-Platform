// DeleteTopic.tsx
import React from "react";
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

interface DeleteTopicProps {
  topicId: string;
  onTopicDeleted: () => void;
}

const DeleteTopic: React.FC<DeleteTopicProps> = ({
  topicId,
  onTopicDeleted,
}) => {
  const handleDeleteTopic = async () => {
    const { error: deleteError } = await supabase
      .from("topic_tbl")
      .delete()
      .eq("topic_id", topicId);

    if (!deleteError) {
      alert("Topic deleted successfully");
      onTopicDeleted(); // Refresh the list after deleting
    } else {
      console.error("Error deleting topic:", deleteError);
      alert("Failed to delete topic.");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive">Delete Topic</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Delete Topic</DialogTitle>
        <DialogDescription>
          Are you sure you want to delete this topic?
        </DialogDescription>
        <Button onClick={handleDeleteTopic} variant="destructive">
          Delete
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteTopic;
