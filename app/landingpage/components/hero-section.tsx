"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Image from "next/image";
import { CheckCircle } from "lucide-react";

export default function HeroSection() {
  const features = [
    "Personalized learning paths",
    "Real-time progress tracking",
    "Collaborative study groups",
    "24/7 AI-powered tutoring",
  ];

  return (
    <section className="min-h-screen w-full flex items-center justify-center bg-white/50 dark:bg-[#243642] text-gray-900 dark:text-white">
      <div className="w-full max-w-[2000px] mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center md:justify-between flex-wrap">
        <div className="md:w-1/2 w-full text-center md:text-left mb-6 md:mb-0 px-4">
          <motion.h1
            className="text-4xl md:text-5xl font-bold mb-4 md:mb-6 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Elevate Your Learning with TND
          </motion.h1>
          <motion.p
            className="text-lg md:text-xl mb-6 text-gray-600 dark:text-gray-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Unlock your potential with our insight-driven platform. TND
            harnesses the power of data mining and analytics to revolutionize
            your educational journey.
          </motion.p>
          <motion.ul
            className="mb-6 text-left inline-block"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            {features.map((feature, index) => (
              <motion.li
                key={index}
                className="flex items-center mb-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
              >
                <CheckCircle className="mr-2 text-[#B3C8CF] dark:text-[#526D82]" />
                <span>{feature}</span>
              </motion.li>
            ))}
          </motion.ul>
          <motion.div
            className="space-x-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
          >
            <Button
              size="lg"
              className="bg-[#B3C8CF] hover:bg-[#89A8B2] text-black/70 dark:text-white dark:bg-[#526D82] dark:hover:bg-[#27374D]"
            >
              Get Started
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-[#B3C8CF] text-[#B3C8CF] hover:bg-[#B3C8CF] hover:text-black/70 dark:border-[#526D82] dark:text-[#526D82] dark:hover:bg-[#526D82] dark:hover:text-white"
            >
              Watch Demo
            </Button>
          </motion.div>
        </div>
        <motion.div
          className="md:w-1/2 w-full flex justify-center"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
        >
          <Image
            src="/SAMPLE IMAGE.png?height=400&width=600"
            alt="Hero Image"
            width={600}
            height={400}
            className="rounded-lg shadow-lg object-contain w-full max-w-md md:max-w-lg"
          />
        </motion.div>
      </div>
    </section>
  );
}
