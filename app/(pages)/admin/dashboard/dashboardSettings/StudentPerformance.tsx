"use client"
import { useEffect, useState } from "react"
import { Search, TrendingUp } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TrendingDown, ArrowRight } from "./icons"
import { fetchStudentPerformanceData, fetchStudentDetails } from "@/lib/studentperformancesupabase"
import { StudentDetailsModal } from "./student-details-modal-studentperformance"

// Define the type for student performance data
interface StudentPerformance {
  id: any;
  name: any;
  section: any;
  avatar: any;
  score: number;
  engagement: number;
  risk: string;
  trend: string;
  lastActive: string;
}

export function StudentPerformance({ sortOrder, setSortOrder, students = [] }: { sortOrder: string; setSortOrder: (value: string) => void; students: Student[] }) {
  const [loading, setLoading] = useState(students.length === 0)
  const [studentData, setStudentData] = useState(students)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [studentDetails, setStudentDetails] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")

  // Fetch data if not provided as props
  useEffect(() => {
    async function loadData() {
      if (students.length === 0) {
        setLoading(true)
        try {
          const data = await fetchStudentPerformanceData()
          setStudentData(data)
        } catch (error) {
          console.error("Error loading student performance data:", error)
        } finally {
          setLoading(false)
        }
      }
    }

    loadData()
  }, [students])

  // Handle view details click
  const handleViewDetails = async (student) => {
    setSelectedStudent(student)
    setIsModalOpen(true)
    setDetailsLoading(true)

    try {
      const details = await fetchStudentDetails(student.id)
      setStudentDetails(details)
    } catch (error) {
      console.error("Error fetching student details:", error)
    } finally {
      setDetailsLoading(false)
    }
  }

  // Filter students based on search query
  const filteredStudents = studentData.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Sort students based on selected order
  const sortedStudents = [...filteredStudents].sort((a, b) => {
    if (sortOrder === "score-desc") return b.score - a.score
    if (sortOrder === "score-asc") return a.score - b.score
    if (sortOrder === "engagement-desc") return b.engagement - a.engagement
    if (sortOrder === "engagement-asc") return a.engagement - b.engagement
    if (sortOrder === "risk-high") {
      const riskOrder = { high: 0, medium: 1, low: 2 }
      return riskOrder[a.risk] - riskOrder[b.risk]
    }
    if (sortOrder === "risk-low") {
      const riskOrder = { high: 0, medium: 1, low: 2 }
      return riskOrder[b.risk] - riskOrder[a.risk]
    }
    return 0
  })

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Student Performance</h1>
        <p className="text-muted-foreground">Detailed view of individual student performance and trends</p>
      </div>

      <div className="flex justify-between mb-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>
        <Select value={sortOrder} onValueChange={setSortOrder}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="score-desc">Score: High to Low</SelectItem>
            <SelectItem value="score-asc">Score: Low to High</SelectItem>
            <SelectItem value="engagement-desc">Engagement: High to Low</SelectItem>
            <SelectItem value="engagement-asc">Engagement: Low to High</SelectItem>
            <SelectItem value="risk-high">Risk Level: High to Low</SelectItem>
            <SelectItem value="risk-low">Risk Level: Low to High</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Student Performance</CardTitle>
          <CardDescription>Detailed view of individual student performance and trends</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading student data...</p>
              </div>
            </div>
          ) : sortedStudents.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No student data available</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {sortedStudents.map((student) => (
                <div key={student.id} className="flex items-center gap-4 rounded-lg border p-3">
                  <Avatar>
                    <AvatarImage src={student.avatar} alt={student.name} />
                    <AvatarFallback>
                      {student.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium leading-none">{student.name}</p>
                      <Badge variant="secondary" className="text-xs">
                          {student.section}
                        </Badge>
                      {student.risk === "high" && (
                        <Badge variant="destructive" className="text-xs">
                          At Risk
                        </Badge>
                      )}
                      {student.risk === "medium" && (
                        <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-100 text-xs">
                          Watch
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <span className="mr-2">Last active: {student.lastActive}</span>
                      {student.trend === "up" && (
                        <span className="text-emerald-500 flex items-center text-xs">
                          <TrendingUp className="h-3 w-3 mr-1" /> Improving
                        </span>
                      )}
                      {student.trend === "down" && (
                        <span className="text-red-500 flex items-center text-xs">
                          <TrendingDown className="h-3 w-3 mr-1" /> Declining
                        </span>
                      )}
                      {student.trend === "stable" && (
                        <span className="text-blue-500 flex items-center text-xs">
                          <ArrowRight className="h-3 w-3 mr-1" /> Stable
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="hidden md:block">
                      <div className="text-sm font-medium mb-1">Score</div>
                      <div className="flex items-center">
                        <span
                          className={`text-sm font-semibold ${
                            student.score >= 90
                              ? "text-emerald-500"
                              : student.score >= 75
                                ? "text-blue-500"
                                : student.score >= 60
                                  ? "text-amber-500"
                                  : "text-red-500"
                          }`}
                        >
                          {student.score}%
                        </span>
                      </div>
                    </div>
                    <div className="hidden md:block">
                      <div className="text-sm font-medium mb-1">Engagement</div>
                      <div className="w-24">
                        <Progress value={student.engagement} className="h-2" />
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleViewDetails(student)}>
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Student Details Modal */}
      {selectedStudent && (
        <StudentDetailsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          student={selectedStudent}
          details={studentDetails}
          loading={detailsLoading}
        />
      )}
    </div>
  )
}