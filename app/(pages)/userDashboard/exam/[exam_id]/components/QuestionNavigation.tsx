interface Question {
  question_id: string | number; // Adjust based on your data type
}

interface QuestionNavigationProps {
  questions: Question[]; // Array of Question objects
  currentQuestion: number; // Index or question number
  setCurrentQuestion: (index: number) => void; // Function to set the current question
  answers: Record<string | number, any>; // Mapping of question IDs to answers
}

export default function QuestionNavigation({
  questions,
  currentQuestion,
  setCurrentQuestion,
  answers,
}: QuestionNavigationProps) {
  return (
    <nav className="w-full md:w-64 bg-white shadow-md p-2 md:p-4 md:h-[calc(100vh-12rem)] overflow-y-auto">
      <h2 className="text-lg font-semibold mb-2 md:mb-4">Questions</h2>
      <ul className="grid grid-cols-5 md:grid-cols-1 gap-2">
        {questions.map((question, index) => (
          <li key={question.question_id || index}>
            <button
              onClick={() => setCurrentQuestion(index + 1)} // Use index + 1 to map to the current question number
              className={`w-full text-left p-2 rounded text-sm md:text-base transition-colors duration-200 ${
                currentQuestion === index + 1
                  ? 'bg-blue-500 text-white'
                  : answers[question.question_id]
                  ? 'bg-green-100 text-gray-800 hover:bg-green-200'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              Q{index + 1}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
