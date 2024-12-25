"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <motion.button
      onClick={toggleTheme}
      className="relative w-14 h-8 rounded-full bg-[#FFFFFF] dark:bg-[#6891A7] p-1 shadow-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#D5E5EC] dark:focus:ring-[#3A5567] hover:bg-[#F5F5F5] dark:hover:bg-[#7BA3BC]"
      whileTap={{ scale: 0.95 }}
      aria-label="Toggle theme"
    >
      <motion.div
        className="w-6 h-6 rounded-full bg-[#F8FAFC] dark:bg-[#EDF2F7] shadow-md flex items-center justify-center"
        layout
        transition={{
          type: "spring",
          stiffness: 700,
          damping: 30,
        }}
        style={{
          x: theme === "dark" ? 24 : 0,
        }}
      >
        {theme === "dark" ? (
          <Moon className="w-4 h-4 text-[#4A6C84]" />
        ) : (
          <Sun className="w-4 h-4 text-[#FFB156]" />
        )}
      </motion.div>
      <span className="sr-only">Toggle theme</span>
    </motion.button>
  );
}
