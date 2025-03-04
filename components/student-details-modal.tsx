"use client"

import { useState } from "react"
import {
  AlertCircle,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  TrendingDown,
  TrendingUp,
} from "lucide-react"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts"

// Update the StudentDetailData type to match the data structure
export type StudentDetailData = {
  id: string
  name: string
  section: string
  avatar: string
  score: number
  engagement: number
  risk: string
  trend: string
  lastActive: string
  // Additional data for detailed view
  examSubmissions?: {
    examId: string
    examTitle: string
    subject: string
    submissionDate: string
    timeSpent: number
    status: string
  }[]
  cheatingLogs?: {
    examId: string
    examTitle: string
    copyPercentage: number
    timeSpentAway: number
    riskLevel: string
    timestamp: string
  }[]
  feedbackData?: {
    examId: string
    examTitle: string
    totalScore: number
    maxScore: number
    feedbackDetails: any
    metricsData: {
      [topic: string]: {
        score: number
        maxScore: number
      }
    }
  }[]
  performanceByTopic?: {
    topic: string
    score: number
  }[]
  performanceOverTime?: {
    date: string
    score: number
  }[]
}

interface StudentDetailsModalProps {
  student: StudentDetailData | null
  open: boolean
  onOpenChange: (open: boolean) => void
  source: "teacher" | "admin"
}

export function StudentDetailsModal({ student, open, onOpenChange, source }: StudentDetailsModalProps) {
  const [activeTab, setActiveTab] = useState("overview")

  if (!student) return null

  // Calculate risk color
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "high":
        return "text-red-500"
      case "medium":
        return "text-amber-500"
      case "low":
        return "text-emerald-500"
      default:
        return "text-blue-500"
    }
  }

  // Calculate score color
  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-emerald-500"
    if (score >= 75) return "text-blue-500"
    if (score >= 60) return "text-amber-500"
    return "text-red-500"
  }

  // Get trend icon
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-emerald-500" />
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  // Use actual performance by topic data from student
  const performanceByTopic = student.performanceByTopic || []

// Use actual performance over time data from student
const performanceOverTime = student.feedbackData?.map(feedback => {
  const submission = student.examSubmissions?.find(sub => sub.examId === feedback.examId)
  return {
    date: submission ? new Date(submission.submissionDate).toLocaleDateString() : "N/A",
    score: Math.round((feedback.totalScore / feedback.maxScore) * 100)
  }
}) || []

  // Use actual exam submissions
  const examSubmissions = student.examSubmissions || []

  // Use actual cheating logs
  const cheatingLogs = student.cheatingLogs || []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={student.avatar} alt={student.name} />
              <AvatarFallback>
                {student.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <span>{student.name}</span>
            <Badge variant="outline" className="ml-2">
              {student.section}
            </Badge>
            {student.risk === "high" && (
              <Badge variant="destructive" className="ml-2">
                At Risk
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Last active: {student.lastActive} | Overall Score:{" "}
            <span className={getScoreColor(student.score)}>{student.score}%</span>
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="exams">Exam History</TabsTrigger>
            {source === "admin" && <TabsTrigger value="cheating">Cheating Logs</TabsTrigger>}
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Overall Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${getScoreColor(student.score)}`}>{student.score}%</div>
                  <div className="flex items-center mt-1 text-sm">
                    {getTrendIcon(student.trend)}
                    <span className="ml-1">
                      {student.trend === "up" ? "Improving" : student.trend === "down" ? "Declining" : "Stable"}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Engagement</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{student.engagement}%</div>
                  <Progress value={student.engagement} className="h-2 mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Risk Level</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold capitalize ${getRiskColor(student.risk)}`}>{student.risk}</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {student.risk === "high"
                      ? "Needs immediate intervention"
                      : student.risk === "medium"
                        ? "Requires monitoring"
                        : "Performing well"}
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
  <CardHeader>
    <CardTitle>Recent Performance</CardTitle>
    <CardDescription>Student's performance in the most recent exams</CardDescription>
  </CardHeader>
  <CardContent>
    <div className="space-y-4">
      {student.feedbackData?.slice(0, 3).map((feedback) => {
        const submission = student.examSubmissions?.find((sub) => sub.examId === feedback.examId)
        return (
          <div key={feedback.examId} className="flex items-center justify-between border-b pb-3">
            <div>
              <p className="font-medium">{feedback.examTitle}</p>
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="h-3 w-3 mr-1" />
                {submission ? new Date(submission.submissionDate).toLocaleDateString() : "N/A"}
                <Clock className="h-3 w-3 ml-3 mr-1" />
                {submission ? `${Math.round(submission.timeSpent / 60)} min` : "N/A"}
              </div>
            </div>
            <div className="text-right">
              <p className={`font-bold ${getScoreColor(Math.round((feedback.totalScore / feedback.maxScore) * 100))}`}>
                {Math.round((feedback.totalScore / feedback.maxScore) * 100)}%
              </p>
              <p className="text-sm text-muted-foreground">
                {feedback.totalScore}/{feedback.maxScore} points
              </p>
            </div>
          </div>
        )
      })}

      {student.feedbackData?.length === 0 && (
        <p className="text-center py-2 text-muted-foreground">No exam submissions recorded</p>
      )}
    </div>
  </CardContent>
</Card>

            {source === "teacher" && (
              <Card>
                <CardHeader>
                  <CardTitle>Recommended Actions</CardTitle>
                  <CardDescription>Suggested interventions based on student performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {student.risk === "high" && (
                      <>
                        <li className="flex items-start">
                          <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                          <span>Schedule a one-on-one meeting to discuss performance concerns</span>
                        </li>
                        <li className="flex items-start">
                          <BookOpen className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
                          <span>Provide additional learning resources for topics with low scores</span>
                        </li>
                      </>
                    )}
                    {student.risk === "medium" && (
                      <>
                        <li className="flex items-start">
                          <FileText className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                          <span>Assign additional practice exercises for weak areas</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle2 className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
                          <span>Monitor progress weekly and provide feedback</span>
                        </li>
                      </>
                    )}
                    {student.risk === "low" && (
                      <>
                        <li className="flex items-start">
                          <Award className="h-5 w-5 text-emerald-500 mr-2 mt-0.5" />
                          <span>Provide advanced learning opportunities to maintain engagement</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle2 className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                          <span>Recognize achievements to reinforce positive performance</span>
                        </li>
                      </>
                    )}
                  </ul>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Exams Tab */}
        <TabsContent value="exams" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Exam History</CardTitle>
              <CardDescription>Complete history of student's exam submissions</CardDescription>
            </CardHeader>
            <CardContent>
              {examSubmissions.length === 0 ? (
                <p className="text-center py-4 text-muted-foreground">No exam submissions recorded</p>
              ) : (
                <div className="space-y-4">
                  {examSubmissions.map((submission) => {
                    const feedback = student.feedbackData?.find((fb) => fb.examId === submission.examId)
                    return (
                      <div
                        key={submission.examId}
                        className="flex flex-col md:flex-row md:items-center justify-between border-b pb-4"
                      >
                        <div>
                          <p className="font-medium">{submission.examTitle}</p>
                          <p className="text-sm text-muted-foreground">Subject: {submission.subject}</p>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(submission.submissionDate).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 mt-2 md:mt-0">
                        <div>
                          <p className="text-sm font-medium">Time Spent</p>
                          <p className="text-sm">{Math.round(submission.timeSpent / 60)} minutes</p>
                        </div>
                          <div>
                            <p className="text-sm font-medium">Status</p>
                            <Badge variant={submission.status === "completed" ? "outline" : "secondary"}>{submission.status}</Badge>
                          </div>
                          <div className="text-right">
                            {feedback ? (
                              <>
                                <p className={`font-bold ${getScoreColor(Math.round((feedback.totalScore / feedback.maxScore) * 100))}`}>
                                  {Math.round((feedback.totalScore / feedback.maxScore) * 100)}%
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {feedback.totalScore}/{feedback.maxScore} points
                                </p>
                              </>
                            ) : (
                              <p className="text-sm text-muted-foreground">No feedback available</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

          {/* Cheating Logs Tab - Only for Admin */}
          {source === "admin" && (
            <TabsContent value="cheating" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Cheating Detection Logs</CardTitle>
                  <CardDescription>Records of potential academic integrity issues</CardDescription>
                </CardHeader>
                <CardContent>
                  {cheatingLogs.length === 0 ? (
                    <p className="text-center py-4 text-muted-foreground">No cheating logs recorded</p>
                  ) : (
                    <div className="space-y-4">
                      {cheatingLogs.map((log, index) => (
                        <div
                          key={index}
                          className="flex flex-col md:flex-row md:items-center justify-between border-b pb-4"
                        >
                          <div>
                            <p className="font-medium">{log.examTitle}</p>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(log.timestamp).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="flex items-center gap-4 mt-2 md:mt-0">
                            <div>
                              <p className="text-sm font-medium">Copy %</p>
                              <p
                                className={`text-sm ${log.copyPercentage > 20 ? "text-red-500" : "text-muted-foreground"}`}
                              >
                                {log.copyPercentage}%
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Away Time</p>
                              <p className="text-sm">{log.timeSpentAway} min</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Risk Level</p>
                              <Badge
                                variant={
                                  log.riskLevel === "high"
                                    ? "destructive"
                                    : log.riskLevel === "medium"
                                      ? "outline"
                                      : "secondary"
                                }
                              >
                                {log.riskLevel}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Performance by Topic</CardTitle>
                  <CardDescription>Breakdown of performance across different subject areas</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  {performanceByTopic.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground">No topic performance data available</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <ReBarChart data={performanceByTopic}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="topic" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip labelStyle={{ color: "#000" }}/>
                        <Bar
                          dataKey="score"
                          fill="#3b82f6"
                          radius={[4, 4, 0, 0]}
                          label={{
                            position: "top",
                            formatter: (value) => `${value}%`,
                            fontSize: 12,
                          }}
                        />
                      </ReBarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Over Time</CardTitle>
                  <CardDescription>Trend of student's performance across assessments</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  {performanceOverTime.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground">No performance trend data available</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={performanceOverTime}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip labelStyle={{ color: "#000" }}/>
                        <Line
                          type="monotone"
                          dataKey="score"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>

            {source === "teacher" && (
              <Card>
                <CardHeader>
                  <CardTitle>Learning Insights</CardTitle>
                  <CardDescription>Insights based on student's performance data</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <div
                        className={`p-2 rounded-full mr-3 ${
                          student.trend === "up"
                            ? "bg-emerald-100"
                            : student.trend === "down"
                              ? "bg-red-100"
                              : "bg-blue-100"
                        }`}
                      >
                        {student.trend === "up" ? (
                          <TrendingUp className="h-5 w-5 text-emerald-600" />
                        ) : student.trend === "down" ? (
                          <TrendingDown className="h-5 w-5 text-red-600" />
                        ) : (
                          <CheckCircle2 className="h-5 w-5 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium">Performance Trend</h4>
                        <p className="text-sm text-muted-foreground">
                          {student.trend === "up"
                            ? "Student shows consistent improvement over time. Continue with current approach."
                            : student.trend === "down"
                              ? "Student's performance is declining. Consider intervention strategies."
                              : "Student's performance is stable. Consider challenging with advanced material."}
                        </p>
                      </div>
                    </div>

                    {performanceByTopic.length > 0 && (
                      <>
                        <div className="flex items-start">
                          <div className="p-2 rounded-full bg-amber-100 mr-3">
                            <BookOpen className="h-5 w-5 text-amber-600" />
                          </div>
                          <div>
                            <h4 className="font-medium">Learning Focus Areas</h4>
                            <p className="text-sm text-muted-foreground">
                              Based on topic performance, focus on strengthening{" "}
                              {performanceByTopic
                                .sort((a, b) => a.score - b.score)
                                .slice(0, 2)
                                .map((topic) => topic.topic)
                                .join(" and ")}
                              .
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start">
                          <div className="p-2 rounded-full bg-blue-100 mr-3">
                            <Award className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-medium">Strengths</h4>
                            <p className="text-sm text-muted-foreground">
                              Student excels in{" "}
                              {performanceByTopic
                                .sort((a, b) => b.score - a.score)
                                .slice(0, 1)
                                .map((topic) => topic.topic)
                                .join(", ")}
                              . Consider leveraging these strengths in group activities.
                            </p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
