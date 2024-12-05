interface ProgressBarProps {
  totalQuestions: number; // Total number of questions in the exam
  answeredQuestions: number; // Number of questions that have been answered
}

export default function ProgressBar({ totalQuestions, answeredQuestions }: ProgressBarProps) {
  const progress = (answeredQuestions / totalQuestions) * 100;

  return (
    <div className="mb-2 md:mb-4">
      <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-in-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <p className="text-xs md:text-sm text-gray-600 text-center">
        {answeredQuestions} of {totalQuestions} answered
      </p>
    </div>
  );
}
