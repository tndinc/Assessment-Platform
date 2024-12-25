"use client";
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

// Define the type for each team member
interface TeamMember {
  name: string;
  role: string;
  content: string;
  avatar: string;
}

const teamInfo: TeamMember[] = [
  {
    name: "TND incorp",
    role: "TANOD",
    content: "Empowering education through innovative technology solutions.",
    avatar: "/tndgrp.jpg?height=300&width=300",
  },
  {
    name: "Francheska Olympia",
    role: "CEO, TechCorp",
    content:
      "This platform has revolutionized our workflow. Highly recommended!",
    avatar: "/cheska.jpg?height=300&width=300",
  },
  {
    name: "Francis Lee",
    role: "Lead Developer",
    content: "The API integration capabilities are unparalleled. Great job!",
    avatar: "/francis.jpg?height=300&width=300",
  },
  {
    name: "Maku Cortez",
    role: "UX Designer",
    content: "Creating intuitive interfaces for seamless learning experiences.",
    avatar: "/maku.jpg?height=300&width=300",
  },
  {
    name: "JV Corpus",
    role: "Data Scientist",
    content: "Leveraging AI to personalize education for every student.",
    avatar: "/jv.jpg?height=300&width=300",
  },
  {
    name: "Ian Yuson",
    role: "Education Specialist",
    content:
      "Bridging technology and pedagogy for effective learning outcomes.",
    avatar: "/ian.jpg?height=300&width=300",
  },
];

export default function ModernTeamCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prevIndex) =>
      prevIndex + 1 === teamInfo.length ? 0 : prevIndex + 1
    );
  }, []);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prevIndex) =>
      prevIndex - 1 < 0 ? teamInfo.length - 1 : prevIndex - 1
    );
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      nextSlide();
    }, 5000);

    return () => clearTimeout(timer);
  }, [currentIndex, nextSlide]);

  return (
    <section className="relative w-full py-12 md:py-20 bg-gradient-to-br from-white/50 via-blue-50/50 to-blue-100/30 dark:from-[#243642] dark:via-[#1a2830] dark:to-[#152028]">
      <div className="absolute inset-0 w-full h-full">
        <div className="absolute top-20 right-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-72 h-72 bg-purple-400/10 rounded-full blur-3xl" />
      </div>
      <div className="w-full max-w-[2000px] mx-auto px-4 md:px-6 relative">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 md:mb-12 text-gray-900 dark:text-white">
          Meet Our Innovative Team
        </h2>
        <div className="relative overflow-hidden">
          <motion.div
            className="flex transition-transform ease-in-out duration-500"
            style={{
              transform: `translateX(-${currentIndex * 100}%)`,
            }}
          >
            {teamInfo.map((member, index) => (
              <motion.div
                key={index}
                className="w-full flex-shrink-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <TeamCard {...member} />
              </motion.div>
            ))}
          </motion.div>

          <div className="absolute top-1/2 transform -translate-y-1/2 left-0 right-0 flex justify-between px-4">
            <button
              onClick={prevSlide}
              className="bg-white/10 backdrop-blur-md p-3 rounded-full shadow-lg hover:bg-white/20 dark:bg-gray-800/10 dark:hover:bg-gray-800/20 transition-colors focus:outline-none focus:ring-2 focus:ring-[#B3C8CF] dark:focus:ring-[#526D82]"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-6 h-6 text-gray-800 dark:text-white" />
            </button>
            <button
              onClick={nextSlide}
              className="bg-white/10 backdrop-blur-md p-3 rounded-full shadow-lg hover:bg-white/20 dark:bg-gray-800/10 dark:hover:bg-gray-800/20 transition-colors focus:outline-none focus:ring-2 focus:ring-[#B3C8CF] dark:focus:ring-[#526D82]"
              aria-label="Next slide"
            >
              <ChevronRight className="w-6 h-6 text-gray-800 dark:text-white" />
            </button>
          </div>
        </div>

        <div className="flex justify-center mt-6 md:mt-8">
          {teamInfo.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setDirection(index > currentIndex ? 1 : -1);
                setCurrentIndex(index);
              }}
              className={`w-3 h-3 rounded-full mx-1 transition-colors ${
                index === currentIndex
                  ? "bg-gray-800 dark:bg-white"
                  : "bg-gray-300 dark:bg-gray-600"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// Define props for TeamCard component
interface TeamCardProps {
  name: string;
  role: string;
  content: string;
  avatar: string;
}

function TeamCard({ name, role, content, avatar }: TeamCardProps) {
  const isTNDIncorp = name === "TND incorp";

  return (
    <div className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-lg p-6 md:p-8 rounded-xl shadow-lg max-w-4xl w-full mx-auto flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8">
      <div
        className={`relative ${
          isTNDIncorp ? "w-full md:w-1/2 aspect-video" : "w-48 h-48"
        }`}
      >
        <Image
          src={avatar}
          alt={name}
          layout="fill"
          objectFit={isTNDIncorp ? "contain" : "cover"}
          className={`${
            isTNDIncorp ? "rounded-lg" : "rounded-full"
          } border-4 border-[#B3C8CF] dark:border-[#526D82]`}
        />
      </div>
      <div
        className={`text-center md:text-left ${
          isTNDIncorp ? "w-full md:w-1/2" : "flex-1"
        }`}
      >
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {name}
        </h3>
        <p className="text-lg text-[#B3C8CF] dark:text-[#526D82] mb-4">
          {role}
        </p>
        <p className="text-gray-600 dark:text-gray-300 italic">
          &quot;{content}&quot;
        </p>
      </div>
    </div>
  );
}
