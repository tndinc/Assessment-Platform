"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { LoginDialog } from "@/components/login-dialog";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 py-2 md:py-4 transition-colors duration-300 ${
        isScrolled
          ? "bg-white/80 dark:bg-gray-800/80 backdrop-blur-md"
          : "bg-transparent"
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="w-full max-w-[2000px] mx-auto px-4 md:px-6 flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center"
        >
          <img
            src="/TND.png" // path to your logo image in the public folder
            alt="Your Brand"
            className="h-10 md:h-10" // adjust size of the logo
          />
          <span className="mt-3 text-xl font-bold text-[#89A8B2] dark:text-[#89A8B2]">TND</span>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center space-x-2 md:space-x-4"
        >
          <ThemeToggle />
          <LoginDialog />
        </motion.div>
      </div>
    </motion.header>
  );
}
