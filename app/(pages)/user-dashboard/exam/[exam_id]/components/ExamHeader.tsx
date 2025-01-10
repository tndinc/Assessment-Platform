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
    <header className="bg-gradient-to-b from-[#FEFAF6] to-[#B3C8CF] text-gray-800 
    dark:bg-gradient-to-b dark:from-[#092635] dark:to-[#092635]/90 dark:text-gray-200 shadow-lg p-4 md:p-6">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-4">
          <h1 className="text-2xl md:text-3xl font-bold mb-2 md:mb-0
          dark:text-[#67C6E3]
          text-[#74512D]">
            {title}
          </h1>
          <div className="flex items-center rounded-full px-4 py-2 shadow-md bg-[#948979] text-[#982B1C]
          dark:bg-[#526D82] dark:text-[#EF5A6F]">
            <Clock className="w-5 h-5 mr-2" />
            <span className="text-xl font-mono font-bold">
              {formatTime(timeRemaining)}
            </span>
          </div>
        </div>
        <div className="bg-opacity-80 bg-[#E5E1DA]
        dark:bg-[#27374D] dark:bg-opacity-80 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">Instructions:</h2>
          <p className="text-sm md:text-base">{instructions}</p>
        </div>
      </div>
    </header>
  );
}
