"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Image from "next/image";
import { CheckCircle } from "lucide-react";

export default function HeroSection() {
  const features = [
    "Insightful Performance Analysis",
    "Real-Time Feedback and Tracking",
    "Collaborative study groups",
    "Advanced AI-Driven Solutions",
  ];

  return (
    <section className="min-h-[calc(100vh-4rem)] w-full flex items-center justify-center bg-white/50 dark:bg-[#243642] text-gray-900 dark:text-white pt-16 pb-8">
      <div className="container mx-auto px-4 flex flex-col lg:flex-row items-center justify-between gap-12">
        <div className="lg:w-1/2 w-full flex flex-col items-center lg:items-start text-center lg:text-left space-y-6">
          <motion.h1
            className="text-4xl sm:text-5xl xl:text-6xl font-bold leading-tight max-w-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Elevate Your Learning with InsightAssess
          </motion.h1>
          <motion.p
            className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Unlock your potential with our cutting-edge assessment platform.
            InsightAssess combines the power of data mining and analytics to
            redefine educational success.
          </motion.p>
          <motion.ul
            className="space-y-3 w-full max-w-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            {features.map((feature, index) => (
              <motion.li
                key={index}
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
              >
                <CheckCircle className="h-5 w-5 flex-shrink-0 text-[#B3C8CF] dark:text-[#526D82]" />
                <span className="text-base sm:text-lg">{feature}</span>
              </motion.li>
            ))}
          </motion.ul>
          <motion.div
            className="flex flex-wrap gap-4 justify-center lg:justify-start w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
          >
            <Button
              size="lg"
              className="bg-[#B3C8CF] hover:bg-[#89A8B2] text-black/70 dark:text-white dark:bg-[#526D82] dark:hover:bg-[#27374D] min-w-[150px]"
            >
              Get Started
            </Button>
          </motion.div>
        </div>
        <motion.div
          className="lg:w-1/2 w-full flex justify-center lg:justify-end"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
        >
          <div className="relative w-full max-w-xl aspect-[4/3]">
            <Image
              src="/SAMPLE IMAGE.png?height=400&width=600"
              alt="Hero Image"
              fill
              className="rounded-lg shadow-lg object-contain"
              priority
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
