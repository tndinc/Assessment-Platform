"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { motion } from "framer-motion";

const supabase = createClient();

interface MetricData {
  name: string;
  score: number;
  maxScore: number;
  color: string;
  percentage: number;
}

// Color palette for metrics - matching the image colors
const colorPalette = [
  "#4285F4", // Blue
  "#34A853", // Green
  "#FBBC05", // Yellow/Orange
  "#EA4335", // Red
  "#8B5CF6", // Purple
  "#06B6D4", // Cyan
];

export function SkillsMetricsBreakdown() {
  const [metrics, setMetrics] = useState<MetricData[]>([]);
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

        // Extract all metrics from all submissions
        const allMetrics: Record<
          string,
          { totalScore: number; totalMaxScore: number; count: number }
        > = {};

        // Process each submission
        data.forEach((submission) => {
          // Parse the metrics data if it's a string
          const metricsData =
            typeof submission.metrics_data === "string"
              ? JSON.parse(submission.metrics_data)
              : submission.metrics_data;

          // Add each metric to our aggregated data
          Object.entries(metricsData).forEach(
            ([name, value]: [string, any]) => {
              if (!allMetrics[name]) {
                allMetrics[name] = {
                  totalScore: 0,
                  totalMaxScore: 0,
                  count: 0,
                };
              }

              // Add to totals
              allMetrics[name].totalScore += value.score || 0;
              allMetrics[name].totalMaxScore += value.maxScore || 0;
              allMetrics[name].count += 1;
            }
          );
        });

        // Convert aggregated data to our metrics format
        const processedMetrics = Object.entries(allMetrics).map(
          ([name, data], index) => {
            const score = data.totalScore;
            const maxScore = data.totalMaxScore;
            const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;

            return {
              name,
              score,
              maxScore,
              percentage,
              color: colorPalette[index % colorPalette.length],
            };
          }
        );

        setMetrics(processedMetrics);
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
      <div className="w-full p-8 bg-[#f5f1ea] flex items-center justify-center h-64 rounded-lg">
        <p className="text-gray-600">Loading skills data...</p>
      </div>
    );
  }

  if (metrics.length === 0) {
    return (
      <div className="w-full p-8 bg-[#f5f1ea] flex items-center justify-center h-64 rounded-lg">
        <p className="text-gray-600">No skills data available yet.</p>
      </div>
    );
  }

  return (
    <div className="w-full p-8 bg-[#f5f1ea] rounded-lg">
      <h2 className="text-3xl font-bold mb-8 text-center text-[#5d4037]">
        Skill Breakdown
      </h2>
      <div className="flex flex-wrap justify-center gap-x-16 gap-y-8">
        {metrics.map((metric, index) => (
          <div key={metric.name} className="flex flex-col items-center">
            {/* Circle Container */}
            <div className="relative w-32 h-32 mb-4">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#e0e0e0"
                  strokeWidth="10"
                />
                {/* Progress circle with animation */}
                <motion.circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke={metric.color}
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray="283"
                  strokeDashoffset="283"
                  transform="rotate(-90 50 50)"
                  initial={{ strokeDashoffset: 283 }}
                  animate={{
                    strokeDashoffset: 283 - (metric.percentage * 283) / 100,
                  }}
                  transition={{
                    duration: 1.5,
                    delay: index * 0.3,
                    ease: "easeInOut",
                  }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span
                  className="text-3xl font-bold"
                  style={{ color: metric.color }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.3 + 1 }}
                >
                  {Math.round(metric.percentage)}%
                </motion.span>
                <motion.span
                  className="text-sm text-gray-600"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.3 + 1.2 }}
                >
                  {metric.score}/{metric.maxScore}
                </motion.span>
              </div>
            </div>
            {/* Skill Name Below Circle */}
            <motion.span
              className="text-sm font-semibold text-gray-800 text-center max-w-[120px]"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.3 + 1.4 }}
            >
              {metric.name}
            </motion.span>
          </div>
        ))}
      </div>
    </div>
  );
}
