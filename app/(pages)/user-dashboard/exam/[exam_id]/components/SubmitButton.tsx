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
        className="w-full py-6 text-lg font-semibold transition-all duration-200 bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500"
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
