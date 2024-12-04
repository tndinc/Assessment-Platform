import { useState, useEffect } from 'react';

export default function QuestionDisplay({ question, answer, onAnswer, isSubmitted }) {
  const [timeSpent, setTimeSpent] = useState(0);

  useEffect(() => {
    if (!question) return; // Ensure question exists
    const timer = setInterval(() => {
      setTimeSpent((prevTime) => prevTime + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [question?.question_id]); // Optional chaining to avoid runtime errors

  const renderChoices = () => {
    if (!question.choices || question.choices.length === 0) {
      return <div>No choices available for this question.</div>;
    }

    return (
      <ul className="space-y-2">
        {question.choices.map((choice, index) => (
          <li key={index} className="p-2 bg-gray-100 rounded hover:bg-gray-200 transition-colors duration-200">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name={`question-${question.question_id}`}
                value={choice.question_txt}
                checked={answer === choice.question_txt}
                onChange={() => onAnswer(question.question_id, choice.question_txt)}
                disabled={isSubmitted}
                className="form-radio"
              />
              <span>{choice.question_txt}</span>
            </label>
          </li>
        ))}
      </ul>
    );
  };

  if (!question) {
    return <div>Loading question...</div>;
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-4 mb-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Question {question.question_id}</h2>
        <span className="text-sm text-gray-500">Time: {timeSpent}s</span>
      </div>
      <p className="mb-4 text-gray-800 font-medium">{question.question_desc}</p>
      {renderChoices()}
    </div>
  );
}
