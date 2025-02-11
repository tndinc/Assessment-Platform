"use client";
import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Loading from "../../../../../components/Loading";
import Image from "next/image"; // For rendering avatar images

const supabase = createClient();

interface CheatingLog {
  id: string;
  user_id: string;
  exam_id: number;
  full_name: string;
  avatar_url: string;
  copy_percentage: number;
  time_spent_away: number;
  cheat_risk_level: string;
  timestamp: string;
}

const CheatingLogs = () => {
  const [logs, setLogs] = useState<CheatingLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCheatingLogs = async () => {
      const { data, error } = await supabase
        .from("cheating_logs")
        .select(
          `id, user_id, exam_id, copy_percentage, time_spent_away, cheat_risk_level, timestamp, 
          profiles (full_name, avatar_url)`
        )
        .order("timestamp", { ascending: false });

      if (error) {
        console.error("Error fetching cheating logs:", error);
      } else {
        const formattedLogs = data.map((log) => ({
          id: log.id,
          user_id: log.user_id,
          exam_id: log.exam_id,
          full_name: log.profiles?.full_name || "Unknown",
          avatar_url: log.profiles?.avatar_url || "",
          copy_percentage: log.copy_percentage,
          time_spent_away: log.time_spent_away,
          cheat_risk_level: log.cheat_risk_level,
          timestamp: new Date(log.timestamp).toLocaleString(),
        }));

        setLogs(formattedLogs);
      }
      setLoading(false);
    };

    fetchCheatingLogs();
  }, []);

  if (loading) return <Loading />;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cheating Logs</CardTitle>
        <CardDescription>Monitor suspicious exam activities.</CardDescription>
      </CardHeader>
      <CardContent className="max-h-[500px] overflow-y-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Avatar</TableHead>
              <TableHead>Full Name</TableHead>
              <TableHead>Exam ID</TableHead>
              <TableHead>Copy %</TableHead>
              <TableHead>Time Away (s)</TableHead>
              <TableHead>Risk Level</TableHead>
              <TableHead>Timestamp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                {/* Avatar */}
                <TableCell>
                  {log.avatar_url ? (
                    <Image
                      src={log.avatar_url}
                      alt={log.full_name}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gray-300" />
                  )}
                </TableCell>

                {/* Full Name */}
                <TableCell className="font-medium">{log.full_name}</TableCell>

                {/* Exam ID */}
                <TableCell>{log.exam_id}</TableCell>

                {/* Copy Percentage */}
                <TableCell className="text-center">
                  {log.copy_percentage}%
                </TableCell>

                {/* Time Spent Away */}
                <TableCell className="text-center">
                  {log.time_spent_away}
                </TableCell>

                {/* Cheat Risk Level */}
                <TableCell
                  className={`text-center font-bold ${
                    log.cheat_risk_level === "High"
                      ? "text-red-500"
                      : log.cheat_risk_level === "Medium"
                      ? "text-yellow-500"
                      : "text-green-500"
                  }`}
                >
                  {log.cheat_risk_level}
                </TableCell>

                {/* Timestamp */}
                <TableCell className="text-gray-500">{log.timestamp}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default CheatingLogs;
