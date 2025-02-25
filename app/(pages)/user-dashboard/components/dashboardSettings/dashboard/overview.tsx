"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";

const supabase = createClient();

interface MetricsData {
  [key: string]: {
    score: number;
    maxScore: number;
  };
}

interface StudentFeedback {
  total_score: number;
  max_score: number;
  metrics_data: MetricsData;
  exam_tbl: {
    subject: string;
    exam_title: string;
  };
}

interface ChartDataPoint {
  subject: string;
  examTitle: string;
  totalScore: number;
  fundamentals: number;
  controlStructures: number;
  arrays: number;
}

export function Overview() {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

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

      try {
        const { data, error } = await supabase
          .from("student_feedback")
          .select(
            `
            total_score,
            max_score,
            metrics_data,
            exam_tbl!student_feedback_exam_id_fkey (
              subject,
              exam_title
            )
          `
          )
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (error) throw error;
        if (!data) return;

        const transformedData = data.map((feedback) => {
          // Ensure `metrics_data` is properly parsed if it's a string
          let metrics: MetricsData;
          try {
            metrics =
              typeof feedback.metrics_data === "string"
                ? JSON.parse(feedback.metrics_data)
                : feedback.metrics_data;
          } catch (err) {
            console.error("Error parsing metrics_data:", err);
            metrics = {};
          }

          return {
            subject: feedback.exam_tbl.subject,
            examTitle: feedback.exam_tbl.exam_title,
            totalScore: Number(
              ((feedback.total_score / feedback.max_score) * 100).toFixed(2)
            ),
            fundamentals:
              (metrics["Fundamentals of Programming"]?.score /
                metrics["Fundamentals of Programming"]?.maxScore) *
                100 || 0,
            controlStructures:
              (metrics["Control Structures"]?.score /
                metrics["Control Structures"]?.maxScore) *
                100 || 0,
            arrays:
              (metrics["Arrays"]?.score / metrics["Arrays"]?.maxScore) * 100 ||
              0,
          };
        });

        setChartData(transformedData);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, [userId]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-medium mb-2">{payload[0].payload.examTitle}</p>
          <p className="text-gray-600 dark:text-gray-300">Subject: {label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-gray-600 dark:text-gray-300">
              {entry.name}: {entry.value.toFixed(1)}%
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full p-4">
      <h2 className="text-2xl font-bold mb-4">Exam Performance Overview</h2>
      {chartData.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No exam data available
        </div>
      ) : (
        <ChartContainer className="min-h-[400px]" config={{}}>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis
                dataKey="subject"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}%`}
                domain={[0, 100]}
              />
              <Legend />
              <Bar
                dataKey="totalScore"
                name="Total Score"
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="fundamentals"
                name="Fundamentals of Programming"
                fill="#06b6d4"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="controlStructures"
                name="Control Structures"
                fill="#6366f1"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="arrays"
                name="Arrays"
                fill="#a855f7"
                radius={[4, 4, 0, 0]}
              />
              <ChartTooltip content={<CustomTooltip />} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      )}
    </div>
  );
}
