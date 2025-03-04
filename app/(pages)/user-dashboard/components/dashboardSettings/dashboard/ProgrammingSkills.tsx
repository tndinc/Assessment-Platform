"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { motion } from "framer-motion";

const supabase = createClient();

// Database names for the three core programming skills
const coreProgrammingSkills = [
  "Fundamentals of Programming",
  "Control Structures",
  "Arrays",
];

interface OverallMetric {
  name: string;
  score: number;
  maxScore: number;
  percentage: number;
  color: string;
}

export function ProgrammingSkillsOverview() {
  const [overallMetric, setOverallMetric] = useState<OverallMetric | null>(
    null
  );
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) setUserId(user.id);
        else console.warn("User not authenticated");
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;

      setIsLoading(true);
      try {
        // Get all feedback submissions for the user
        const { data, error } = await supabase
          .from("student_feedback")
          .select("metrics_data")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (error) throw error;
        if (!data || data.length === 0) {
          setIsLoading(false);
          return;
        }

        // Extract metrics from all submissions
        const aggregatedSkills: Record<
          string,
          { totalScore: number; totalMaxScore: number }
        > = {};

        // Initialize the skills we're looking for
        coreProgrammingSkills.forEach((skill) => {
          aggregatedSkills[skill] = { totalScore: 0, totalMaxScore: 0 };
        });

        // Process each submission
        data.forEach((submission) => {
          // Parse the metrics data if it's a string
          const metricsData =
            typeof submission.metrics_data === "string"
              ? JSON.parse(submission.metrics_data)
              : submission.metrics_data;

          // Process only the core programming skills
          coreProgrammingSkills.forEach((skillName) => {
            if (metricsData[skillName]) {
              aggregatedSkills[skillName].totalScore +=
                metricsData[skillName].score || 0;
              aggregatedSkills[skillName].totalMaxScore +=
                metricsData[skillName].maxScore || 0;
            }
          });
        });

        // Calculate overall score and max score
        let overallScore = 0;
        let overallMaxScore = 0;

        Object.values(aggregatedSkills).forEach((skill) => {
          overallScore += skill.totalScore;
          overallMaxScore += skill.totalMaxScore;
        });

        const overallPercentage =
          overallMaxScore > 0 ? (overallScore / overallMaxScore) * 100 : 0;

        setOverallMetric({
          name: "Programming Skills",
          score: overallScore,
          maxScore: overallMaxScore,
          percentage: overallPercentage,
          color: "#4285F4", // Blue color to match the image
        });
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchData();
    }
  }, [userId]);

  if (isLoading) {
    return (
      <div className="w-full p-8 bg-[#f5f1ea] dark:bg-[#344C64] flex items-center justify-center h-64 rounded-lg">
        <p className="text-gray-600">Loading overall skills data...</p>
      </div>
    );
  }

  if (!overallMetric) {
    return (
      <div className="w-full p-8 bg-[#f5f1ea] dark:bg-[#344C64] flex items-center justify-center h-64 rounded-lg">
        <p className="text-gray-600">
          No programming skills data available yet.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full p-8 bg-[#f5f1ea] dark:bg-[#344C64] rounded-lg">
      <h2 className="text-3xl font-bold mb-8 text-center text-[#5d4037] dark:text-gray-200">
        Programming Proficiency
      </h2>
      <div className="flex flex-col items-center">
        <div className="relative w-48 h-48 mb-4">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#e0e0e0"
              strokeWidth="10"
            />
            {/* Progress circle */}
            <motion.circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke={overallMetric.color}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray="283"
              strokeDashoffset="283"
              transform="rotate(-90 50 50)"
              initial={{ strokeDashoffset: 283 }}
              animate={{
                strokeDashoffset: 283 - (overallMetric.percentage * 283) / 100,
              }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              className="text-5xl font-bold dark:text-gray-200"
              style={{ color: overallMetric.color }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 1 }}
            >
              {Math.round(overallMetric.percentage)}%
            </motion.span>
            <motion.span
              className="text-lg text-gray-600 mt-2 dark:text-gray-200"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 1.2 }}
            >
              {overallMetric.score}/{overallMetric.maxScore}
            </motion.span>
          </div>
        </div>
        {/* Skill Name Below Circle */}
        <motion.span
          className="text-xl font-semibold text-gray-800 dark:text-gray-200 text-center max-w-[200px] "
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.4 }}
        >
          {overallMetric.name}
        </motion.span>
      </div>
    </div>
  );
}
