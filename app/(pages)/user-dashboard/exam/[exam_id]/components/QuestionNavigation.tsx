import { useState } from "react";
import { ChevronDown, ChevronUp, CheckCircle, Circle } from "lucide-react";

interface Question {
  question_id: string | number;
}

interface QuestionNavigationProps {
  questions: Question[];
  currentQuestion: number;
  setCurrentQuestion: (index: number) => void;
  answers: Record<string | number, any>;
}

export default function QuestionNavigation({
  questions,
  currentQuestion,
  setCurrentQuestion,
  answers,
}: QuestionNavigationProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <nav className="w-full md:w-64 bg-gradient-to-t from-[#FEFAF6] to-[#B3C8CF] text-gray-800 
    dark:bg-gradient-to-t dark:from-[#092635] dark:to-[#092635]/90 dark:text-white p-4 md:h-[calc(100vh-12rem)] flex flex-col border-yellow-500 border-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-300">Questions</h2>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="md:hidden text-gray-600 hover:text-gray-800 transition-colors duration-200"
          aria-label={
            isExpanded ? "Collapse question list" : "Expand question list"
          }
        >
          {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
        </button>
      </div>
      <div
        className={`overflow-y-auto ${
          isExpanded ? "flex-grow" : "hidden md:block"
        }`}
      >
        <ul className="grid grid-cols-5 md:grid-cols-1 gap-2">
          {questions.map((question, index) => {
            const isAnswered = !!answers[question.question_id];
            const isCurrent = currentQuestion === index + 1;

            return (
              <li key={question.question_id || index}>
                <button
                  onClick={() => setCurrentQuestion(index + 1)}
                  className={`w-full text-left p-3 rounded-lg text-sm md:text-base transition-all duration-200 flex items-center justify-between
                    ${
                      isCurrent
                        ? "bg-[#948979]/50 text-gray-800 dark:bg-[#526D82]/50 dark:text-gray-200 shadow-md"
                        : isAnswered
                        ? "bg-green-100 text-gray-800 hover:bg-green-200 dark:bg-[#527853]/90 dark:text-gray-800 dark:hover:bg-[#526E48]"
                        : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                    }`}
                  aria-current={isCurrent ? "true" : "false"}
                >
                  <span className="font-medium">Q{index + 1}</span>
                  {isAnswered ? (
                    <CheckCircle
                      size={18}
                      className={isCurrent ? "text-gray-800 dark:text-gray-300" : "text-green-500"}
                    />
                  ) : (
                    <Circle
                      size={18}
                      className={isCurrent ? "text-white" : "text-gray-400"}
                    />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
