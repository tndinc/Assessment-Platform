import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

interface ProgressBarProps {
  totalQuestions: number;
  answeredQuestions: number;
}

export default function ProgressBar({
  totalQuestions,
  answeredQuestions,
}: ProgressBarProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const calculatedProgress = (answeredQuestions / totalQuestions) * 100;
    setProgress(calculatedProgress);
  }, [answeredQuestions, totalQuestions]);

  return (
    <div className="w-full max-w-md mx-auto mb-6">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Exam Progress</span>
        <Badge variant="secondary" className="text-xs font-semibold">
          {answeredQuestions} / {totalQuestions}
        </Badge>
      </div>
      <Progress value={progress} className="h-2" />
      <motion.div
        className="mt-2 text-center"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {progress === 100 ? (
          <span className="text-[#527853] dark:text-[#387F39] font-semibold">
            All questions answered!
          </span>
        ) : (
          <span className="text-sm text-gray-800 dark:text-gray-200">
            {Math.round(progress)}% complete
          </span>
        )}
      </motion.div>
    </div>
  );
}
