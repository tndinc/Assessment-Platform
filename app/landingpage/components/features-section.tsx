"use client";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { BookOpenText, MessageCircleCode, Swords } from "lucide-react";
import Image from "next/image";

interface Feature {
  icon: React.ElementType;
  title: string;
  description: string;
  image: string;
}

const features: Feature[] = [
  {
    icon: BookOpenText,
    title: "Academic Excellence",
    description:
      "TND is designed for students and teachers to enhance academic performance.",
    image: "/tcst.png",
  },
  {
    icon: MessageCircleCode,
    title: "Data-Driven Feedback",
    description:
      "Get actionable insights through analyzed data tailored for your growth.",
    image: "/fback.png",
  },
  {
    icon: Swords,
    title: "Creative Tools",
    description:
      "Access innovative features to boost your productivity and engagement.",
    image: "/creative.png",
  },
];

export default function FeaturesSection() {
  return (
    <section className="relative w-full py-20 bg-gradient-to-br from-white via-blue-50/50 to-blue-100/30 dark:from-[#243642] dark:via-[#1a2830] dark:to-[#152028]">
      {/* Background Elements */}
      <div className="absolute inset-0 w-full h-full">
        <div className="absolute top-10 left-20 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-20 w-72 h-72 bg-purple-400/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-6 py-16 relative">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.2, delayChildren: 0.3 },
            },
          }}
        >
          <motion.h2
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            className="text-4xl font-bold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-200"
          >
            Explore Our Features
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} index={index} />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  image: string;
  index: number;
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  image,
  index,
}: FeatureCardProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      className="relative p-6 rounded-xl shadow-lg bg-blue-50/50 dark:bg-[#1a2830] flex flex-col items-center"
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.6, delay: index * 0.2 }}
    >
      <div className="w-16 h-16 rounded-full flex items-center justify-center bg-blue-100 dark:bg-blue-900/20 mb-6">
        <Icon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
      </div>
      <h3 className="text-xl font-semibold text-center mb-4 text-gray-900 dark:text-white">
        {title}
      </h3>
      <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
        {description}
      </p>
      <Image
        src={image}
        alt={title}
        width={400}
        height={300}
        // className="rounded-lg shadow-lg object-contain"
      />
    </motion.div>
  );
}
