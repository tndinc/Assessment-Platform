import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AddTopic from "./AddTopic";
import { createClient } from "@/utils/supabase/client";
import AddQuestion from "./AddQuestion";
import EditQuestion from "./EditQuestion";
import DeleteQuestion from "./DeleteQuestion";
import DeleteTopic from "./DeleteTopic";

const supabase = createClient();

const ExamSection = () => {
  const [topics, setTopics] = useState<any[]>([]);
  const [examPoints, setExamPoints] = useState<number>(0);
  const [totalQuestionPoints, setTotalQuestionPoints] = useState<number>(0);
  const { exam_id } = useParams<{ exam_id: string }>();

  useEffect(() => {
    const fetchExamData = async () => {
      const { data: examData, error: examError } = await supabase
        .from("exam_tbl")
        .select("exam_points")
        .eq("exam_id", exam_id)
        .single();

      if (examError) {
        console.error("Error fetching exam points:", examError);
      } else if (examData) {
        setExamPoints(examData.exam_points);
      }

      const { data: topicData, error: topicError } = await supabase
        .from("topic_tbl")
        .select(
          `
          topic_id,
          topic_title,
          questions:question_tbl (
            question_id,
            question_desc,
            question_points,
            question_answer,
            choices:choices_tbl (
              choices_id,
              question_txt
            )
          )
        `
        )
        .eq("exam_id", exam_id);

      if (topicError) {
        console.error("Error fetching topics and questions:", topicError);
      } else {
        setTopics(topicData);
        updateTotalPoints(topicData); // Update total points on initial load
      }
    };

    if (exam_id) fetchExamData();
  }, [exam_id]);

  const updateTotalPoints = (topicData: any[]) => {
    const totalPoints = topicData.reduce((total: number, topic: any) => {
      const topicPoints = topic.questions.reduce(
        (sum: number, question: any) => sum + question.question_points,
        0
      );
      return total + topicPoints;
    }, 0);
    setTotalQuestionPoints(totalPoints);
  };

  const handleTopicAdded = async () => {
    const { data, error } = await supabase
      .from("topic_tbl")
      .select(
        `
        topic_id,
        topic_title,
        questions:question_tbl (
          question_id,
          question_desc,
          question_points,
          question_answer,
          choices:choices_tbl (
            choices_id,
            question_txt
          )
        )
      `
      )
      .eq("exam_id", exam_id);
    if (error) {
      console.error("Error fetching updated topics:", error);
    } else {
      setTopics(data);
      updateTotalPoints(data); // Recalculate total points after fetching
    }
  };

  const handleTopicDeleted = async () => {
    await handleTopicAdded(); // Refresh topics after deletion
  };

  // Updated fetchUpdatedQuestions function to also update total points
  const fetchUpdatedQuestions = async (topic_id: string) => {
    const { data, error } = await supabase
      .from("question_tbl")
      .select(
        `
        question_id,
        question_desc,
        question_points,
        question_answer,
        choices:choices_tbl (
          choices_id,
          question_txt
        )
      `
      )
      .eq("topic_id", topic_id);

    if (error) {
      console.error("Error fetching questions:", error);
    } else {
      const updatedTopics = topics.map((topic) => {
        if (topic.topic_id === topic_id) {
          return { ...topic, questions: data };
        }
        return topic;
      });
      setTopics(updatedTopics);
      updateTotalPoints(updatedTopics); // Update total points after deletion
    }
  };

  return (
    <>
      <Card className="w-48 shrink-0 bg-white dark:bg-gray-800 dark:text-white">
        <CardHeader>
          <CardTitle className="text-lg font-semibold dark:text-white">
            Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col space-y-2">
          <AddTopic examId={exam_id} onTopicAdded={handleTopicAdded} />
          <AddQuestion
            exam_id={parseInt(exam_id)}
            onQuestionAdded={handleTopicAdded} // Call handleTopicAdded to update
            topics={topics} // Pass the topics here
          />
          <Button className="dark:bg-blue-500">View Response</Button>
          <Button className="dark:bg-blue-500">Analytics</Button>
        </CardContent>
      </Card>

      <Card className="flex-grow bg-white dark:bg-gray-800 dark:text-white relative">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-semibold dark:text-white">
              Exam Questions and Topics
            </CardTitle>
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Total Points: {totalQuestionPoints} / {examPoints}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs
            defaultValue={topics[0]?.topic_id.toString()}
            className="w-full"
          >
            <TabsList className="justify-start mb-4 dark:bg-gray-700">
              {topics.map((topic) => (
                <TabsTrigger
                  key={topic.topic_id}
                  value={topic.topic_id.toString()}
                  className="dark:text-white"
                >
                  {topic.topic_title}
                </TabsTrigger>
              ))}
            </TabsList>

            {topics.map((topic) => (
              <TabsContent
                key={topic.topic_id}
                value={topic.topic_id.toString()}
                className="h-[calc(100vh-400px)] overflow-y-auto"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold dark:text-white">
                    Exam Questions for {topic.topic_title}
                  </h3>
                  <DeleteTopic
                    topicId={topic.topic_id}
                    onTopicDeleted={handleTopicDeleted} // Handle topic deletion
                  />
                </div>

                {topic.questions && topic.questions.length > 0 ? (
                  topic.questions.map((question) => (
                    <Card
                      key={question.question_id}
                      className="mb-4 bg-gray-100 dark:bg-gray-700 dark:text-white"
                    >
                      <CardHeader>
                        <CardTitle className="text-base dark:text-white">
                          {question.question_desc} ({question.question_points}{" "}
                          points)
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="mt-2">
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                            <strong>Answer:</strong> {question.question_answer}
                          </p>
                          <div>
                            {question.choices.map(
                              (choice: any, index: number) => (
                                <p
                                  key={choice.choices_id}
                                  className={`text-sm ${
                                    question.question_answer ===
                                    choice.question_txt
                                      ? "text-green-500"
                                      : "text-gray-600 dark:text-gray-300"
                                  }`}
                                >
                                  {index + 1}. {choice.question_txt}
                                </p>
                              )
                            )}
                          </div>
                        </div>

                        <div className="mt-4 flex justify-end space-x-2">
                          <EditQuestion
                            questionId={question.question_id}
                            questionText={question.question_desc}
                            questionPoints={question.question_points}
                            choices={question.choices.map(
                              (choice: { question_txt: any }) =>
                                choice.question_txt
                            )} // Ensure to map to get the correct choice texts
                            correctChoice={question.choices.findIndex(
                              (choice: { question_txt: any }) =>
                                choice.question_txt === question.question_answer
                            )} // Get the index of the correct answer
                            onQuestionUpdated={handleTopicAdded} // Use the handleTopicAdded function
                          />
                          <DeleteQuestion
                            questionId={question.question_id}
                            onQuestionDeleted={() =>
                              fetchUpdatedQuestions(topic.topic_id)
                            }
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    No questions for this topic.
                  </p>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </>
  );
};

export default ExamSection;
