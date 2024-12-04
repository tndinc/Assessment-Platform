import { formatTime } from "./FormatTime";

interface ExamHeaderProps {
  title: string;
  timeRemaining: number; // Assuming `timeRemaining` is a number (e.g., seconds)
  instructions: string;
}

export default function ExamHeader({ title, timeRemaining, instructions }: ExamHeaderProps) {
  return (
    <header className="bg-white shadow-md p-2 md:p-4">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-1 md:mb-2">
          <h1 className="text-lg md:text-2xl font-bold text-gray-800">{title}</h1>
          <div className="text-xl md:text-3xl font-bold text-red-500">
            {formatTime(timeRemaining)}
          </div>
        </div>
        <p className="text-xs md:text-sm text-gray-600">{instructions}</p>
      </div>
    </header>
  );
}
