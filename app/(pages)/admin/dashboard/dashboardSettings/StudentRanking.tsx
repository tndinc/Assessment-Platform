"use client"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { TrendingUp } from "lucide-react"
import { TrendingDown, ArrowRight } from "./icons"
import { fetchStudentRankingsByExam } from "@/lib/supabase"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

const supabase = createClientComponentClient()

export function StudentRanking({ exams = [] }) {
  const [loading, setLoading] = useState(true)
  const [selectedExam, setSelectedExam] = useState("")
  const [examList, setExamList] = useState(exams)
  const [students, setStudents] = useState([])

  useEffect(() => {
    async function loadExams() {
      if (exams.length === 0) {
        setLoading(true)
        try {
          // This would be replaced with your actual fetch function
          const { data, error } = await supabase.from("exam_tbl").select("*")
          if (error) throw error
          setExamList(data)
          if (data.length > 0) {
            setSelectedExam(data[0].exam_id)
          }
        } catch (error) {
          console.error("Error loading exams:", error)
        } finally {
          setLoading(false)
        }
      } else {
        setExamList(exams)
        if (exams.length > 0) {
          setSelectedExam(exams[0].exam_id)
        }
        setLoading(false)
      }
    }

    loadExams()
  }, [exams])

  useEffect(() => {
    async function loadRankings() {
      if (selectedExam) {
        setLoading(true)
        try {
          const rankings = await fetchStudentRankingsByExam(selectedExam)
          setStudents(rankings)
        } catch (error) {
          console.error("Error loading student rankings:", error)
        } finally {
          setLoading(false)
        }
      }
    }

    loadRankings()
  }, [selectedExam])

  const handleExamChange = (value) => {
    setSelectedExam(value)
  }

  if (loading) {
    return (
      <div className="grid gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Student Ranking by Exam</h1>
          <p className="text-muted-foreground">Performance ranking of students based on exam results</p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading ranking data...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Student Ranking by Exam</h1>
        <p className="text-muted-foreground">Performance ranking of students based on exam results</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1 md:flex-initial">
          <Select value={selectedExam} onValueChange={handleExamChange}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Select exam" />
            </SelectTrigger>
            <SelectContent>
              {examList.map((exam) => (
                <SelectItem key={exam.exam_id} value={exam.exam_id}>
                  {exam.exam_title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Student Rankings</CardTitle>
          <CardDescription>
            Performance ranking for {examList.find((e) => e.exam_id === selectedExam)?.exam_title || "Selected Exam"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {students.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No student data available for this exam</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {students.map((student) => (
                <div key={student.id} className="flex items-center gap-4 rounded-lg border p-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 font-medium">
                    {student.rank}
                  </div>
                  <Avatar>
                    <AvatarImage src={student.avatar} alt={student.name} />
                    <AvatarFallback>
                      {student.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-medium">{student.name}</div>
                    <div className="text-sm text-muted-foreground">Score: {student.score}%</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {student.trend === "up" && (
                      <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                        <TrendingUp className="h-3 w-3 mr-1" /> Up {student.previousRank - student.rank}
                      </Badge>
                    )}
                    {student.trend === "down" && (
                      <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                        <TrendingDown className="h-3 w-3 mr-1" /> Down {student.rank - student.previousRank}
                      </Badge>
                    )}
                    {student.trend === "stable" && (
                      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                        <ArrowRight className="h-3 w-3 mr-1" /> No change
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

