'use client'

import { useState, useEffect } from 'react'
import { createClient } from "@/utils/supabase/client"
import ExamHeader from './components/ExamHeader'
import QuestionNavigation from './components/QuestionNavigation'
import QuestionDisplay from './components/QuestionsDisplay'
import ProgressBar from './components/ProgressBar'
import SubmitButton from './components/SubmitButton'

const ExamInterface = ({ params }: { params: { exam_id: string } }) => {
  const { exam_id } = params
  const supabase = createClient()
  const [examData, setExamData] = useState<any>(null)
  const [questions, setQuestions] = useState<any[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(1)
  const [answers, setAnswers] = useState<Record<number, any>>({})
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [isSubmitted, setIsSubmitted] = useState(false)

  useEffect(() => {
    const fetchExamData = async () => {
      try {
        // Fetch exam details
        const { data: exam, error: examError } = await supabase
          .from('exam_tbl')
          .select('*')
          .eq('exam_id', exam_id)
          .single()
        if (examError) throw examError
        setExamData(exam)
        setTimeRemaining(exam.exam_time_limit)

        // Fetch topic IDs for the exam
        const { data: topics, error: topicsError } = await supabase
          .from('topic_tbl')
          .select('topic_id')
          .eq('exam_id', exam_id)
        if (topicsError) throw topicsError
        const topicIds = topics.map((topic) => topic.topic_id)

        // Fetch questions for the topics
        const { data: questions, error: questionsError } = await supabase
          .from('question_tbl')
          .select('question_id, question_desc, question_points, topic_id')
          .in('topic_id', topicIds)
        if (questionsError) throw questionsError

        // Fetch choices for each question
        const questionIds = questions.map((q) => q.question_id)
        const { data: choices, error: choicesError } = await supabase
          .from('choices_tbl')
          .select('question_id, question_txt')
          .in('question_id', questionIds)
        if (choicesError) throw choicesError

        console.log('Fetched Questions:', questions)
        console.log('Fetched Choices:', choices)

        // Combine questions and their choices
        const questionsWithChoices = questions.map((q, index) => ({
          ...q,
          number: index + 1, // Assign sequential question numbers starting from 1
          choices: choices.filter((c) => c.question_id === q.question_id),
        }))
        console.log('Questions with Choices:', questionsWithChoices)
        setQuestions(questionsWithChoices)
      } catch (err) {
        console.error('Error fetching exam data:', err)
      }
    }

    fetchExamData()
  }, [exam_id])

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prevTime) => (prevTime > 0 ? prevTime - 1 : 0))
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleAnswer = (questionId, answer) => {
    setAnswers((prevAnswers) => ({ ...prevAnswers, [questionId]: answer }))
  }

  const handleSubmit = () => {
    setIsSubmitted(true)
    console.log('Exam submitted:', answers)
  }

  if (!examData || questions.length === 0) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <ExamHeader
        title={examData.exam_title}
        timeRemaining={timeRemaining}
        instructions={examData.exam_desc || "Answer all questions."}
      />
      <div className="flex-grow flex flex-col md:flex-row">
        <QuestionNavigation
          questions={questions}
          currentQuestion={currentQuestion}
          setCurrentQuestion={setCurrentQuestion}
          answers={answers}
        />
        <main className="flex-grow p-2 md:p-6 overflow-y-auto">
          <QuestionDisplay
            question={questions[currentQuestion - 1]} // Adjusted for 0-based index
            answer={answers[questions[currentQuestion - 1]?.question_id]}
            onAnswer={handleAnswer}
            isSubmitted={isSubmitted}
          />
        </main>
      </div>
      <footer className="bg-white shadow-md p-4">
        <ProgressBar
          totalQuestions={questions.length}
          answeredQuestions={Object.keys(answers).length}
        />
        <SubmitButton
          onSubmit={handleSubmit}
          disabled={Object.keys(answers).length === 0}
        />
      </footer>
    </div>
  )
}

export default ExamInterface
