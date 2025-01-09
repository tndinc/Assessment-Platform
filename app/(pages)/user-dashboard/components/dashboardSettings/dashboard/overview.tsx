"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const supabase = createClient();

interface ExamResult {
  total_score: number;
  exam_tbl: {
    subject: string;
    exam_points: number;
  };
}

interface ChartDataPoint {
  subject: string;
  grade: number;
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
        const { data, error } = (await supabase
          .from("exam_results")
          .select(
            `
            total_score,
            exam_tbl(subject, exam_points)
          `
          )
          .eq("user_id", userId)) as { data: ExamResult[] | null; error: any };

        if (error) throw error;
        if (!data) return;

        const transformedData = data.map((result) => ({
          subject: result.exam_tbl.subject,
          grade: Number(
            ((result.total_score / result.exam_tbl.exam_points) * 100).toFixed(
              2
            )
          ),
        }));

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
            className="fill-[#8E806A] dark:fill-[#526D82]"
            radius={[4, 4, 0, 0]}
            barSize={50}
          />
          <ChartTooltip content={<ChartTooltipContent />} cursor={false} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
