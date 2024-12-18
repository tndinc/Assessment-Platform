"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Image from "next/image";

export default function HeroSection() {
  return (
    <section className="min-h-screen w-full flex items-center justify-center bg-white/50 dark:bg-[#243642] text-gray-900 dark:text-white">
      <div className="w-full max-w-[2000px] mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center">
        <div className="md:w-1/2 text-center md:text-left mb-8 md:mb-0">
          <motion.h1
            className="text-5xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Welcome to TND
          </motion.h1>
          <motion.p
            className="text-xl mb-8 text-gray-600 dark:text-gray-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            An insight - driven platform utilizing data mining and analytics
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Button
              size="lg"
              className="bg-[#B3C8CF] hover:bg-[#89A8B2] text-black/70 dark:text-white dark:bg-[#526D82] dark:hover:bg-[#27374D]"
            >
              Get Started
            </Button>
          </motion.div>
        </div>
        <motion.div
          className="md:w-1/2"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
        >
          <Image
            src="/SAMPLE IMAGE.png?height=400&width=600"
            alt="Hero Image"
            width={600}
            height={400}
            className="rounded-lg shadow-lg"
          />
        </motion.div>
      </div>
    </section>
  );
}
