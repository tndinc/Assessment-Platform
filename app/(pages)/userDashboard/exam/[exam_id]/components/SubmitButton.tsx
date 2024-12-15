"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface SubmitButtonProps {
  onSubmit: () => void;
  disabled: boolean;
  isLoading?: boolean;
}

export default function SubmitButton({
  onSubmit,
  disabled,
  isLoading = false,
}: SubmitButtonProps) {
  return (
    <motion.div
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
    >
      <Button
        onClick={onSubmit}
        disabled={disabled || isLoading}
        className="w-full py-6 text-lg font-semibold transition-all duration-200 
        bg-gradient-to-r from-[#9EDF9C]/90 to-[#62825D] hover:from-[#9EDF9C]/80 hover:to-[#62825D]/70 disabled:from-gray-400 disabled:to-gray-500 text-gray-900
        dark:bg-gradient-to-r dark:from-[#47663B]/90 dark:to-[#1F4529]/90 dark:hover:from-[#47663B] dark:hover:to-[#1F4529]
        dark:disabled:from-gray-400 dark:disabled:to-gray-500 dark:text-gray-300"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Submitting...
          </>
        ) : (
          "Submit Exam"
        )}
      </Button>
    </motion.div>
  );
}
