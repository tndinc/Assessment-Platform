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

type ExamResult = {
  total_score: number;
  exam_tbl: {
    subject: string;
    exam_points: number;
  };
};

type TransformedData = {
  subject: string;
  grade: number;
};

export function Overview() {
  const [chartData, setChartData] = useState<TransformedData[]>([]);
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
          .from("exam_results")
          .select(
            `
            total_score,
            exam_tbl(subject, exam_points)
          `
          )
          .eq("user_id", userId);

        if (error) throw error;

        const transformedData: TransformedData[] = (data as unknown as ExamResult[]).map((result) => {
          const { subject, exam_points } = result.exam_tbl;
          const grade = ((result.total_score / exam_points) * 100).toFixed(2);
          return { subject, grade: Number(grade) };
        });

        setChartData(transformedData);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, [userId]);

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
            className="fill-[#8E806A] dark:fill-[#508C9B]"
            radius={[4, 4, 0, 0]}
            barSize={50}
          />
          <ChartTooltip content={<ChartTooltipContent />} cursor={false} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
