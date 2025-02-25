import React from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Home } from "lucide-react";

const DashboardButton = ({ onClick }) => {
  return (
    <motion.button
      className="px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-full flex items-center shadow-md hover:bg-indigo-700 transition-colors absolute top-4 left-4 z-20"
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <ArrowLeft size={18} className="mr-2" />
      Back to Dashboard
    </motion.button>
  );
};

export default DashboardButton;
