"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const supabase = createClient();

export function Overview() {
  const [chartData, setChartData] = useState([]);
  const [userId, setUserId] = useState<string | null>(null); // State to store user ID

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Fetch the current user
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          setUserId(user.id); // Store user ID for later use
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
      if (!userId) return; // Wait for user ID to be available

      try {
        // Fetch data from `exam_results` and join with `exam_tbl`
        const { data, error } = await supabase
          .from("exam_results")
          .select(
            `
            total_score,
            exam_tbl(subject, exam_points)
          `
          )
          .eq("user_id", userId); // Use dynamic user ID

        if (error) throw error;

        // Transform data for the chart
        const transformedData = data.map((result) => {
          const { subject, exam_points } = result.exam_tbl;
          const grade = ((result.total_score / exam_points) * 100).toFixed(2); // Calculate grade as percentage
          return { subject, grade: Number(grade) };
        });

        setChartData(transformedData);
      } catch (err) {
        console.error("Error fetching data:");
      }
    };

    fetchData();
  }, [userId]); // Re-fetch when the userId is set

  return (
        <ChartContainer
          config={{
            grade: {
              label: "Grade",
              color: "hsl(var(--chart-1))",
            },
          }}
          className="min-h-[350px]"
        >
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData}>
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
              />
              <Bar
                dataKey="grade"
                className="fill-[#D7D3BF] dark:fill-[#384B70]"
                radius={[4, 4, 0, 0]}
                barSize={50}
              />
              <ChartTooltip content={<ChartTooltipContent />} cursor={false} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
  );
}
