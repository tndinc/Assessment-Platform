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
      className="w-full max-w-md mx-auto" // Center the button on the screen for all devices
    >
      <Button
        onClick={onSubmit}
        disabled={disabled || isLoading}
        className="w-full py-4 md:py-6 text-base md:text-lg font-semibold transition-all duration-200 
        bg-gradient-to-r from-green-400 to-green-600 
        hover:from-green-500 hover:to-green-700 
        disabled:from-gray-400 disabled:to-gray-500 
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <Loader2 className="w-5 h-5 md:w-6 md:h-6 mr-2 animate-spin" />
            <span className="text-sm md:text-base">Submitting...</span>
          </div>
        ) : (
          <span className="text-sm md:text-base">Submit Exam</span>
        )}
      </Button>
    </motion.div>
  );
}
