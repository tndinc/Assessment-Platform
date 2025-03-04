"use client"
import { useEffect, useState } from "react"
import { BarChart3, Calendar, LineChart, TrendingUp, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PieChart as ReChartPieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts"
import { ChartTooltip } from "@/components/ui/chart"
import { TrendingDown, ArrowRight } from "./icons"
import {
  fetchExamSubmissions,
  fetchStudentFeedback,
  fetchStudentPerformanceData,
  fetchAnalyticsData,
  fetchUpcomingExams,
  fetchClassStatistics,
  fetchExams,
  fetchQuestions,
} from "@/lib/supabase"
import { StudentDetailsModal, type StudentDetailData } from "@/components/student-details-modal"

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

export function TeacherDashboardContent({ sortOrder, setSortOrder, students = [] }: { sortOrder: string, setSortOrder: (order: string) => void, students: Student[] }) {
  const [loading, setLoading] = useState(students.length === 0)
  const [studentData, setStudentData] = useState<StudentPerformance[]>([])
  const [analyticsData, setAnalyticsData] = useState({ weeklyAverages: [], topicPerformance: [] })
  const [upcomingExams, setUpcomingExams] = useState([])
  const [classStats, setClassStats] = useState(null)
  const [submissions, setSubmissions] = useState([])
  const [feedback, setFeedback] = useState([])
  const [selectedSection, setSelectedSection] = useState("all")
  const [exams, setExams] = useState([])
  const [questions, setQuestions] = useState([])
  const [percentageChange, setPercentageChange] = useState(0)
  const [engagementRateChange, setEngagementRateChange] = useState(0)

  // Add state for the student details modal
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<StudentDetailData | null>(null)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const performanceData = await fetchStudentPerformanceData()
        setStudentData(performanceData)

        const analytics = await fetchAnalyticsData()
        setAnalyticsData(analytics)

        const upcomingExamsData = await fetchUpcomingExams()
        setUpcomingExams(upcomingExamsData)

        const examsData = await fetchExams()
        setExams(examsData)

        const stats = await fetchClassStatistics()
        setClassStats(stats)

        // Fetch additional data for recommendations
        const submissionData = await fetchExamSubmissions()
        setSubmissions(submissionData)

        const feedbackData = await fetchStudentFeedback()
        setFeedback(feedbackData)

        // Fetch questions for subject areas
        const questionsData = await fetchQuestions()
        setQuestions(questionsData)

        // Calculate percentage change from last assessment
        if (performanceData && performanceData.length > 1) {
          const lastAssessment = performanceData[performanceData.length - 1].score
          const previousAssessment = performanceData[performanceData.length - 2].score
          if (previousAssessment !== 0) {
            const change = ((lastAssessment - previousAssessment) / previousAssessment) * 100
            setPercentageChange(change.toFixed(1))
          } else {
            setPercentageChange(0)
          }
        }

        // Calculate engagement rate change from last week
        if (analytics && analytics.weeklyAverages.length > 1) {
          const lastWeek = analytics.weeklyAverages[analytics.weeklyAverages.length - 1].engagementRate
          const previousWeek = analytics.weeklyAverages[analytics.weeklyAverages.length - 2].engagementRate
          if (previousWeek !== 0) {
            const change = ((lastWeek - previousWeek) / previousWeek) * 100
            setEngagementRateChange(change.toFixed(1))
          } else {
            setEngagementRateChange(0)
          }
        }
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }
  
    loadData()
  }, [])

  // Sort students based on selected order
  const sortedStudents = [...studentData].sort((a, b) => {
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

  // Get unique sections
  const sections = ["all", ...new Set(studentData.map((student) => student.section))]

  // Filter students based on selected section
  const filteredStudents =
    selectedSection === "all" ? sortedStudents : sortedStudents.filter((student) => student.section === selectedSection)

  // Performance distribution data for pie chart
  const performanceData = [
    { name: "Excellent (90-100%)", value: filteredStudents.filter((s) => s.score >= 90).length, color: "#10b981" },
    {
      name: "Good (75-89%)",
      value: filteredStudents.filter((s) => s.score >= 75 && s.score < 90).length,
      color: "#3b82f6",
    },
    {
      name: "Average (60-74%)",
      value: filteredStudents.filter((s) => s.score >= 60 && s.score < 75).length,
      color: "#f59e0b",
    },
    { name: "Needs Improvement (<60%)", value: filteredStudents.filter((s) => s.score < 60).length, color: "#ef4444" },
  ]

  // Calculate class average
  const classAverage =
    studentData.length > 0
      ? Math.round(studentData.reduce((sum, student) => sum + student.score, 0) / studentData.length)
      : 0

  // Calculate at-risk student count
  const atRiskCount = studentData.filter((s) => s.risk === "high").length

  // Calculate engagement rate
  const engagementRate =
    studentData.length > 0
      ? Math.round(studentData.reduce((sum, student) => sum + student.engagement, 0) / studentData.length)
      : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    )
  }

  if (studentData.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No student data available</p>
      </div>
    )
  }

  // Update the handleViewDetails function to fix the variable naming conflict
  const handleViewDetails = (student) => {
    // Find student submissions and feedback for detailed view
    const studentSubmissions = submissions
      .filter((sub) => sub.user_id === student.id)
      .map((sub) => {
        const exam = exams.find((e) => e.exam_id === sub.exam_id) || { exam_title: "Unknown Exam", subject: "Unknown" }
        const submissionFeedback = feedback.find((fb) => fb.exam_id === sub.exam_id) // Renamed from studentFeedback to submissionFeedback

        return {
          examId: sub.exam_id,
          examTitle: exam.exam_title,
          subject: exam.subject,
          submissionDate: new Date(sub.submission_date).toLocaleDateString(), // Format date properly
          score: submissionFeedback ? submissionFeedback.total_score : 0, // Use total_score from feedback
          maxScore: exam.exam_points || 100,
          timeSpent: sub.time_spent || 0,
          status: sub.status || "completed",
        }
      })

    // Get student feedback data with properly parsed metrics
    const studentFeedback = feedback
      .filter((fb) => fb.user_id === student.id)
      .map((fb) => {
        const exam = exams.find((e) => e.exam_id === fb.exam_id) || { exam_title: "Unknown Exam" }
        let metricsData = {}

        try {
          // Parse the metrics_data JSON string
          if (typeof fb.metrics_data === "string") {
            metricsData = JSON.parse(fb.metrics_data)
          } else {
            metricsData = fb.metrics_data || {}
          }
        } catch (e) {
          console.error("Error parsing metrics data:", e)
        }

        return {
          examId: fb.exam_id,
          examTitle: exam.exam_title,
          totalScore: fb.total_score || 0,
          maxScore: exam.exam_points || 100,
          feedbackDetails: fb.feedback_data || {},
          metricsData: metricsData,
        }
      })

    // Process performance by topic from metrics_data
    const topicPerformance = []
    const processedTopics = new Set()

    // Process student feedback to get scores by topic
    studentFeedback.forEach((fb) => {
      if (fb.metricsData) {
        Object.entries(fb.metricsData).forEach(([topic, data]) => {
          if (!processedTopics.has(topic)) {
            processedTopics.add(topic)
            // Calculate percentage score for the topic
            const score = Math.round((data.score / data.maxScore) * 100)
            topicPerformance.push({
              topic,
              score,
            })
          }
        })
      }
    })

    // Create detailed student data
    const detailedStudent = {
      ...student,
      examSubmissions: studentSubmissions,
      feedbackData: studentFeedback,
      performanceByTopic: topicPerformance,
      performanceOverTime: studentSubmissions
        .sort((a, b) => new Date(a.submissionDate).getTime() - new Date(b.submissionDate).getTime())
        .map((sub) => ({
          date: new Date(sub.submissionDate).toLocaleDateString("en-US", { month: "short" }),
          score: Math.round((sub.score / sub.maxScore) * 100),
        })),
    }

    setSelectedStudent(detailedStudent)
    setIsDetailsModalOpen(true)
  }

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Class Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor student performance and get insights to improve learning outcomes.
        </p>
      </div>

      {/* Overview cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Class Average</CardTitle>
            <LineChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{classAverage}%</div>
            <p className="text-xs text-muted-foreground">
              <span className={`flex items-center gap-1 ${percentageChange >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                <TrendingUp className="h-3 w-3" /> {percentageChange >= 0 ? '+' : ''}{percentageChange}% from last assessment
              </span>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">At-Risk Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{atRiskCount}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-500">
                {studentData.length > 0 ? Math.round((atRiskCount / studentData.length) * 100) : 0}% of class needs
                intervention
              </span>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{engagementRate}%</div>
            <p className="text-xs text-muted-foreground">
              <span className={`flex items-center gap-1 ${engagementRateChange >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                <TrendingUp className="h-3 w-3" /> {engagementRateChange >= 0 ? '+' : ''}{engagementRateChange}% from last week
              </span>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Assessments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingExams.length}</div>
            <p className="text-xs text-muted-foreground">Next: {upcomingExams[0]?.title ?? "No upcoming exams"}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-1">
        {/* Performance distribution */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Performance Distribution</CardTitle>
            <CardDescription>Student performance breakdown by score ranges</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ReChartPieChart>
                <Pie
                  data={performanceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={true}
                >
                  {performanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend />
                <ChartTooltip />
              </ReChartPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="students">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="students">Student Performance</TabsTrigger>
            <TabsTrigger value="engagement">Engagement Tracker</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-4">
            <Select value={selectedSection} onValueChange={setSelectedSection}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select section" />
              </SelectTrigger>
              <SelectContent>
                {sections.map((section) => (
                  <SelectItem key={section} value={section}>
                    {section === "all" ? "All Courses" : ` ${section}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
        </div>

        <TabsContent value="students" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Student Performance</CardTitle>
              <CardDescription>Detailed view of individual student performance and trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {filteredStudents.map((student) => (
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Engagement Tracker</CardTitle>
              <CardDescription>Monitor student engagement patterns and identify those who need support</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Low Engagement</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {filteredStudents.filter((s) => s.engagement < 50).length}
                      </div>
                      <p className="text-xs text-muted-foreground">Students below 50% engagement</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Declining Engagement</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {filteredStudents.filter((s) => s.trend === "down").length}
                      </div>
                      <p className="text-xs text-muted-foreground">Students with decreasing trends</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Inactive Students</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {
                          filteredStudents.filter(
                            (s) => s.lastActive.includes("week") || s.lastActive.includes("Never"),
                          ).length
                        }
                      </div>
                      <p className="text-xs text-muted-foreground">No activity in past 5 days</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="rounded-lg border">
                  <div className="p-3 border-b bg-muted/50">
                    <h3 className="font-medium">Students Needing Support</h3>
                  </div>
                  <div className="p-0">
                    <div className="grid divide-y">
                      {filteredStudents
                        .filter((s) => s.engagement < 70 || s.trend === "down")
                        .map((student) => (
                          <div key={student.id} className="flex items-center gap-4 p-4">
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
                              <h4 className="font-medium">{student.name}</h4>
                              <div className="text-sm text-muted-foreground">
                                Engagement: {student.engagement}% | Last active: {student.lastActive}
                              </div>
                            </div>
                            <div className="hidden md:block">
                              <div className="text-sm font-medium">Engagement Pattern</div>
                              <div className="flex items-center gap-1 text-sm">
                                {Array.from({ length: 5 }).map((_, i) => {
                                  let bgColor = "bg-gray-200"
                                  if (student.trend === "down") {
                                    bgColor = i < 2 ? "bg-emerald-200" : i < 4 ? "bg-amber-200" : "bg-red-200"
                                  } else if (student.trend === "up") {
                                    bgColor = i < 2 ? "bg-red-200" : i < 4 ? "bg-amber-200" : "bg-emerald-200"
                                  } else {
                                    bgColor = "bg-blue-200"
                                  }
                                  return <div key={i} className={`h-6 w-3 rounded-sm ${bgColor}`}></div>
                                })}
                              </div>
                            </div>
                            <div>
                              <Badge
                                variant={student.engagement < 50 ? "destructive" : "outline"}
                                className={
                                  student.engagement < 50 ? "" : "bg-amber-100 text-amber-800 hover:bg-amber-100"
                                }
                              >
                                {student.engagement < 50 ? "Critical" : "Needs Attention"}
                              </Badge>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Student Details Modal */}
      <StudentDetailsModal
        student={selectedStudent}
        open={isDetailsModalOpen}
        onOpenChange={setIsDetailsModalOpen}
        source="teacher"
      />
    </div>
  )
}

