"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";

const testimonials = [
  {
    name: "John Doe",
    role: "CEO, TechCorp",
    content:
      "This platform has revolutionized our workflow. Highly recommended!",
    avatar: "/placeholder.svg?height=100&width=100",
  },
  {
    name: "Jane Smith",
    role: "Designer, CreativeCo",
    content: "The user interface is intuitive and the features are top-notch.",
    avatar: "/placeholder.svg?height=100&width=100",
  },
  {
    name: "Mike Johnson",
    role: "Developer, CodeMasters",
    content: "The API integration capabilities are unparalleled. Great job!",
    avatar: "/placeholder.svg?height=100&width=100",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="w-full py-20 bg-white dark:bg-gray-900">
      <div className="w-full max-w-[2000px] mx-auto px-4 md:px-6">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
          What Our Clients Say
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} {...testimonial} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({ name, role, content, avatar, index }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow-md"
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.5, delay: index * 0.2 }}
    >
      <div className="flex items-center mb-4">
        <Image
          src={avatar}
          alt={name}
          width={50}
          height={50}
          className="rounded-full mr-4"
        />
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {name}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">{role}</p>
        </div>
      </div>
      <p className="text-gray-700 dark:text-gray-300">{content}</p>
    </motion.div>
  );
}
