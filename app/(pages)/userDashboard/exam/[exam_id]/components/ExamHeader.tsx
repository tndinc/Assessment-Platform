import { formatTime } from "./FormatTime";

import { Clock } from "lucide-react";

interface ExamHeaderProps {
  title: string;
  timeRemaining: number;
  instructions: string;
}

export default function ExamHeader({
  title,
  timeRemaining,
  instructions,
}: ExamHeaderProps) {
  return (
    <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg p-4 md:p-6">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-4">
          <h1 className="text-2xl md:text-3xl font-bold mb-2 md:mb-0">
            {title}
          </h1>
          <div className="flex items-center bg-white text-indigo-700 rounded-full px-4 py-2 shadow-md">
            <Clock className="w-5 h-5 mr-2" />
            <span className="text-xl font-mono font-bold">
              {formatTime(timeRemaining)}
            </span>
          </div>
        </div>
        <div className="bg-white bg-opacity-20 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">Instructions:</h2>
          <p className="text-sm md:text-base">{instructions}</p>
        </div>
      </div>
    </header>
  );
}
