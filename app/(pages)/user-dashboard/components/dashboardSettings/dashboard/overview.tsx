"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { motion } from "framer-motion";

const supabase = createClient();

interface ChartDataPoint {
  name: string;
  totalScore: number;
  date: string;
}

export function Overview() {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          setUserId(user.id);
        } else {
          throw new Error("User not authenticated");
        }
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
        const { data, error } = await supabase
          .from("student_feedback")
          .select(
            `
            total_score,
            max_score,
            created_at,
            exam_tbl!student_feedback_exam_id_fkey (
              subject,
              exam_title
            )
          `
          )
          .eq("user_id", userId)
          .order("created_at", { ascending: true });

        if (error) throw error;
        if (!data) return;

        const transformedData = data.map((feedback: any) => {
          return {
            name: feedback.exam_tbl.exam_title,
            totalScore: Number(
              ((feedback.total_score / feedback.max_score) * 100).toFixed(2)
            ),
            date: new Date(feedback.created_at).toISOString(),
          };
        });

        setChartData(transformedData);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const getGradientColor = () => {
    // Calculate average score to determine color
    if (chartData.length === 0) return "#4285F4"; // Default blue

    const avgScore =
      chartData.reduce((sum, item) => sum + item.totalScore, 0) /
      chartData.length;

    // Color mapping based on score ranges
    if (avgScore >= 80) return "#4CAF50"; // Green for high scores
    if (avgScore >= 60) return "#4285F4"; // Blue for medium scores
    if (avgScore >= 40) return "#FF9800"; // Orange for lower scores
    return "#F44336"; // Red for very low scores
  };

  const gradientColor = getGradientColor();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-medium mb-1">{label}</p>
          <p className="text-gray-600">Score: {payload[0].value.toFixed(1)}%</p>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="w-full p-8 bg-[#f5f1ea] dark:bg-[#344C64] flex items-center justify-center h-64 rounded-lg">
        <p className="text-gray-600">Loading exam data...</p>
      </div>
    );
  }

  return (
    <div className="w-full p-8 bg-[#f5f1ea]  dark:bg-[#344C64] rounded-lg">
      <motion.h2
        className="text-3xl font-bold mb-8 text-center text-[#5d4037] dark:text-gray-200"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Exam Performance Timeline
      </motion.h2>

      {chartData.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No exam data available
        </div>
      ) : (
        <motion.div
          className="p-6 rounded-lg bg-white dark:bg-gray-800"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <defs>
                <linearGradient
                  id="totalScoreGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor={gradientColor}
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor={gradientColor}
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                opacity={0.2}
              />
              <XAxis
                dataKey="name"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}%`}
                domain={[0, 100]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="totalScore"
                stroke={gradientColor}
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#totalScoreGradient)"
                activeDot={{
                  r: 8,
                  fill: gradientColor,
                  strokeWidth: 2,
                  stroke: "#fff",
                }}
              />
            </AreaChart>
          </ResponsiveContainer>

          <motion.div
            className="mt-4 text-center text-gray-700 dark:text-gray-300"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1 }}
          >
            <p className="text-sm">
              {chartData.length} {chartData.length === 1 ? "exam" : "exams"}{" "}
              completed
            </p>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
