"use client";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { BookOpenText, MessageCircleCode, Swords } from "lucide-react";
import Image from "next/image";

// Define the feature type
interface Feature {
  icon: React.ElementType; // Icon is a React component
  title: string;
  description: string;
  image: string;
}

const features: Feature[] = [
  {
    icon: BookOpenText,
    title: "Academic",
    description: "TND is made for students and teachers",
    image: "/SAMPLE IMAGE.png?height=300&width=400",
  },
  {
    icon: MessageCircleCode,
    title: "Feedbacks",
    description: "Insights made from analyzed data gathered from you",
    image: "/SAMPLE IMAGE.png?height=300&width=400",
  },
  {
    icon: Swords,
    title: "Creative features",
    description: "Access a wide range of fun to boost your productivity",
    image: "/SAMPLE IMAGE.png?height=300&width=400",
  },
];

export default function FeaturesSection() {
  return (
    <section className="w-full py-20 bg-[#ECEBDE] dark:bg-[#243642]/80">
      <div className="w-full max-w-[2000px] mx-auto px-4 md:px-6">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
          Our Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

// Define the props for the FeatureCard component
interface FeatureCardProps {
  icon: React.ElementType; // Icon is a React component
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
      className="bg-[#D7D3BF]/30 dark:bg-[#384B70]/30 p-6 rounded-lg shadow-md"
      initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
      animate={
        isInView
          ? { opacity: 1, x: 0 }
          : { opacity: 0, x: index % 2 === 0 ? -50 : 50 }
      }
      transition={{ duration: 0.5, delay: index * 0.2 }}
    >
      <div className="flex flex-col items-center">
        <Icon className="w-12 h-12 text-[#8E806A] dark:text-[#508C9B] mb-4" />
        <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
          {title}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4">{description}</p>
        <Image
          src={image}
          alt={title}
          width={400}
          height={300}
          className="rounded-lg shadow-lg"
        />
      </div>
    </motion.div>
  );
}
