"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";

const teaminfo = [
  {
    name: "Francheska Olympia",
    role: "CEO, TechCorp",
    content:
      "This platform has revolutionized our workflow. Highly recommended!",
    avatar: "/cheska.jpg?height=100&width=100",
  },
  {
    name: "TND incorp",
    role: "TANOD",
    avatar: "/tndgrp.jpg?height=100&width=100",
  },  
  {
    name: "Francis Lee",
    role: "Developer, CodeMasters",
    content: "The API integration capabilities are unparalleled. Great job!",
    avatar: "/francis.jpg?height=100&width=100",
  },
  {
    name: "Maku Cortez",
    role: "Developer, CodeMasters",
    content: "The API integration capabilities are unparalleled. Great job!",
    avatar: "/maku.jpg?height=100&width=100",
  },
  {
    name: "JV Corpus",
    role: "Developer, CodeMasters",
    content: "The API integration capabilities are unparalleled. Great job!",
    avatar: "/jv.jpg?height=100&width=100",
  },
  {
    name: "Ian Yuson",
    role: "Designer, CreativeCo",
    content: "The user interface is intuitive and the features are top-notch.",
    avatar: "/ian.jpg?height=100&width=100",
  },
];

export default function TeamSection() {
  return (
    <section className="w-full py-20 bg-creamLight dark:bg-newDarkBlue">
      <div className="w-full max-w-[2000px] mx-auto px-4 md:px-6">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
          Our Team
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {teaminfo.map((teaminfo, index) => (
          <TeamCard key={index} {...teaminfo} index={index} />
        ))}
      </div>
      </div>
    </section>
  );
}

function TeamCard({ name, role, content, avatar, index }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  // Check if the current card is for "TND incorp"
  const isTNDIncorp = name === "TND incorp";

  return (
    <motion.div
      ref={ref}
      className="bg-[#F0ECE3] dark:bg-[#35374B] p-6 rounded-lg shadow-md"
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.5, delay: index * 0.2 }}
    >
      {isTNDIncorp ? (
        // Custom layout for TND incorp card
        <div className="flex flex-col items-center text-center">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
            {name}
          </h3>
          <Image
            src={avatar}
            alt={name}
            width={300}
            height={100}
            className="rounded-full"
          />
        </div>
      ) : (
        // Default layout for other cards
        <div className="flex items-center mb-4">
          <Image
            src={avatar}
            alt={name}
            width={100}
            height={100}
            className="rounded-full mr-4"
          />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {name}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">{role}</p>
          </div>
        </div>
      )}
      <p className="text-gray-700 dark:text-gray-300">{content}</p>
    </motion.div>
  );
}
